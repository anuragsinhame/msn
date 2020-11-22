const express = require('express');
const multer = require('multer');

const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid Mime Type');
        if(isValid){
            error = null;
        }
        cb(error, './images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extension = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + extension);
    }
});

router.post('', multer({storage}).single('image'), (req,res,next) =>{
    const url = req.protocol + '://' + req.get('host');
    // const post = req.body;
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename
    });
    // console.log(post);
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully',
            post: {
                ...createdPost,         // copying the createdPost object in post, next gen JS Feature
                id: createdPost._id     // as we need id, not _id, so here we can overwrite the copied object
            }
        });
    });
});


router.put('/:id', multer({storage}).single('image'), (req,res,next) => {
    let imagePath = req.body.imagePath;
    if(req.file){
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        imagePath
    });
    Post.updateOne({_id: req.params.id}, post).then(result => {
        console.log(result);
        res.status(200).json({message: "Updated Post!"}); 
    });
});

router.get('', (req,res) => {
    // const posts = [
    //     {id: 'fsfhsdo00', title: 'First Title from API', content: 'First Content from API'},
    //     {id: 'fsfhsdo01', title: 'Second Title from API', content: 'Second Content from API'},
    //     {id: 'fsfhsdo02', title: 'Third Title from API', content: 'Third Content from API'},
    //     {id: 'fsfhsdo03', title: 'Fourth Title from API', content: 'Fourth Content from API'},
    // ];

    // fetching pagination query parameters from URL
    const pageSize = +req.query.pageSize;   // Added + to convert the extracted string to number
    const currentPage = +req.query.currentPage;

    console.log(req.query);

    let fetchedPosts;

    // getting all the posts
    const postQuery = Post.find();

    if(pageSize && currentPage){
        postQuery
            .skip(pageSize * (currentPage - 1))    // skip method will skip the first n number of records
            .limit(pageSize);
    }

    // Getting all the posts
    postQuery
    .then(documents => {
        fetchedPosts = documents;
        return Post.count();
    })
    .then(count => {
        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: fetchedPosts,
            maxPosts: count
        });
    });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if(post){
            res.status(200).json(post);
        }else{
            res.status(404).json({message: "Post Not Found!!"})
        }
    });
});

router.delete('/:id',(req,res,next) =>{
    // console.log(req.params.id);
    Post.deleteOne({_id: req.params.id})
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Post is deleted!'
        });
    })
    .catch(err => {
        console.log('Some Error Occurred in deleting the post');
    })
});

module.exports = router;