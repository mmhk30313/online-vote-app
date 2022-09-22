const mongoose = require("mongoose");

const ElectionSchema = new mongoose.Schema(
    {
        user_email: {
            type: String,
            required: true,
        },
        
        election_id: {
            type: String,
            required: true,
            unique: true,
        },

        title: {
            type: String,
            length: 20,
            required: true,
        },


        description: {
            type: String,
        },

        // election_groups
        candidates: [String],

        status: {
            type: String,
            default: "inactive",
        },
        
        image: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Election", ElectionSchema);