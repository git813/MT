const express = require("express");
const axios = require("axios");
const router = express.Router();
const Song = require("../models/Song");
const path = require("path");
const rootPath = __dirname.replace("routes", "");
const verifyToken = require("../middleware/auth");
const imageAccountFolder = "public/images/account";
const imagePlaylistFolder = "public/images/playlist";
const recommendServerPath = "http://localhost:8000";
const Playlist = require("../models/Playlist");
const Account = require("../models/Account");
const fastcsv = require("fast-csv");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcrypt");

const storagePlaylist = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(rootPath, imagePlaylistFolder));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, "playlist" + req.body.playlistName + "-" + uniqueSuffix);
    },
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(rootPath, imageAccountFolder));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, "user" + req.account._id + "-" + uniqueSuffix);
    },
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = "Vui lòng chọn file hình ảnh! (JPG/JPGE/PNG)";
        return cb(null, false);
    }
    cb(null, true);
};

const accountImageUpload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single("accountImage");

const playlistImageUpload = multer({
    storage: storagePlaylist,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single("playlistImage");

const updateCsv = (idAccount, idPlaylist) => {
    Playlist.find({ _id: idPlaylist })
        .populate({
            path: "playlistSong",
            populate: ["genres", "artists"],
        })
        .exec((err, playlist) => {
            if (err) return;
            else {
                const ws = fs.createWriteStream(`../ServerRec/user${idAccount}.csv`);
                const csvFile = fastcsv.format({ headers: false, quote: "" });
                let gaa = "";
                for (let song of playlist[0].playlistSong) {
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
                    if (genresFormat.length > 1) gaa += genresFormat + "|";
                    if (artistsFormat.length > 1) gaa += artistsFormat + "|";
                }
                csvFile.write({
                    songLink: idAccount,
                    genres: gaa,
                });
                csvFile.pipe(ws);
            }
        });
};

router.get("/infavour/:slug", verifyToken, async (req, res) => {
    const songId = req.params.slug;
    Playlist.findOne({ _id: req.account.favouriteList }).then((favouriteList) => {
        if (favouriteList) {
            const index = favouriteList.playlistSong.findIndex((id) => {
                return id == songId;
            });
            if (index != -1) res.json({ success: true, state: true });
            else res.json({ success: true, state: false });
        } else {
            res.json({ success: false, state: false, message: "Không tìm thấy danh sách" });
        }
    });
});

router.patch("/favour/add", verifyToken, async (req, res) => {
    const songId = req.query.songId;
    Playlist.findOne({ _id: req.account.favouriteList }).then((favouriteList) => {
        if (favouriteList) {
            const index = favouriteList.playlistSong.findIndex((id) => {
                return id == songId;
            });
            if (index != -1) res.json({ success: true, message: "Thêm bài hát thành công" });
            else {
                Playlist.findOneAndUpdate(
                    { _id: req.account.favouriteList },
                    { playlistSong: [...favouriteList.playlistSong, songId] },
                    null,
                    (err, playlist) => {
                        if (err) res.json({ success: false, message: "Lỗi" });
                        else {
                            updateCsv(req.account._id, req.account.favouriteList);
                            res.json({ success: true, message: "Thêm bài hát thành công" });
                        }
                    }
                );
            }
        } else {
            res.status(203).json({ success: false, message: "Không tìm thấy danh sách" });
        }
    });
});

router.delete("/favour/remove", verifyToken, async (req, res) => {
    const songId = req.query.songId;
    Playlist.findOne({ _id: req.account.favouriteList }).then((favouriteList) => {
        if (favouriteList) {
            const index = favouriteList.playlistSong.findIndex((id) => {
                return id == songId;
            });
            if (index == -1) res.json({ success: true, message: "Xoá bài hát thành công" });
            else {
                const newList = favouriteList.playlistSong
                    .slice(0, index)
                    .concat(favouriteList.playlistSong.slice(index + 1, favouriteList.playlistSong.length));
                Playlist.findOneAndUpdate(
                    { _id: req.account.favouriteList },
                    { playlistSong: newList },
                    null,
                    (err, playlist) => {
                        if (err) res.json({ success: false, message: "Lỗi" });
                        else {
                            updateCsv(req.account._id, req.account.favouriteList);
                            res.json({ success: true, message: "Xoá bài hát thành công" });
                        }
                    }
                );
            }
        } else {
            res.status(203).json({ success: false, message: "Không tìm thấy danh sách" });
        }
    });
});

router.get("/profile", verifyToken, async (req, res) => {
    Account.findOne({ _id: req.account._id }).then((account) => {
        if (account) {
            res.json({
                success: true,
                accountProfile: { email: account.email, name: account.name, accountImage: account.accountImage },
            });
        } else {
            res.status(203).json({ success: false, message: "Không tìm thấy thông tin tài khoản" });
        }
    });
});

router.patch("/profile", verifyToken, async (req, res) => {
    accountImageUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            err.code == "LIMIT_FILE_SIZE"
                ? res.json({ success: false, message: "File quá lớn" })
                : res.json({ success: false, message: err.code });
            return;
        }
        if (req.fileValidationError) {
            res.json({ success: false, message: req.fileValidationError });
        }

        const accountImage = req.file ? req.file.filename : req.account.accountImage;
        const name = req.body.name;
        Account.findOneAndUpdate(
            { _id: req.account._id },
            { accountImage: accountImage, name: name },
            null,
            (err, account) => {
                if (err) res.json({ success: false, message: "Lỗi" });
                else {
                    res.json({ success: true, message: "Cập nhật thông tin thành công" });
                    if (accountImage != req.account.accountImage && req.account.accountImage != "avatar-default.jpg")
                        fs.unlinkSync(path.join(rootPath, imageAccountFolder, req.account.accountImage));
                    else console.log("no file");
                }
            }
        );
    });
});

