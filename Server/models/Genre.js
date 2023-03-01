const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    genreName: { type: String, require: true, unique: true },
});

module.exports = mongoose.model("genres", GenreSchema);
