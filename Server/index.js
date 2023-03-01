require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const songRouter = require("./routes/song");
const artistRouter = require("./routes/artist");
const genreRouter = require("./routes/genre");
const imageRouter = require("./routes/image");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

const connectDB = async () => {
    try {
        const db = mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log("connect success");
    } catch (error) {
        console.log(error);
    }
};
connectDB();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);
app.use("/api/song", songRouter);
app.use("/api/artist", artistRouter);
app.use("/api/genre", genreRouter);
app.use("/api/image", imageRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

const PORT = 9999;

app.listen(PORT, () => console.log(`server running port ${PORT}`));
