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
    // group id
    group_id: {
        type: String,
        default: ""
    },
    // Vote dile update hobe but candidate khetre create er time update hobe
    election_id: {
        type: String,
        max: 14,
        default: ""
    },
    // Vote dile update hobe
    voting_status: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    remember_token: {
        type: String,
        default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);