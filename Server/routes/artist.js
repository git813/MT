const express = require("express");
const router = express.Router();
const Artist = require("../models/Artist");
const path = require("path");
const rootPath = __dirname.replace("routes", "");
const imageArtistFolder = "public/images/artist/";
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(rootPath, imageArtistFolder));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, req.body.artistName + "-" + uniqueSuffix);
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

const uploadArtist = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single("artistImage");

router.get("/count", async (req, res) => {
    try {
        const artistName = req.query.artistName || "";
        Artist.count({ artistName: { $regex: new RegExp(artistName, "i") } }).then((count) => {
            res.json({ success: true, count: count });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, count: 0 });
    }
});

router.get("/:slug", async (req, res) => {
    try {
        await Artist.find({ artistLink: req.params.slug }).exec((err, artists) => res.send(artists));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit || 0;
        const page = req.query.page || 0;
        const artistName = req.query.artistName || "";
        Artist.find({ artistName: { $regex: new RegExp(artistName, "i") } })
            .sort({ artistName: 1 })
            .skip(page * limit)
            .limit(limit)
            .exec((err, artists) => res.send(artists));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.post("/", verifyToken, async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    uploadArtist(req, res, function (err) {
        try {
            if (err instanceof multer.MulterError) {
                err.code == "LIMIT_FILE_SIZE"
                    ? res.json({ success: false, message: "File ảnh quá lớn" })
                    : res.json({ success: false, message: err.code });
                return;
            }
            if (req.fileValidationError) {
                res.json({ success: false, message: req.fileValidationError });
            }

            const artistImage = req.file ? req.file.filename : "defaultArtistImage.png";

            //save Image
            const newArtist = Artist({
                artistName: req.body.artistName,
                artistImage: artistImage,
            });
            newArtist.save((err, artist) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    res.json({ success: true, message: "Thêm ca sĩ thành công", artist: artist });
                }
            });
        } catch (error) {
            res.json({ success: false, message: error });
        }
    });
});

router.patch("/:slug", verifyToken, async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    uploadArtist(req, res, function (err) {
        try {
            if (err instanceof multer.MulterError) {
                console.log(err);
                err.code == "LIMIT_FILE_SIZE"
                    ? res.json({
                          success: false,
                          message: "File ảnh quá lớn",
                      })
                    : res.json({ success: false, message: err.code });
                return;
            }
            if (req.fileValidationError) {
                res.json({ success: false, message: req.fileValidationError });
            }

            if (!req.body.artistName || req.body.artistName.trim() == "")
                return res.json({ success: false, message: "Tên ca sĩ không được để trống" });
            let newArtistInfo = {
                artistName: req.body.artistName,
            };
            if (req.file) newArtistInfo = { ...newArtistInfo, artistImage: req.file.filename };

            Artist.findOneAndUpdate({ _id: req.params.slug }, newArtistInfo, null, (err, artist) => {
                if (artist) {
                    res.json({ success: true, message: "Cập nhật thông tin bài hát thành công" });
                    if (req.file && artist.artistImage != "defaultArtistImage.png")
                        fs.unlinkSync(path.join(rootPath, imageArtistFolder, artist.artistImage));
                } else {
                    console.log(err);
                    res.json({ success: false, message: "Có lỗi xảy ra" });
                    fs.unlinkSync(path.join(rootPath, imageArtistFolder, req.file.filename));
                }
            });
        } catch (error) {
            res.json({ success: false, message: "Có lỗi xảy ra" });
            fs.unlinkSync(path.join(rootPath, imageArtistFolder, req.file.filename));
        }
    });
    return;
});

router.delete("/", async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    let listId = req.query.artistId;
    if (typeof listId == "string") listId = new Array(listId);
    if (!listId) return res.json({ success: false, message: "Danh sách đã chọn rỗng" });

    let error;
    for (let i = 0; i < listId.length; i++) {
        console.log(listId.length);
        try {
            Artist.findOneAndRemove({ _id: listId[i] }).exec((err, artist) => {
                console.log(artist);
                if (err) {
                    error = err.code;
                } else {
                    if (artist)
                        if (artist.artistImage != "defaultArtistImage.png")
                            try {
                                fs.unlinkSync(path.join(rootPath, imageArtistFolder, artist.artistImage));
                            } catch (err) {
                                console.log(err.code);
                                error = err;
                            }
                }
            });
        } catch (err) {
            console.log(err);
            error = err;
        }
    }
    if (error) {
        res.json({ success: false, message: error });
    } else res.json({ success: true, message: "Xoá ca sĩ thành công" });
});

module.exports = router;