router.patch("/password", verifyToken, async (req, res) => {
    console.log(req.body);
    if (req.body.password != req.body.repassword) return res.json({ success: false, message: "Mật khẩu không khớp" });
    if (req.body.password.length < 6) return res.json({ success: false, message: "Mật khẩu không hợp lệ" });
    if (!req.body.currentPassword) return res.json({ success: false, message: "Mật khẩu không đúng" });
    const result = await bcrypt.compare(req.body.currentPassword, req.account.password);
    if (result) {
        const newPassword = await bcrypt.hash(req.body.password, 10);
        Account.findOneAndUpdate({ _id: req.account._id }, { password: newPassword }, null, (err, account) => {
            if (err) res.json({ success: false, message: "Lỗi" });
            else {
                res.json({ success: true, message: "Đổi mật khẩu thành công" });
            }
        });
    } else res.json({ success: false, message: "Mật khẩu không đúng" });
    return;
});

router.post("/playlist", verifyToken, async (req, res) => {
    Account.findOne({ _id: req.account._id }).then((account) => {
        if (account) {
            playlistImageUpload(req, res, function (err) {
                console.log(req.body);
                if (err instanceof multer.MulterError) {
                    err.code == "LIMIT_FILE_SIZE"
                        ? res.json({ success: false, message: "File quá lớn" })
                        : res.json({ success: false, message: err.code });
                    return;
                }
                if (req.fileValidationError) {
                    res.json({ success: false, message: req.fileValidationError });
                }
                if (!req.body.playlistName || req.body.playlistName.trim() == "")
                    return res.json({ success: false, message: "Tên playlist không được để trống" });
                const playlistImage = req.file ? req.file.filename : "defaultPlaylist.png";
                console.log(playlistImage);
                const playlist = new Playlist({
                    ownerId: req.account._id,
                    playlistName: req.body.playlistName,
                    playlistImage: playlistImage,
                });
                playlist.save((err, playlist) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        res.json({ success: true, message: "Tạo Playlist thành công" });
                    }
                });
            });
        } else {
            res.json({ success: false, message: "Không tìm thấy thông tin tài khoản" });
        }
    });
});

router.patch("/playlist/:slug", verifyToken, async (req, res) => {
    Account.findOne({ _id: req.account._id }).then((account) => {
        if (account) {
            try {
                playlistImageUpload(req, res, function (err) {
                    console.log(req.body);
                    if (err instanceof multer.MulterError) {
                        err.code == "LIMIT_FILE_SIZE"
                            ? res.json({ success: false, message: "File quá lớn" })
                            : res.json({ success: false, message: err.code });
                        return;
                    }
                    if (req.fileValidationError) {
                        res.json({ success: false, message: req.fileValidationError });
                    }
                    if (!req.body.playlistName || req.body.playlistName.trim() == "")
                        return res.json({ success: false, message: "Tên playlist không được để trống" });
                    console.log(req.file);
                    let newPlaylistInfo = {
                        playlistName: req.body.playlistName,
                    };
                    if (req.file) newPlaylistInfo = { ...newPlaylistInfo, playlistImage: req.file.filename };
                    Playlist.findOneAndUpdate({ _id: req.params.slug }, newPlaylistInfo, null, (err, playlist) => {
                        if (playlist) {
                            res.json({ success: true, message: "Cập nhật thông tin bài hát thành công" });
                            if (req.file && playlist.playlistImage != "defaultPlaylist.png")
                                fs.unlinkSync(path.join(rootPath, imagePlaylistFolder, playlist.playlistImage));
                        } else {
                            console.log(err);
                            res.json({ success: false, message: "Có lỗi xảy ra" });
                            fs.unlinkSync(path.join(rootPath, imagePlaylistFolder, req.file.filename));
                        }
                    });
                });
            } catch (error) {
                res.json({ success: false, message: "Có lỗi xảy ra" });
                fs.unlinkSync(path.join(rootPath, imagePlaylistFolder, req.file.filename));
            }
        } else {
            res.json({ success: false, message: "Không tìm thấy thông tin tài khoản" });
        }
    });

    return;
});

