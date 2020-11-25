const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/usersAuth')

const app = express();

mongoose.connect('mongodb://localhost:27017/msn', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// Allowing access to image folder
app.use('/images', express.static(path.join('images/')));

// Setting CORS
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, authorization');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes)

module.exports = app;