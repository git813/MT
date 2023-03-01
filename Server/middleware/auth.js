const { response } = require("express");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

const verifyToken = (req, res, next) => {
    const accessToken = req.header("accessToken");
    if (!accessToken) return res.status(401).json({ success: false, message: "Không tìm thấy Access token " });

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_KEY);
        Account.findOne({ _id: decoded.account }).then((account) => {
            if (account) {
                if (account.isDisable) return res.json({ success: false, message: "Tài khoản đã bị vô hiệu hoá" });
                else {
                    req.account = account;
                    next();
                }
            } else {
                return res.status(401).json({ success: false, message: "Tài khoản không tồn tại" });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(403).json({ success: false, message: "Token không hợp lệ" });
    }
};

module.exports = verifyToken;
