const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var formidable = require("formidable");
var fs = require("fs");
const fetch = require("node-fetch");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const authenticateToken = require("../helpers/authentication");
const createTeam = require("../helpers/createTeam");

// Load User model
const User = require("../../models/User");
const Chat = require("../../models/Chat");
const Team = require("../../models/Team");
const Report = require("../../models/Report");

//AWS credentials
require("dotenv").config();
const AWS = require("@aws-sdk/client-s3");

// const { authenticate } = require("passport");
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const s3Client = new AWS.S3Client({
  credentials: {
    accessKeyId: ID,
    secretAccessKey: SECRET,
  },
});

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", register_func);
// @route POST api/users/login
// @desc Login to the application
// @access Public
router.post("/login", login);

router.get("/validate", authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

// @route POST api/users/update
// @desc Update the profile information of a sepcific user
// @access Public
router.post("/update", authenticateToken, update);

// @route POST api/users/list
// @desc Get a list of all users, within a specified starting and ending range
// @access Public
router.get("/list", authenticateToken, list_func);

// @route GET api/users/:user
// @desc Returns a user's profile
// @access Public
router.get("/:user", authenticateToken, getUser);

// @route GET api/users/checkForUpdates
// @desc returns info to logged-in users on what pages to check
// @access Public
router.get("/checkForUpdates/:user", authenticateToken, checkForUpdates);

// @route GET api/users/conciseInfo/:user
// @desc Get the name and profile picture of a user.
// @access Public
router.get("/conciseInfo/:user", authenticateToken, conciseInfo);

// @route POST api/users/:user/report
// @desc Report a user
// @access Public
router.post("/report", authenticateToken, reportUsers);

// @route POST api/users/:user/block
// @desc Block a user
// @access Public
router.post("/:user/block", authenticateToken, blockUser);

// @route POST api/users/:user/unblock
// @desc Unblock a user
// @access Public
router.post("/:user/unblock", authenticateToken, unblockUser);

// @route POST api/users/profile-picture
// @desc Update the profile picture of a specific user
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

router.get("/github/user", async (req, res) => {
  const api_url = "https://api.github.com/users/" + req.query.username;
  const response = await fetch(api_url);
  res.json(await response.json());
});

async function list_func(req, res) {
  // Parse query parameters
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
  let filters =
    req.query.filters === undefined ? {} : JSON.parse(req.query.filters);

  if (filters.name) {
    filters.name = { $regex: filters.name, $options: "i" };
  }
  if (filters.skills) {
    filters["profile.skills"] = { $all: [...filters.skills] };
    delete filters.skills;
  }
  if (filters.competitiveness) {
    filters["profile.competitiveness"] = filters.competitiveness;
    delete filters.competitiveness;
  }
  if (filters.roles) {
    filters["profile.roles"] = filters.roles;
    delete filters.roles;
  }

  var options = {
    skip: parseInt(req.query.page ?? 0) * pageSize,
    limit: pageSize,
  };
  try {
    const itemCount = await User.countDocuments(filters);
    const pages = Math.ceil(itemCount / pageSize);
    const data = await User.find(filters, {}, options);
    let list = [];
    for (const user of data) {
      let newUser = user.toObject();
      newUser.email = undefined;
      newUser.password = undefined;
      newUser.reachable = !user.blockList || !user.blockList.includes(req.user);
      newUser.blockList = undefined;
      list.push(newUser);
    }
    var result = {
      list,
      pages,
    };
    return res.json(result);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
}

async function login(req, res) {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    errors.isValid = false;
    return res.json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    // Check if user exists
    if (!user) {
      return res.json({ email: "Email not found", isValid: false });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ password: "Password incorrect" });
    }
    // User matched, Create JWT Payload
    const payload = {
      id: user.id,
      name: user.name,
    };
    // Sign token
    const token = await jwt.sign(payload, process.env.SECRETORKEY, {
      expiresIn: 31556926, // 1 year in seconds
    });
    return res.json({
      success: true,
      token: "Bearer " + token,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
}

async function register_func(req, res) {
  // Form validation
  let { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    errors.isValid = false;
    return res.json(errors);
  }
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({ email: "Email already exists", isValid: false });
    }
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      //profile: {
      //profilePictureUrl: "https://ui-avatars.com/api/?name=" + req.body.name,
      //},
    });
    // Hash password before saving in database
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;
    const savedUser = await newUser.save();
    const payload = {
      id: savedUser._id,
      name: savedUser.name,
    };
    // Sign token
    const token = await jwt.sign(payload, process.env.SECRETORKEY, {
      expiresIn: 31556926, // 1 year in seconds
    });
    await createTeam({ body: { user: savedUser._id } }, res);
    res.json({
      success: true,
      token: "Bearer " + token,
      admitted: true,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
}

async function s3Upload(file_name, files, res) {
  const split_name = file_name[0].split(".");
  let extension = split_name[split_name.length - 1];
  if (extension === "jpg") {
    extension = "jpeg";
  }
  var params = {
    Bucket: BUCKET_NAME,
    Key: file_name[0], // File name in S3 = user's name
    Body: fs.createReadStream(files.file[0].filepath),
    ContentType: `image/${extension}`,
  };
  const uploadCommand = new AWS.PutObjectCommand(params);
  if (files.file.size > 10_000_000) {
    return res.sendStatus(413);
  }
  await s3Client.send(uploadCommand);
  //console.log(response)
  const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${file_name}`;
  res.json({ url });
}

async function clear_old_pictures(req) {
  const id = req.user;
  const profile_pic_link = req.body.update.profile?.profilePictureUrl;
  if (!profile_pic_link) {
    console.log("No profile pic link");
    return;
  }
  const folder_name = id + "/";
  var params = {
    Bucket: BUCKET_NAME,
    Prefix: folder_name,
  };
  try {
    const command = new AWS.ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    let listOfObjects = data.Contents;
    let newimg = profile_pic_link.replace(
      "https://" + BUCKET_NAME + ".s3.amazonaws.com/",
      ""
    );
    for (let i = 1; i < data.KeyCount; i++) {
      let nameOfFile = listOfObjects[i].Key;
      if (nameOfFile !== newimg) {
        const deleteParams = { Bucket: BUCKET_NAME, Key: nameOfFile };
        const deleteCommand = new AWS.DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
      }
    }
  } catch (err) {
    console.log(err, err.stack);
  }
}

async function update(req, res) {
  const profile = req.body.update;
  const options = {
    upsert: true,
  };

  //Clear all old s3 files
  await clear_old_pictures(req);
  if (profile.name?.length > 1000) {
    return res.sendStatus(413);
  }
  for (const key in profile.profile) {
    if (profile.profile[key]?.length > 1000) {
      return res.sendStatus(413);
    }
  }
  // Find user by email
  // User.findByIdAndUpdate( id, {$set: profile}, options).then(data => {
  // Look at mongoose docs
  try {
    await User.updateOne({ _id: req.user }, { $set: profile }, options);
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}

async function getUser(req, res) {
  User.findById(req.params.user, (err, user) => {
    if (err) {
      return res.sendStatus(400);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    user.email = undefined;
    user.password = undefined;
    user.__v = undefined;
    user.date = undefined;
    if (req.params.user !== req.user) {
      req.blockList = undefined;
    }
    return res.json(user);
  });
}

async function conciseInfo(req, res) {
  if (!req.user) {
    return res.sendStatus(403);
  }
  User.findById(req.params.user, (err, user) => {
    if (err) {
      return res.sendStatus(400);
    }
    if (!user) {
      return res.sendStatus(404);
    }
    return res.json({
      name: user.name,
      profilePictureUrl: user.profile?.profilePictureUrl,
    });
  });
}

async function reportUsers(req, res) {
  try {
    const newReport = new Report({
      contents: req.body.contents,
      reported: [],
      reporter: req.user,
      chatOrigin: req.body.chatID,
    });
    for (const userID of req.body.reported) {
      const user = await User.findById(userID);
      if (user) {
        newReport.reported.push(userID);
      }
    }
    if (newReport.reported.length === 0) {
      return res.sendStatus(404);
    }
    const saved = await newReport.save();
    return res.json(saved);
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }
}

async function blockUser(req, res) {
  try {
    const user = await User.findById(req.params.user);
    if (!user) {
      return res.sendStatus(404);
    }
    await User.updateOne(
      { _id: req.user },
      { $push: { blockList: req.params.user } },
      { upsert: true }
    );
    return res.json({
      success: true,
    });
  } catch (err) {
    res.sendStatus(500);
  }
}

async function unblockUser(req, res) {
  try {
    const user = User.findById(req.params.user);
    if (!user) {
      return res.sendStatus(404);
    }
    await User.updateOne(
      { _id: req.user },
      { $pull: { blockList: req.params.user } }
    );
    return res.json({
      success: true,
    });
  } catch (err) {
    return res.sendStatus(500);
  }
}

async function checkForUpdates(req, res) {
  try {
    if (req.params.user !== req.user) {
      throw new Error("nope");
    }
    let out = { browse: false, chat: false };
    const myTeam = await Team.findOne({ users: req.user });
    if (myTeam?.mergeRequests?.length > 0) {
      out.browse = true;
    }
    const chats = await Chat.find({ users: req.user });
    for (let i = 0; !out.chat && i < chats.length; i++) {
      out.chat = !chats[i].readBy.map((e) => String(e)).includes(req.user);
    }
    return res.json(out);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
}

module.exports = {
  router,
  login,
  register_func,
  update,
  list_func,
  s3Upload,
  getUser,
  conciseInfo,
  reportUsers,
  blockUser,
  unblockUser,
  checkForUpdates,
};
