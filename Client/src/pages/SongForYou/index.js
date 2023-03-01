import styles from "./SongForYou.module.scss";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import { MenuContext } from "../../contexts/MenuContext";
import request, { requestWithToken } from "../../utils/request";
import { parseListArtist } from "../../utils";
import { hostLink, apiSongImage } from "../../utils/const";
import { BsFillPlayFill, BsPlayCircle, BsThreeDots } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";
import { AccountContext } from "../../contexts/AccountContext";
import BannerSong from "../../components/BannerSong";
const cx = classNames.bind(styles);

function SongForYou({ audio }) {
    const [listSong, setListSong] = useState([]);
    const { MenuType, openMenu } = useContext(MenuContext);
    const { account } = useContext(AccountContext);
    useEffect(() => {
        if (account)
            requestWithToken(account.accessToken)
                .get("/user/song-for-you?top=20")
                .then((res) => {
                    const listSongTmp = [];
                    for (let song of res.data) {
                        listSongTmp.push(song);
                    }

                    setListSong(listSongTmp);
                });
        else {
            alert("Bạn chưa đăng nhập");
            window.location.href = "/";
        }
    }, []);

    const { changeSong } = useContext(MusicPlayerContext);

    return (
        <div className={cx("wrapper")}>
            <div className={cx("heading")}>
                <div className={cx("heading-text")}>Danh sách nhạc dành cho bạn</div>
            </div>
            {listSong.length > 0 ? (
                <div className={cx("content")}>
                    {listSong.map((song) => (
                        <BannerSong song={song} />
                    ))}
                </div>
            ) : (
                <div className={cx("sub-text")}>
                    Chưa có dữ liệu <br /> Hãy thêm bài hát vào danh sách yêu thích
                </div>
            )}
        </div>
    );
}

export default SongForYou;
