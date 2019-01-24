const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const postSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    postBody: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 400
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);

//Get all the post with customerId
router.get('/all/:id', (req, res) => {
    //Check for valid Mongoose ObjectId

});

module.exports.post = router;