const express = require("express");
const router = express.Router();
const Song = require("../models/Song");
const path = require("path");
const axios = require("axios");
const rootPath = __dirname.replace("routes", "");
const songFolder = "public/song/";
const imageSongFolder = "public/images/song";
const recommendServerPath = "http://localhost:8000";
const fs = require("fs");
const multer = require("multer");
const Artist = require("../models/Artist");
const verifyToken = require("../middleware/auth");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname == "songFile") cb(null, path.join(rootPath, songFolder));
        else cb(null, path.join(rootPath, imageSongFolder));
    },
    filename: function (req, file, cb) {
        const songName = req.body.songName.replace("");
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, req.body.songName + "-" + uniqueSuffix);
    },
});

const fileFilter = function (req, file, cb) {
    if (file.fieldname == "songFile") {
        // Accept images only
        if (!file.originalname.match(/\.(mp3|m4a)$/)) {
            req.fileValidationError = "Vui lòng chọn file âm thanh! (mp3/m4a)";
            return cb(null, false);
        }
        cb(null, true);
    }
    if (file.fieldname == "songImage") {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
            req.fileValidationError = "Vui lòng chọn file hình ảnh! (JPG/JPGE/PNG)";
            return cb(null, false);
        }
        cb(null, true);
    }
};

const uploadSong = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 15 * 1024 * 1024 } }).fields([
    { name: "songFile", maxCount: 1 },
    { name: "songImage", maxCount: 1 },
]);

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit || 0;
        const page = req.query.page || 0;
        if (req.query.genres && req.query.genres != "") {
            Song.find({ genres: { $all: req.query.genres } })
                .sort({ songName: 1 })
                .populate("artists")
                .populate("genres")
                .limit(limit)
                .skip(page * limit)
                .exec((err, songs) => res.send(songs));
        } else if (req.query.artists && req.query.artists != "") {
            Song.find({ artists: { $all: req.query.artists } })
                .sort({ songName: 1 })
                .populate("artists")
                .populate("genres")
                .limit(limit)
                .skip(page * limit)
                .exec((err, songs) => res.send(songs));
        } else {
            const songName = req.query.songName || "";
            Song.find({
                songName: { $regex: new RegExp(songName, "i") },
                // $text: { $search: songName },
            })
                .sort({ songName: 1 })
                .populate("artists")
                .populate("genres")
                .limit(limit)
                .skip(page * limit)
                .exec((err, songs) => {
                    res.send(songs);
                });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error });
    }
});

router.get("/general", async (req, res) => {
    try {
        const limit = req.query.limit || 0;
        const filter = req.query.filter;
        const page = req.query.page || 0;
        let sortCondition = "songName";
        let asc = 1;
        if (filter == "top-listen") sortCondition = "playTime";
        if (filter == "new") sortCondition = "releaseDate";
        if (sortCondition != "songName") asc = -1;
        Song.find({})
            .sort({ [sortCondition]: asc })
            .populate("artists")
            .populate("genres")
            .limit(limit)
            .skip(page * limit)
            .exec((err, songs) => {
                res.send(songs);
            });
    } catch (error) {
        console.log(error);
        res.send([]);
    }
});

router.post("/", verifyToken, async (req, res) => {
    if (req.account.role == 0)
        uploadSong(req, res, function (err) {
            try {
                console.log(req.files);
                if (err instanceof multer.MulterError) {
                    console.log(err);
                    err.code == "LIMIT_FILE_SIZE"
                        ? res.json({ success: false, message: "File quá lớn" })
                        : res.json({ success: false, message: err.code });
                    return;
                }
                if (req.fileValidationError) {
                    res.json({ success: false, message: req.fileValidationError });
                }
                if (!req.files || !req.files.songFile) {
                    res.json({ success: false, message: "Lỗi file âm thanh" });
                    return;
                }

                const songImage = req.files.songImage ? req.files.songImage[0].filename : "defaultSongImage.png";

                //save info
                const newSong = new Song({
                    songName: req.body.songName,
                    songImage: songImage,
                    songLink: req.files.songFile[0].filename,
                    artists: req.body.artists[0] == "" ? [] : req.body.artists,
                    genres: req.body.genres[0] == "" ? [] : req.body.genres,
                    releaseDate: req.body.releaseDate,
                });
                newSong.save().then((song, err) => {
                    if (err) res.json({ success: false, message: "Lỗi" });
                    else res.json({ success: true, message: "Song uploaded", song });
                });
            } catch (error) {
                fs.unlinkSync(path.join(rootPath, imageSongFolder, req.files.songImage[0].filename));
                fs.unlinkSync(path.join(rootPath, songFolder, req.files.songFile[0].filename));
                res.json({ success: false, message: error });
            }
        });
    else res.json({ success: false, message: "Tài khoản không đủ quyền" });
});

