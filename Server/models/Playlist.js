const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
    ownerId: Schema.Types.ObjectId,
    playlistName: { type: String, require: true },
    playlistImage: String,
    playlistSong: [{ type: Schema.Types.ObjectId, ref: "songs" }],
});
module.exports = mongoose.model("playlists", PlaylistSchema);
