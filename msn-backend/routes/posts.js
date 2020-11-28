const express = require('express');

const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/fileUpload');
const PostsController = require('../controllers/posts');

const router = express.Router();



router.post(
  '',
  // checkAuth custom middleware
  checkAuth,
  // multer middleware added
  fileUpload,
  PostsController.createPost
  );


router.put(
  '/:id',
  // checkAuth custom middleware
  checkAuth,
  // multer middleware added
  fileUpload,
  PostsController.editPost
  );

router.get('', PostsController.getAllPosts);

router.get('/:id', PostsController.getOnePost);

router.delete('/:id', checkAuth, PostsController.deletePost);

module.exports = router;