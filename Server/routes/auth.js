const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const Playlist = require("../models/Playlist");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

router.post("/login", async (req, res) => {
    // try {
    if (!req.body || req.body == {}) {
        console.log("empty");
        res.json({ success: false });
        return;
    }
    Account.findOne({ email: req.body.email }).then((account) => {
        var checkPassword;
        if (account) {
            if (account.isDisable) return res.json({ success: false, message: "Tài khoản đã bị vô hiệu hoá" });
            checkPassword = bcrypt.compareSync(req.body.password, account.password);

            if (checkPassword) {
                const accessToken = jwt.sign({ account: account._id, role: account.role }, process.env.JWT_KEY);
                res.json({
                    success: true,
                    account: {
                        accessToken: accessToken,
                        email: account.email,
                        name: account.name,
                        accountImage: account.accountImage || "avatar-default.jpg",
                        role: account.role,
                    },
                });
            } else {
                res.json({
                    success: false,
                    message: "Mật khẩu không chính xác!",
                });
            }
        } else {
            res.json({ success: false, message: "Tài khoản không tồn tại!" });
        }
    });
    // .catch((err) => {
    //     res.json({ success: false, message: err });
    // });
    // } catch (err) {
    //     res.json({ success: false, message: err });
    // }
});

router.post("/signup", async (req, res) => {
    try {
        var account = await Account.findOne({ email: req.body.email });
        if (!account) {
            //validate
            var fieldError = "";
            if (!req.body.email) fieldError = "Email";
            if (!req.body.password) fieldError = "Mật khẩu";

            if (fieldError != "") {
                return res.json({ success: false, message: `${fieldError} không được để trống!` });
            }
            if (req.body.password != req.body.repassword) {
                return res.json({ success: false, message: "Mật khẩu không khớp!" });
            }

            // create a new account
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newAccount = new Account({
                email: req.body.email,
                password: hashedPassword,
                name: req.body.email,
                role: 1,
            });
            //
            newAccount.save().then((account, err) => {
                if (account) {
                    const favouritePlaylist = new Playlist({
                        ownerId: account._id,
                        playlistName: "DANH SÁCH YÊU THÍCH",
                        playlistImage: "favouritePlaylist.png",
                    });

                    favouritePlaylist.save().then((playlist, err) => {
                        if (playlist)
                            Account.findOneAndUpdate(
                                { _id: account._id },
                                { favouriteList: playlist._id },
                                null,
                                (err, account) => res.json({ success: true, message: "Tạo tài khoản thành công" })
                            );
                    });
                } else {
                    res.json({ success: true, message: "Tạo tài khoản thất bại /n" + err });
                }
            });
        } else {
            res.json({ success: false, message: `Email đã tồn tại!` });
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
