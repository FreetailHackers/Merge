const users = require("../routes/api/users");
const mockingoose = require("mockingoose");
const User = require("../models/User");
require("dotenv").config();
const AWSMock = require("aws-sdk");
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
var fs = require("fs");

jest.mock("aws-sdk", () => {
  const mS3Instance = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn(),
    listObjectsV2: jest.fn().mockReturnThis(),
  };
  return {
    S3: jest.fn(() => mS3Instance),
  };
});

describe("Login route tests", () => {
  test("Basic Login Test", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "PasswordWith1And!",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn(
      {
        password: "PasswordWith1And!",
      },
      "findOne"
    );

    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.login(req, res);
    expect(res.object.success == true);
  });
  test("Email is not registered", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn(null, "findOne");

    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.login(req, res);
    expect(res.object).toEqual({
      email: "Email not found",
      isValid: false,
    });
  });
});
describe("Register route tests", () => {
  test("Email is already registered", async () => {
    const req = {
      body: {
        email: "ThisIsMyEmail@gmail.com",
        password: "This1sMyPassword!",
        password2: "This1sMyPassword!",
        name: "ThisIsMyName",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");

    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.register_func(req, res);
    expect(res.object).toEqual({
      email: "Email already exists",
      isValid: false,
    });
  });
});

describe("Register Validation Tests", () => {
  test("Name + Email field is required", async () => {
    const req = {
      body: {
        email: "",
        password: "This1sMyPassword!",
        password2: "This1sMyPassword!",
        name: "",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.register_func(req, res);
    expect(res.object).toEqual({
      name: "Name field is required",
      email: "Email field is required",
      isValid: false,
    });
  });
  test("Email is invalid + Passwords are required", async () => {
    const req = {
      body: {
        email: "testnoatsymbol",
        password: "",
        password2: "",
        name: "ThisIsMyName",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.register_func(req, res);
    expect(res.object).toEqual({
      email: "Email is invalid",
      password: "Password field is required",
      password2: "Confirm password field is required",
      isValid: false,
    });
  });
  test("Password must have 8 characters", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "This",
        password2: "This",
        name: "ThisIsMyName",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.register_func(req, res);
    expect(res.object).toEqual({
      password: "Password must be at least 8 characters",
      isValid: false,
    });
  });
  test("Passwords must have capital letter", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "this1smypassword!",
        password2: "this1smypassword!",
        name: "ThisIsMyName",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.register_func(req, res);
    expect(res.object).toEqual({
      password: "Password must have 1 capital letter",
      isValid: false,
    });
  });
  test("Password must have a symbol + Passwords must match", async () => {
    const req = {
      body: {
        email: "test@gmail.com",
        password: "This1sMyPassword",
        password2: "This1sMyPassword!",
        name: "ThisIsMyName",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.register_func(req, res);
    expect(res.object).toEqual({
      password: "Password must have a symbol",
      password2: "Passwords must match",
      isValid: false,
    });
  });
});

describe("Login Validation Tests", () => {
  test("Email + Password field is required", async () => {
    const req = {
      body: {
        email: "",
        password: "",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.login(req, res);
    expect(res.object).toEqual({
      password: "Password field is required",
      email: "Email field is required",
      isValid: false,
    });
  });
  test("Email is invalid", async () => {
    const req = {
      body: {
        email: "test@gmail.",
        password: "test",
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "findOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.login(req, res);
    expect(res.object).toEqual({
      email: "Email is invalid",
      isValid: false,
    });
  });
});

describe("Profile Picture Route Tests", () => {
  test("Upload Profile Picture basic test", async () => {
    // const fd = new FormData()
    let folder_name = "testfoldername/";
    let file_name = folder_name + "MOCK.png";
    var files = {
      file: {
        filepath: "./tests/MOCK.png",
        mimetype: "image/png",
      },
    };
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };

    const mS3Instance = new AWSMock.S3();
    mS3Instance
      .upload({
        Bucket: BUCKET_NAME,
        Key: file_name, // File name in S3 = user's name
        Body: fs.createReadStream(files.file.filepath),
        ContentType: files.file.mimetype,
      })
      .promise.mockResolvedValueOnce({ Location: "THIS IS UR URL" });
    await users.s3Upload(file_name, files, res);
    expect(res.url == "THIS IS UR URL");
  });
});

describe("update router tests", () => {
  test("Basic Update Router Tests", async () => {
    const req = {
      body: {
        id: "1",
        update: {
          profile: {
            school: "ut",
            class: "CS",
            intro: "ello",
          },
        },
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn({}, "updateOne");
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
      sendStatus: function (input) {
        this.object = input;
      },
    };

    const mS3Instance = new AWSMock.S3();
    mS3Instance
      .listObjectsV2({
        Bucket: BUCKET_NAME,
        Prefix: "RANDOM FODLER NAME",
      })
      .promise.mockResolvedValueOnce("THIS WORKED");
    await users.update(req, res);
    expect(res.object).toEqual(403);
  });
});
describe("List users ", () => {
  test("Basic list users route test", async () => {
    "{_id: 123456}";
    const dataSent = new Date(2020, 1, 1);
    const req = {
      query: {
        start: 0,
        limit: 0,
        filters: '{"_id": 123456}',
        dateSent: dataSent,
      },
    };
    // start to implement mockingoose to use dummy data
    mockingoose(User).toReturn(
      [
        {
          email: "test",
          password: "dummy",
        },
      ],
      "find"
    );
    const res = {
      object: {},
      json: function (input) {
        this.object = input;
      },
    };
    await users.list_func(req, res);
    expect(res.object.dateSent).toEqual(dataSent);
  });
});
