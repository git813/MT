const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const Schema = mongoose.Schema;
mongoose.plugin(slug);

const ArtistSchema = new Schema({
    artistName: { type: String, require: true, index: "text" },
    artistImage: String,
    artistLink: { type: String, slug: "artistName", unique: true },
});

module.exports = mongoose.model("artists", ArtistSchema);
