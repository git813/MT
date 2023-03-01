const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    email: { type: String, unique: true, required: true },
    name: { type: String },
    password: { type: String, required: true },
    role: { type: Number, default: 1 },
    accountImage: { type: String, default: "avatar-default.jpg" },
    isDisable: { type: Boolean, default: false },
    favouriteList: { type: Schema.Types.ObjectId, ref: "playlists" },
});
module.exports = mongoose.model("accounts", AccountSchema);
