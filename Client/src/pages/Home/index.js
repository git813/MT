import styles from "./Home.module.scss";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext, Fragment } from "react";
import React from "react";
import request, { requestWithToken } from "../../utils/request";
import { parseDatetoString, parseListArtist } from "../../utils";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import { MenuContext } from "../../contexts/MenuContext";
import { hostLink, apiSongImage } from "../../utils/const";
import { BsFillPlayFill, BsPlayCircle, BsThreeDots } from "react-icons/bs";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { AccountContext } from "../../contexts/AccountContext";
import BannerSong from "../../components/BannerSong";

const cx = classNames.bind(styles);

function Home({ audio }) {
    const [listSongForYou, setListSongForYou] = useState([]);
    const [listSongHot, setListSongHot] = useState([]);
    const [listSongNew, setListSongNew] = useState([]);

    useEffect(() => {
        if (account)
            requestWithToken(account.accessToken)
                .get("/user/song-for-you?top=5")
                .then((res) => {
                    setListSongForYou(res.data);
                })
                .catch((err) => console.log(err.code));

        request
            .get("/song/general?filter=top-listen&limit=5")
            .then((res) => {
                setListSongHot(res.data);
            })
            .catch((err) => console.log(err.code));

        request
            .get("/song/general?filter=new&limit=8")
            .then((res) => {
                setListSongNew(res.data);
            })
            .catch((err) => console.log(err.code));
    }, []);

    const { changeSong, addSong } = useContext(MusicPlayerContext);
    const { MenuType, toggleMenu } = useContext(MenuContext);
    const { account } = useContext(AccountContext);

    const renderSFU = () => {
        const list = [];
        for (let i = 0; i < listSongForYou.length; i++) {
            if (i < 5) list.push(<BannerSong song={listSongForYou[i]} />);
        }
        return list;
    };

    return (
        <div className={cx("wrapper")}>
            {listSongForYou.length > 0 && (
                <Fragment>
                    <div className={cx("heading")}>
                        <div>Nhạc dành cho bạn</div>
                        <Link to="/song-for-you">
                            Xem thêm <IoIosArrowForward />
                        </Link>
                    </div>
                    <div className={cx("content-banner-square")}>{renderSFU()}</div>
                </Fragment>
            )}

            <div className={cx("heading")}>
                <div>Nhạc Hot</div>
                <Link to="/song?filter=top-listen">
                    Xem thêm <IoIosArrowForward />
                </Link>
            </div>
            <div className={cx("content-banner-square")}>
                {listSongHot.map((song) => (
                    <BannerSong song={song} />
                ))}
            </div>

            <div className={cx("heading")}>
                <div>Nhạc mới phát hành</div>
                <Link to="/song?filter=new">
                    Xem thêm <IoIosArrowForward />
                </Link>
            </div>
            <div className={cx("content-song-new")}>
                {listSongNew.map((song, index) => (
                    <div className={cx("banner")} key={index}>
                        <div className={cx("image")} onClick={() => changeSong(song, audio)}>
                            <img src={hostLink + apiSongImage + song.songImage} />
                            <BsFillPlayFill />
                        </div>
                        <div className={cx("text")}>
                            <div className={cx("name")}>{song.songName}</div>
                            <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
                            <p className={cx("time-release")}>{parseDatetoString(song.releaseDate)}</p>
                        </div>
                        <div className={cx("action")}>
                            <BsThreeDots onClick={(e) => toggleMenu(e, song, MenuType.MenuFull)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
