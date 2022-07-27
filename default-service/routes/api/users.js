const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
var formidable = require("formidable");
var fs = require('fs');

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateProfileUpdateInput = require("../../validation/profileupdate");

// Load User model
const User = require("../../models/User");

//AWS credentials
const AWS = require('aws-sdk')
const ID = "AKIARX7Y5NJLCNITEIMW";
const SECRET = "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"
const BUCKET_NAME = "merge2022"
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});
// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
  console.log("got to register")
  let { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    errors.isValid = false
    return res.json(errors);
  }
 
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {

      return res.json({ email: "Email already exists", isValid: false });
    } else {
      var newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,

      });
      console.log("NEW USER PRINT")
      console.log(newUser)
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
         
          console.log(user)
          newUser
            .save()
            .then(user => {
              let temp = {
                status:  {
                  admitted: true
                }
              }
              console.log("user: " + user)
              const payload = {
                id: user._id,
                name: user.name
              };
              console.log("id : " + payload.id)
              console.log("name : " + payload.name)
              // Sign token
             jwt.sign(
                payload,
                keys.secretOrKey,
                {
                  expiresIn: 31556926 // 1 year in seconds
                },
                (err, token) => {
                  console.log("error" + err)
                  console.log("token: " + token)
                  res.json({
                    success: true,
                    token: "Bearer " + token,
                    user: temp
                  });
                  console.log("generated token: " + token)
                }
              );
            })
            .catch(err => console.log(err));
        });
      });
      console.log("NEW USER PRINT")
      console.log(newUser)
    }

  })
 
  console.log("finished registering??")
});

// @route POST api/users/list
// @desc Get a list of all users, within a specified starting and ending range
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  // console.log(req)
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    errors.isValid = false
    return res.json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.json({ email: "Email not found" , isValid : false});
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
        return res.json({ password: "Password incorrect" });
      }
    });
  });
});


// @route POST api/users/update
// @desc Update the profile information of a sepcific user
// @access Public
router.post("/update", async (req, res) => {
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
  console.log(profile)
  console.log(id, options, { $set: profile })


  //Clear all old s3 files
  
  profile_pic_link = req.body.update.profile.profilePictureUrl
  folder_name = id + "/"
  var params = {
    Bucket: BUCKET_NAME,
    Prefix: id + "/"
  };
  await s3.listObjectsV2(params, async function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else  {
      listOfObjects = data.Contents
      newimg = profile_pic_link.replace("https://merge2022.s3.amazonaws.com/", "")
      console.log(newimg)
      for(let i = 1; i < data.KeyCount; i++) {
        nameOfFile = listOfObjects[i].Key
        console.log(nameOfFile)
        if (nameOfFile !== newimg) {
          var params = {  Bucket: BUCKET_NAME, Key: nameOfFile};
          await s3.deleteObject(params).promise()
        }
      }
      console.log(data);
    }      
  }).promise();
  
  console.log(req.body.update)
  // Find user by email
  // User.findByIdAndUpdate( id, {$set: profile}, options).then(data => {
  // Look at mongoose docs
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
    // We probably don't want to send over everyone's passwords...
    for (let user of data) {
      user.password = undefined;
    }
    var result = data;
    if (req.query.dateSent) {
      result = {
        dateSent: req.query.dateSent,
        list: data,
      }
    }
    console.log(result)
    res.json(result);
  });
});

// @route POST api/users/list
// @desc Update the profile information of a sepcific user
// @access Public
router.post("/profile-picture", (req, res) => {
 const form = new formidable.IncomingForm();
 form.parse(req, async (err, fields, files) => {
//we are passing the form's fields that the user had submitted to a new 
//object in the line below
const {folder_name, file_name} = fields;
// Setting up S3 upload parameters
  var params = {
    Bucket: BUCKET_NAME,
    Key: folder_name //creating folder in s3
  };

  //Uploading folder to bucket, waiting for upload before continuing
  await s3.putObject(params).promise();   
  // Setting up S3 upload parameters
  params = {
    Bucket: BUCKET_NAME,
    Key: file_name, // File name in S3 = user's name
    Body: fs.createReadStream(files.file.filepath),
    ContentType: files.file.mimetype
  };
  // Uploading files to the bucket, waiting for upload before continuing
  var promise = await s3.upload(params).promise();
  res.json({url: promise.Location})
})
});

module.exports = router;
