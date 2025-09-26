const express = require("express");
const mongoose = require("mongoose");
const User = require("../Models/User");

const router = express.Router();

// Used for login
router.post("/login", async (req, res) => {
  try {
    const { mail, password } = req.body;
    const user = await User.findOne({ mail : mail });
    if (!user) {
      res.status(400).json({ message: "User not Found" });
    }
    if (user.password == password) {
      res.status(200).json({ message: "Successfully Logged" ,userId:user._id});
    }
  } catch (error) {
    res.status(400).json({ message: "Error in Login", error: error.message,user:req.body });
  }
});

// Signup url Api to Register the User
router.post("/signup", async (req, res) => {
  try {
    const { name, mail, password } = req.body;
    const user = await User.findOne({ mail: mail });
    console.log(user);
    
    if (user) {
      res.status(400).json({ message: "User Already Exist"});
    }
    const data = new User({name, mail, password});
    await data.save();
    res.status(201).json({message:"User Successfully Added"});
  } catch (error) {
    res.status(400).json({ message: "Error in Sign up", error: error.message });
  }
});

module.exports = router;
