const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SongSchema = new Schema({
    songName: { type: String, require: true, index: "text" },
    songImage: String,
    songLink: { type: String, require: true },
    artists: [{ type: Schema.Types.ObjectId, ref: "artists" }],
    genres: [{ type: Schema.Types.ObjectId, ref: "genres" }],
    releaseDate: Date,
    uploadDate: { type: Number, default: new Date().getTime() },
    playTime: { type: Number, default: 0 },
});

module.exports = mongoose.model("songs", SongSchema);
