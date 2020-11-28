const express = require('express');

// Importing UserAuth Controller functions
const UserController = require('../controllers/userAuth');

const router = express.Router();

router.post('/signup', UserController.createUser);

router.post('/login', UserController.login);

module.exports = router;
