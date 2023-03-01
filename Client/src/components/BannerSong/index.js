import styles from "./BannerSong.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect, useContext, Fragment } from "react";
import { requestWithToken } from "../../utils/request";
import { parseListArtist, toastNotify } from "../../utils";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import { MenuContext } from "../../contexts/MenuContext";
import { hostLink, apiSongImage } from "../../utils/const";
import { BsPlayCircle, BsThreeDots } from "react-icons/bs";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { AccountContext } from "../../contexts/AccountContext";
const cx = classNames.bind(styles);

function BannerSong({ song }) {
    const [inFavour, setInFavour] = useState(false);
    useEffect(() => {
        if (song) {
            if (account)
                requestWithToken(account.accessToken)
                    .get(`/user/infavour/${song._id}`)
                    .then((res) => {
                        setInFavour(res.data.state);
                    })
                    .catch(() => {});
        }
    }, []);

    const addToFavourList = () => {
        if (account)
            requestWithToken(account.accessToken)
                .patch(`/user/favour/add?songId=${song._id}`)
                .then((res) => {
                    if (res.status == 200) {
                        setInFavour(true);
                        toastNotify("Đã thêm vào danh sách yêu thích");
                    } else toastNotify(res.data.message);
                })
                .catch(() => {});
    };

    const removeFromFavourList = () => {
        if (account)
            requestWithToken(account.accessToken)
                .delete(`/user/favour/remove?songId=${song._id}`)
                .then((res) => {
                    if (res.status == 200) {
                        setInFavour(false);
                        toastNotify("Đã xoá khỏi danh sách yêu thích");
                    } else toastNotify(res.data.message);
                })
                .catch(() => {});
    };

    const handleFavourClick = () => {
        if (!account) {
            toastNotify("Vui lòng đăng nhập để sử dụng");
            return;
        }
        if (inFavour) removeFromFavourList();
        else addToFavourList();
    };

    const { changeSong } = useContext(MusicPlayerContext);
    const { toggleMenu, MenuType } = useContext(MenuContext);
    const { account } = useContext(AccountContext);
    return (
        <div className={cx("banner")}>
            <div className={cx("image")}>
                <img src={hostLink + apiSongImage + song.songImage} />
                <div className={cx("song-option")}>
                    <div onClick={() => handleFavourClick()}>{inFavour ? <FaHeart /> : <FaRegHeart />}</div>
                    <div className={cx("big-option")}>
                        <BsPlayCircle onClick={() => changeSong(song)} />
                    </div>
                    <div>
                        <BsThreeDots onClick={(e) => toggleMenu(e, song, MenuType.MenuNotFavour)} />
                    </div>
                </div>
            </div>
            <div className={cx("name")}>{song.songName}</div>
            <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
        </div>
    );
}

export default BannerSong;
