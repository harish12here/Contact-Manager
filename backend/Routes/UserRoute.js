const express = require("express");
const mongoose = require("mongoose");
const User = require("../Models/User");

const router = express.Router();

// Used for login
router.post("/login", async (req, res) => {
  try {
    const { mail, password } = req.body;
    if (!mail || !password) {
      return res.status(400).json({ message: "Please provide both email/username and password" });
    }

    const inputStr = String(mail).trim();
    const escapedInput = inputStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // First try finding user by email (case-insensitive)
    let user = await User.findOne({ mail: { $regex: `^${escapedInput}$`, $options: "i" } });
    
    // If not found by email, try finding by name (case-insensitive)
    if (!user) {
      user = await User.findOne({ name: { $regex: `^${escapedInput}$`, $options: "i" } });
    }

    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }
    if (String(user.password) !== String(password)) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    return res.status(200).json({ message: "Successfully Logged", userId: user._id });
  } catch (error) {
    return res.status(400).json({ message: "Error in Login", error: error.message });
  }
});

// Signup url Api to Register the User
router.post("/signup", async (req, res) => {
  try {
    const { name, mail, password } = req.body;
    if (!name || !mail || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const cleanMail = mail.trim().toLowerCase();
    const cleanName = name.trim();

    const existingUser = await User.findOne({
      $or: [
        { mail: { $regex: `^${cleanMail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User Already Exist" });
    }
    const data = new User({ name: cleanName, mail: cleanMail, password });
    await data.save();
    return res.status(201).json({ message: "User Successfully Added" });
  } catch (error) {
    return res.status(400).json({ message: "Error in Sign up", error: error.message });
  }
});

module.exports = router;
