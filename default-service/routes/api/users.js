const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateProfileUpdateInput = require("../../validation/profileupdate");

// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/list
// @desc Get a list of all users, within a specified starting and ending range
// @access Public
router.post("/login", (req, res) => {
  // Form validation'
  //console.log("line 61")
  // console.log(req)

  //checks if email or password is empty
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    console.log("stopped at 68")
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  console.log("email: " + email)
  console.log("pass: " + password)
  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});


// @route POST api/users/update
// @desc Update the profile information of a sepcific user
// @access Public
router.post("/update", (req, res) => {
  // Form validation
  // console.log(req)
  // const { errors, isValid } = validateProfileUpdateInput(req.body);
  
  // // Check validation
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }
    
  const id = req.body.id;
  console.log('test')
  console.log(req.body)
  // var props;
  // for (prop in req.body) {
  //   if (prop !== 'id') {
  //     props[prop] = req.body[prop];
  //   }
  // }
  // console.log(props)
  console.log('test')
  const profile = req.body.update;
  const options = {
    // new: true,
    upsert: true,
    // useFindAndModify: false,
  }
  console.log(id, options, { $set: profile })

  // Find user by email
  // User.findByIdAndUpdate( id, {$set: profile}, options).then(data => {
  User.updateOne( { _id: id }, { $set: profile }, options).then(data => {
    console.log(data)
    res.json({
      success: true,
    });
  });
});
  
  
// @route POST api/users/update
// @desc Update the profile information of a sepcific user
// @access Public
router.get("/list", (req, res) => {
  if (req.query.filters) var filters = JSON.parse(req.query.filters);
  if (filters._id) filters._id = mongoose.Types.ObjectId(filters._id)
  var options = {
    skip: parseInt(req.query.start),
    limit: parseInt(req.query.limit),
  }
  // console.log(filters);
  // console.log(options);
  // console.log(props);

  User.find(filters, {}, options, (err, data) => {
    var result = data;
    if (req.query.dateSent) {
      result = {
        dateSent: req.query.dateSent,
        list: data,
      }
    }
    res.json(result);
  });
});
// @route POST api/users/profile-picture
// @desc Update the profile picture for user
// @access Public
// router.post("/profile-picture")
module.exports = router;
