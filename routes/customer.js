const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1024
    }
});

customerSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, name: this.firstName }, 'secret123');
    return token;
}

const Customer = mongoose.model('Customer', customerSchema);

//Get customer detail with id
router.get('/:id', async (req, res) => {
    const valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        res.status(400).send(`Customer id ${req.params.id} is not valid`);
        return;
    }
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        res.status(404).send(`Customer with id ${req.params.id} is not present`);
        return;
    }
    res.send(_.pick(customer, ['firstName']));
});

//Register new customer
router.post('/register', async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    let customer = await Customer.findOne({ email: req.body.email });
    if (customer) {
        res.status(400).send('User Already Registered');
        return;
    }
    customer = new Customer({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(customer.password, salt);
    const result = await customer.save();
    const token = customer.generateAuthToken();
    res.send(token);
});

//Login customer
router.post('/login', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer) {
        res.status(404).send('User not found.');
        return;
    }
    const validPassword = await bcrypt.compare(req.body.password, customer.password);
    if (!validPassword) {
        res.status(400).send('Invalid Password.');
        return;
    }
    const token = customer.generateAuthToken();
    res.send(token);
});

function validateCustomer(customer) {
    const schema = {
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(3).max(50).required().email(),
        password: Joi.string().min(3).max(1024).required()
    }
    const result = Joi.validate(customer, schema);
    return result;
}

function validateLogin(login) {
    const schema = {
        email: Joi.string().min(3).max(50).required().email(),
        password: Joi.string().min(3).max(1024).required()
    }
    const result = Joi.validate(login, schema);
    return result;
}

module.exports.customer = router;