const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  mail: {
    unique: true,
    type: String,
    required: true,
  },
  password: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
