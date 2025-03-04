const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Joi = require("joi");

// Define the User Schema

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [100, "Name cannot be longer than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (value) {
          // Simple regex for email validation
          return /\S+@\S+\.\S+/.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "seller"],
    
     
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("User", userSchema);