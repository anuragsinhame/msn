
const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // const post = req.body;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    // although 'req.userData.userId' is a string but during save, mongoose will convert it to object id
    creator: req.userData.userId
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
  })
    .catch(error => {
      res.status(500).json({
        message: 'Post Creation failed'
      });
    });
}

exports.editPost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    if (result.n) {
      res.status(200).json({ message: "Updated Post!" });
    } else {
      res.status(401).json({ message: "Not Authorized!" });
    }
  })
    .catch(error => {
      res.status(500).json({
        message: 'Couldn\'t update post'
      });
    });
}

exports.getAllPosts = (req, res) => {
  // const posts = [
  //     {id: 'fsfhsdo00', title: 'First Title from API', content: 'First Content from API'},
  //     {id: 'fsfhsdo01', title: 'Second Title from API', content: 'Second Content from API'},
  //     {id: 'fsfhsdo02', title: 'Third Title from API', content: 'Third Content from API'},
  //     {id: 'fsfhsdo03', title: 'Fourth Title from API', content: 'Fourth Content from API'},
  // ];

  // fetching pagination query parameters from URL
  const pageSize = +req.query.pageSize;   // Added + to convert the extracted string to number
  const currentPage = +req.query.currentPage;

  // console.log(req.query);

  let fetchedPosts;

  // getting all the posts
  const postQuery = Post.find();

  if (pageSize && currentPage) {
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching Post failed'
      });
    });
}

exports.getOnePost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post Not Found!!" })
    }
  })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching Post failed'
      });
    });
}

exports.deletePost = (req, res, next) => {
  // console.log(req.params.id);
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n) {
        res.status(200).json({ message: "Deleted successfully!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'Fetching Post failed'
      });
    });
}
