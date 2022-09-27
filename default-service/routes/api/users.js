const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
var formidable = require("formidable");
var fs = require("fs");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// const validateProfileUpdateInput = require("../../validation/profileupdate");

// Load User model
const User = require("../../models/User");

//AWS credentials
require("dotenv").config();
const AWS = require("aws-sdk");
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});
// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => register_func(req, res));
// @route POST api/users/list
// @desc Get a list of all users, within a specified starting and ending range
// @access Public
router.post("/login", async (req, res) => login(req, res));

// @route POST api/users/update
// @desc Update the profile information of a sepcific user
// @access Public
router.post("/update", async (req, res) => update(req, res));

// @route POST api/users/update
// @desc Update the profile information of a sepcific user
// @access Public
router.get("/list", (req, res) => list_func(req, res));

async function list_func(req, res) {
  // Parse query parameters
  let filters =
    req.query.filters === undefined ? {} : JSON.parse(req.query.filters);
  if (filters._id) {
    filters._id = mongoose.Types.ObjectId(filters._id);
  }
  var options = {
    skip: Math.max(0, parseInt(req.query.start)),
    limit: Math.max(0, parseInt(req.query.limit)),
  };
  User.find(filters, {}, options)
    .then((data) => {
      // We probably don't want to send over everyone's PII...
      for (let user of data) {
        user.email = undefined;
        user.password = undefined;
      }
      var result = data;

      if (req.query.dateSent) {
        result = {
          dateSent: req.query.dateSent,
          list: data,
        };
      }

      return res.json(result);
    })
    .catch((err) => console.log(err));
}

// @route POST api/users/list
// @desc Update the profile information of a sepcific user
// @access Public
router.post("/profile-picture", async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.json({ err: err.message });
    else {
      const { file_name } = fields;
      await s3Upload(file_name, files, res);
    }
  });
});

function login(req, res) {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    errors.isValid = false;
    return res.json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email })
    .then((user) => {
      // Check if user exists
      if (!user) {
        return res.json({ email: "Email not found", isValid: false });
      }
      // Check password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
          };

          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926, // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token,
              });
            }
          );
        } else {
          return res.json({ password: "Password incorrect" });
        }
      });
    })
    .catch((err) => console.log(err));
}

function register_func(req, res) {
  // Form validation
  let { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    errors.isValid = false;
    return res.json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.json({ email: "Email already exists", isValid: false });
    } else {
      var newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              const payload = {
                id: user._id,
                name: user.name,
              };
              // Sign token
              jwt.sign(
                payload,
                keys.secretOrKey,
                {
                  expiresIn: 31556926, // 1 year in seconds
                },
                (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token,
                    user: {
                      status: {
                        admitted: true,
                      },
                    },
                  });
                }
              );
            })
            .catch((err) => console.log(err));
        });
      });
    }
  });
}
async function s3Upload(file_name, files, res) {
  var params = {
    Bucket: BUCKET_NAME,
    Key: file_name, // File name in S3 = user's name
    Body: fs.createReadStream(files.file.filepath),
    ContentType: files.file.mimetype,
  };
  var promise = await s3.upload(params).promise();
  res.json({ url: promise.Location });
}

async function clear_old_pictures(req) {
  const id = req.body.id;
  const profile_pic_link = req.body.update.profile.profilePictureUrl;
  const folder_name = id + "/";
  var params = {
    Bucket: BUCKET_NAME,
    Prefix: folder_name,
  };
  await s3
    .listObjectsV2(params, async function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        let listOfObjects = data.Contents;
        let newimg = profile_pic_link.replace(
          "https://" + BUCKET_NAME + ".s3.amazonaws.com/",
          ""
        );
        for (let i = 1; i < data.KeyCount; i++) {
          let nameOfFile = listOfObjects[i].Key;
          if (nameOfFile !== newimg) {
            var params = { Bucket: BUCKET_NAME, Key: nameOfFile };
            await s3.deleteObject(params).promise();
          }
        }
      }
    })
    .promise();
}

function update(req, res) {
  const id = req.body.id;
  const profile = req.body.update;
  const options = {
    upsert: true,
  };

  //Clear all old s3 files
  clear_old_pictures(req);

  // Find user by email
  // User.findByIdAndUpdate( id, {$set: profile}, options).then(data => {
  // Look at mongoose docs
  User.updateOne({ _id: id }, { $set: profile }, options)
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch((err) => console.log(err));
}
module.exports = {
  router,
  login,
  register_func,
  update,
  list_func,
  s3Upload,
};
