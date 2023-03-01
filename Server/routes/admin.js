const express = require("express");
const router = express.Router();
const path = require("path");
const rootPath = __dirname.replace("routes", "");
const verifyToken = require("../middleware/auth");
const Account = require("../models/Account");

router.get("/account", verifyToken, async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    try {
        const limit = req.query.limit || 0;
        const page = req.query.page || 0;
        const email = req.query.email || "";
        Account.find({ email: { $regex: new RegExp(email, "i") }, role: { $ne: 0 } })
            .select({ _id: 1, email: 1, name: 1, role: 1, isDisable: 1 })
            .sort({ artistName: 1 })
            .skip(page * limit)
            .limit(limit)
            .exec((err, accounts) => res.send(accounts));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.get("/account/count", async (req, res) => {
    try {
        const email = req.query.email || "";
        Account.count({ email: { $regex: new RegExp(email, "i") }, role: { $ne: 0 } }).then((count) => {
            res.json({ success: true, count: count });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, count: 0 });
    }
});

router.patch("/account/status", verifyToken, async (req, res) => {
    if (req.account.role != 0) return res.json({ success: false, message: "Tài khoản không đủ quyền" });
    if (!req.body.status) return res.json({ success: false, message: "Lỗi yêu cầu" });
    const status = req.body.status == "false" ? false : true;
    Account.findOneAndUpdate({ _id: req.body.userId }, { isDisable: !status }, null, (err, account) => {
        if (err) res.json({ success: false, message: "Lỗi" });
        else {
            res.json({
                success: true,
                message: status ? "Kích hoạt tài khoản thành công" : "Đã vô hiệu hoá tài khoản",
            });
        }
    });
});
module.exports = router;
