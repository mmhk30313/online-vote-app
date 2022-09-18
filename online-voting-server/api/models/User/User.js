const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    user_name: {
        type: String,
        min: 5,
        max: 20,
        default: "",
    },
    email: {
        type: String,
        max: 14,
        length: 14,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        max: 15,
        length: 15,
        default: ""
    },
    password: {
        type: String,
        min: 5,
        max: 14,
        length: 14,
    },
    address: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        max: 10,
        length: 10,
        default: ""
    },
    designation: {
        type: String,
        max: 18,
        length: 18,
    },
    description: {
        type: String,
    },
    avatar: {
        type: String,
        default: ""
    },
    user_id: {
        type: String,
        max: 14,
        unique: true,
    },
    role_id: {
        type: Number,
        default: 2,
    },
    user_role: {
        type: String,
        max: 14,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    email_verified_at: {
        type: String,
        default: ""
    },
    is_active: {
        type: Boolean,
        default: false
    },
    remember_token: {
        type: String,
        default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);