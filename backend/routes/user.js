// Login and Signup Routes
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", (req, res, next) => {

    bcrypt.hash(req.body.password, 10).then((hashPassword) => {

        const user = new User({
            email: req.body.email,
            password: hashPassword
        });

        user.save().then((result) => {
            res.status(201).json({
                message: 'User created',
                result: result
            });
        })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            });

    });


});

router.post("/login", (req, res, next) => {
    console.log(req.body);

    let userFind = null;

    User.findOne({
        email: req.body.email
    }).then(user => {
        console.log(user);
        if (!user) {
            return res.status(401).json({
                message: "Auth failed."
            });
        }

        userFind = user;

        return bcrypt.compare(req.body.password, user.password)
    }).then((result) => {
        if (!result) {
            return res.status(401).json({
                message: "Auth failed."
            });

        }

        //valid password user authenticated..

        //Create new Token.
        const token = jwt.sign({ email: userFind.email, userId: userFind._id }, 'secret_this_should_be_longer',
            { expiresIn: '1h' });
        res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: userFind._id
        });
    }).catch(err => {
        console.log(err);
        return res.status(401).json({
            message: "Auth failed."
        });
    });
});

module.exports = router;