router.patch("/playlist/add/:slug", verifyToken, async (req, res) => {
    const songId = req.body.songId;
    Playlist.findOne({ _id: req.params.slug }).then((playlist) => {
        if (playlist) {
            const index = playlist.playlistSong.findIndex((id) => {
                return id == songId;
            });
            if (index != -1) res.json({ success: true, message: "Đã thêm bài hát vào Playlist" });
            else {
                Playlist.findOneAndUpdate(
                    { _id: req.params.slug },
                    { playlistSong: [...playlist.playlistSong, songId] },
                    null,
                    (err, playlist) => {
                        if (err) res.json({ success: false, message: "Lỗi" });
                        else {
                            if (playlist) res.json({ success: true, message: "Đã thêm bài hát vào Playlist" });
                            else res.json({ success: false, message: "Không tìm thấy Playlist" });
                        }
                    }
                );
            }
        } else {
            res.json({ success: false, message: "Không tìm thấy Playlist" });
        }
    });
});

router.patch("/playlist/remove/:slug", verifyToken, async (req, res) => {
    const songId = req.body.songId;
    Playlist.findOne({ _id: req.params.slug }).then((playlist) => {
        if (playlist) {
            const index = playlist.playlistSong.findIndex((id) => {
                return id == songId;
            });
            if (index == -1) res.json({ success: true, message: "Xoá bài hát thành công" });
            else {
                const newList = playlist.playlistSong
                    .slice(0, index)
                    .concat(playlist.playlistSong.slice(index + 1, playlist.playlistSong.length));
                Playlist.findOneAndUpdate(
                    { _id: req.params.slug },
                    { playlistSong: newList },
                    null,
                    (err, playlist) => {
                        if (err) res.json({ success: false, message: "Lỗi" });
                        else {
                            if (playlist)
                                res.json({
                                    success: true,
                                    message: "Đã xoá bài hát khỏi Playlist",
                                    playlist: playlist,
                                });
                            else res.json({ success: false, message: "Không tìm thấy Playlist" });
                        }
                    }
                );
            }
        } else {
            res.json({ success: false, message: "Không tìm thấy Playlist" });
        }
    });
});

router.get("/playlist", verifyToken, async (req, res) => {
    Account.findOne({ _id: req.account._id }).then((account) => {
        if (account) {
            Playlist.find({ ownerId: account._id }, { _id: 1, playlistName: 1, playlistImage: 1 }).then((playlist) => {
                res.send(playlist);
            });
        } else {
            res.status(203).json({ success: false, message: "Không tìm thấy thông tin tài khoản" });
        }
    });
});

router.delete("/playlist/:slug", async (req, res) => {
    try {
        Playlist.findOneAndRemove({ _id: req.params.slug }).exec((err, playlist) => {
            console.log(playlist);
            if (err) {
                res.json({ success: false, message: "Có lỗi xảy ra" });
            } else {
                if (playlist) res.json({ success: true, message: "Xoá Playlist thành công" });
                else res.json({ success: false, message: "Playlist không tồn tại" });
            }
        });
    } catch (err) {
        res.json({ success: false, message: "Có lỗi xảy ra" });
        console.log(err);
    }
});

router.get("/playlist/:slug", verifyToken, async (req, res) => {
    Account.findOne({ _id: req.account._id }).then((account) => {
        if (account) {
            Playlist.find({ ownerId: account._id, _id: req.params.slug })
                .populate({
                    path: "playlistSong",
                    populate: { path: "genres", path: "artists" },
                })
                .exec((err, playlist) => {
                    if (err) res.json({ err: err, message: "fail" });
                    else res.send(playlist);
                });
        } else {
            res.status(203).json({ success: false, message: "Không tìm thấy thông tin tài khoản" });
        }
    });
});

router.get("/song-for-you", verifyToken, async (req, res) => {
    Account.findOne({ _id: req.account._id }).then((account) => {
        if (account) {
            try {
                const user = req.account._id;
                const top = new Number(req.query.top) + 1;
                axios
                    .get(recommendServerPath + `/api/rec-user?user=${user}&top=${top}`)
                    .then((resa) => {
                        let result;
                        if (resa.data != "fail") result = resa.data.split(",");
                        if (result) {
                            Song.find({ songLink: { $in: result } })
                                .populate("artists")
                                .populate("genres")
                                .exec((err, songs) => {
                                    if (songs) {
                                        //sort by score
                                        let index = -1;
                                        for (i = 0; i < songs.length; i++) {
                                            index = result.findIndex((r) => {
                                                return r == songs[i].songLink;
                                            });
                                            if (index != -1) {
                                                let tmp = songs[i];
                                                songs[i] = songs[index];
                                                songs[index] = tmp;
                                            }
                                            index = -1;
                                        }
                                        let vSongs = [];
                                        for (i = 0; i < songs.length; i++) {
                                            if (songs[i]) vSongs.push(songs[i]);
                                        }
                                        res.send(vSongs);
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
        }
    });
});

module.exports = router;
