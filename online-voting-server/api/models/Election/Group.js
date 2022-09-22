const mongoose = require("mongoose");

const ElectionGroupSchema = new mongoose.Schema(
    {
        user_email: {
            type: String,
            required: true,
        },

        group_id: {
            type: String,
            required: true,
        },
        
        title: {
            type: String,
            length: 20,
            required: true,
        },

        // election create korle update hobe
        election_id: {
            type: String,
            default: "",
            // required: true,
        },

        // Group Members
        // members: [String],

        description: {
            type: String,
        },

        // vote dile update hobe
        votes: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            default: "inactive",
        },
        
        logo: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ElectionGroup", ElectionGroupSchema);