router.patch("/:slug", verifyToken, async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    uploadSong(req, res, function (err) {
        try {
            if (err instanceof multer.MulterError) {
                console.log(err);
                err.code == "LIMIT_FILE_SIZE"
                    ? res.json({
                          success: false,
                          message: err.field == "songFile" ? "File nhạc quá lớn" : "File ảnh quá lớn",
                      })
                    : res.json({ success: false, message: err.code });
                return;
            }
            if (req.fileValidationError) {
                res.json({ success: false, message: req.fileValidationError });
            }

            if (!req.body.songName || req.body.songName.trim() == "")
                return res.json({ success: false, message: "Tên bài hát không được để trống" });
            let newSongInfo = {
                songName: req.body.songName,
                artists: req.body.artists[0] == "" ? [] : req.body.artists,
                genres: req.body.genres[0] == "" ? [] : req.body.genres,
                releaseDate: req.body.releaseDate,
            };
            if (req.files.songImage) newSongInfo = { ...newSongInfo, songImage: req.files.songImage[0].filename };
            if (req.files.songFile) newSongInfo = { ...newSongInfo, songLink: req.files.songFile[0].filename };

            Song.findOneAndUpdate({ _id: req.params.slug }, newSongInfo, null, (err, song) => {
                if (song) {
                    res.json({ success: true, message: "Cập nhật thông tin bài hát thành công" });
                    if (req.files.songImage && song.songImage != "defaultSongImage.png")
                        fs.unlinkSync(path.join(rootPath, imageSongFolder, song.songImage));
                    if (req.files.songFile) fs.unlinkSync(path.join(rootPath, songFolder, song.songLink));
                } else {
                    console.log(err);
                    res.json({ success: false, message: "Có lỗi xảy ra" });
                    fs.unlinkSync(path.join(rootPath, imageSongFolder, req.files.songImage[0].filename));
                    fs.unlinkSync(path.join(rootPath, songFolder, req.files.songFile[0].filename));
                }
            });
        } catch (error) {
            res.json({ success: false, message: "Có lỗi xảy ra" });
            fs.unlinkSync(path.join(rootPath, imageSongFolder, req.files.songImage[0].filename));
            fs.unlinkSync(path.join(rootPath, songFolder, req.files.songFile[0].filename));
        }
    });
    return;
});

router.get("/csv", verifyToken, async (req, res) => {
    try {
        if (req.account.role == 0)
            Song.find({}, { songLink: 1, genres: 1, artists: 1 })
                .sort({ songLink: 1 })
                .populate("genres")
                .populate("artists")
                .exec((err, songs) => {
                    const fastcsv = require("fast-csv");
                    const fs = require("fs");
                    const ws = fs.createWriteStream("../ServerRec/songs.csv");

                    const csvFile = fastcsv.format({ headers: false, quote: "" });
                    for (let song of songs) {
                        let genresFormat = song.genres.map((genre) => {
                            return genre.genreName;
                        });
                        genresFormat = genresFormat.toString().replaceAll(",", "|");
                        genresFormat = genresFormat.toString().replaceAll(" ", "");

                        let artistsFormat = song.artists.map((artist) => {
                            return artist.artistName;
                        });
                        artistsFormat = artistsFormat.toString().replaceAll(",", "|");
                        artistsFormat = artistsFormat.toString().replaceAll(" ", "");

                        csvFile.write({
                            songLink: song.songLink,
                            genres: genresFormat + "|" + artistsFormat,
                        });
                    }
                    csvFile.pipe(ws);
                    res.json({ success: true });
                });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error });
    }
});

router.get("/rec-all", async (req, res) => {
    try {
        const songLink = req.query.songLink;
        const top = req.query.top;
        axios
            .get(recommendServerPath + `/api/rec-all?songLink=${songLink}&top=${top}`)
            .then((resa) => {
                let result;
                if (resa.data != "fail") result = resa.data.split(",");
                if (result) {
                    Song.find({ songLink: { $in: result } })
                        .populate("artists")
                        .populate("genres")
                        .exec((err, songs) => {
                            if (songs) {
                                res.send(songs);
                            } else {
                                res.json({ success: false, message: "db fail" });
                            }
                        });
                } else {
                    res.status(204);
                    res.json({ success: false, message: "recommend fail" });
                }
            })
            .catch((error) => {
                res.json({ success: false, message: "axios fail" });
            });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error });
    }
});

router.get("/count", async (req, res) => {
    try {
        if (req.query.genres && req.query.genres != "")
            Song.count({ genres: { $all: req.query.genres } }).then((count) => {
                res.json({ success: true, count: count });
            });
        else if (req.query.artist && req.query.artist != "") {
            Artist.findOne({ artistLink: req.query.artist }).then((artist) => {
                if (artist)
                    Song.count({ artists: { $all: artist._id } }).then((count) => {
                        res.json({ success: true, count: count });
                    });
            });
        } else {
            const songName = req.query.songName || "";
            Song.count({ songName: { $regex: new RegExp(songName, "i") } }).then((count) => {
                res.json({ success: true, count: count });
            });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, count: 0 });
    }
});

router.get("/:slug", async (req, res) => {
    try {
        Song.findOne({ songLink: req.params.slug }).exec((err, song) => {
            if (song)
                Song.findOneAndUpdate(
                    { songLink: req.params.slug },
                    { playTime: song.playTime + 1 },
                    null,
                    (err, song) => res.sendFile(path.join(rootPath, songFolder, song.songLink))
                );
            else res.json({ success: false, message: "not found song" });
        });
    } catch (error) {
        console.log(error);
    }
});

router.get("/getlink/:slug", async (req, res) => {
    Song.findOne({ _id: req.params.slug }).exec((err, song) => {
        if (song) {
            res.json({ success: true, songLink: song.songLink });
        } else res.json({ success: false, message: "not found song" });
    });
});

router.delete("/", async (req, res) => {
    let listId = req.query.songId;
    if (typeof listId == "string") listId = new Array(listId);
    if (!listId) return res.json({ success: false, message: "Danh sách đã chọn rỗng" });
    let error;
    for (let i = 0; i < listId.length; i++)
        Song.findByIdAndRemove(listId[i]).exec((err, song) => {
            console.log(song);
            if (err) {
                error = err.code;
            } else {
                if (song)
                    if (song.songImage != "defaultSongImage.png")
                        fs.unlinkSync(path.join(rootPath, imageSongFolder, song.songImage));
                fs.unlinkSync(path.join(rootPath, songFolder, song.songLink));
            }
        });
    if (error) {
        res.json({ success: false, message: error });
    } else res.json({ success: true, message: "Xoá bài hát thành công" });
});

module.exports = router;
