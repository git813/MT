const express = require("express");
const router = express.Router();
const path = require("path");
const rootPath = __dirname.replace("routes", "");
const imageSonglFolder = "public/images/song";
const imageArtistlFolder = "public/images/artist";
const imageAccountlFolder = "public/images/account";
const imagePlaylistlFolder = "public/images/playlist";

router.get("/song/:slug", async (req, res) => {
    try {
        res.sendFile(path.join(rootPath, imageSonglFolder, req.params.slug));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.get("/artist/:slug", async (req, res) => {
    try {
        res.sendFile(path.join(rootPath, imageArtistlFolder, req.params.slug));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.get("/account/:slug", async (req, res) => {
    try {
        res.sendFile(path.join(rootPath, imageAccountlFolder, req.params.slug));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

router.get("/playlist/:slug", async (req, res) => {
    try {
        res.sendFile(path.join(rootPath, imagePlaylistlFolder, req.params.slug));
    } catch (error) {
        res.json({ success: false, message: error });
    }
});

module.exports = router;
