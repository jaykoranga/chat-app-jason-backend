const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const createJwt = require("../createJwt");
const bcrypt = require("bcrypt");

// Registering a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Some fields are empty");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    pic,
  });

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      jwt: createJwt(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User creation failed");
  }
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      jwt: createJwt(user._id),
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error("Invalid email or password");
  }
});

// Get all users (except the logged-in user)
const getAllUsers = asyncHandler(async (req, res) => {
  console.log("The user logged in is:", req.user);

  const search = req.query.name || "";

  const allUsers = await User.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
    _id: { $ne: req.user.id },
  }).select("name email pic"); // Do NOT select the password

  res.status(200).json(allUsers);
});

module.exports = { registerUser, login, getAllUsers };
