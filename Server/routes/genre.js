const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();
const Genre = require("../models/Genre");

router.get("/count", async (req, res) => {
    try {
        const genreName = req.query.genreName || "";
        Genre.count({ genreName: { $regex: new RegExp(genreName, "i") } }).then((count) => {
            res.json({ success: true, count: count });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, count: 0 });
    }
});

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit || 0;
        const page = req.query.page || 0;
        const genreName = req.query.genreName || "";
        Genre.find({ genreName: { $regex: new RegExp(genreName, "i") } })
            .sort({ genreName: 1 })
            .skip(page * limit)
            .limit(limit)
            .exec((err, genres) => res.send(genres));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
        if (!req.body.genreName || req.body.genreName.trim() == "")
            return res.json({ success: false, message: "Tên ca sĩ không được để trống" });
        const newGenre = Genre({
            genreName: req.body.genreName,
        });
        Genre.findOne({ genreName: req.body.genreName }).then((genre) => {
            if (genre) res.json({ success: false, message: "Thể loại đã tồn tại" });
            else {
                newGenre.save((err, genre) => {
                    if (err) {
                        console.log(err);
                        res.json({ success: false, message: err });
                    } else {
                        console.log(genre);
                        res.json({ success: true, message: "Thêm thể loại thành công", genre: genre });
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error });
    }
});

router.patch("/:slug", verifyToken, async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    try {
        if (!req.body.genreName || req.body.genreName.trim() == "")
            return res.json({ success: false, message: "Tên ca sĩ không được để trống" });

        Genre.findOneAndUpdate({ _id: req.params.slug }, { genreName: req.body.genreName }, null, (err, genre) => {
            if (err) {
                console.log(err);
                res.json({ success: false, message: "Có lỗi xảy ra" });
            } else {
                res.json({ success: true, message: "Cập nhật thể loại thành công" });
            }
        });
    } catch (error) {
        res.json({ success: false, message: "Có lỗi xảy ra" });
    }
});

router.delete("/", async (req, res) => {
    let listId = req.query.genreId;
    if (typeof listId == "string") listId = new Array(listId);
    if (!listId) return res.json({ success: false, message: "Danh sách đã chọn rỗng" });
    let error;
    console.log(listId);
    for (let i = 0; i < listId.length; i++) {
        Genre.findOneAndRemove({ _id: listId[i] }).exec((err, genre) => {
            console.log(genre);
            if (err) {
                error = err.code;
            }
        });
    }

    if (error) {
        res.json({ success: false, message: error });
    } else res.json({ success: true, message: "Xoá thể loại thành công" });
});
module.exports = router;
