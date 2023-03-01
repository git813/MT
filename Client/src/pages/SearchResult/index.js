import styles from "./SearchResult.module.scss";
import classNames from "classnames/bind";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useContext, Fragment } from "react";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import request from "../../utils/request";
import { parseListArtist, parseDatetoString } from "../../utils";
import { hostLink, apiSongImage, apiArtistImage } from "../../utils/const";
import { BsFillPlayFill, BsThreeDots } from "react-icons/bs";
import { MenuContext } from "../../contexts/MenuContext";

const cx = classNames.bind(styles);

function SearchResult({ audio }) {
    const [tab, setTab] = useState("Song");
    const [searchSongResult, setSongSearchResult] = useState([]);
    const [searchArtistResult, setArtistSearchResult] = useState([]);
    let { slug } = useParams();
    const { MenuType, toggleMenu } = useContext(MenuContext);
    useEffect(() => {
        const searchValue = window.location.pathname.replace("/search/", "");
        if (!searchValue.trim()) {
            setSongSearchResult([]);
            setArtistSearchResult([]);
            return;
        }
        if (tab == "Song") {
            request.get("/song?limit=5&songName=" + encodeURIComponent(searchValue)).then((res) => {
                setSongSearchResult(res.data);
            });
        } else {
            request.get("/artist?limit=5&artistName=" + encodeURIComponent(searchValue)).then((res) => {
                setArtistSearchResult(res.data);
            });
        }
    }, [tab, window.location.pathname]);

    const { changeSong } = useContext(MusicPlayerContext);
    return (
        <div className={cx("wrapper")}>
            <div className={cx("content")}>
                <div className={cx("tab")}>
                    <div className={cx("header-text")}>Kết quả tìm kiếm</div>
                    {tab == "Song" ? (
                        <Fragment>
                            <div className={cx("tabSong", "tab-opened")}>Bài hát</div>
                            <div className={cx("tabArtist")} onClick={() => setTab("Artist")}>
                                Nghệ sĩ
                            </div>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <div className={cx("tabSong")} onClick={() => setTab("Song")}>
                                Bài hát
                            </div>
                            <div className={cx("tabArtist", "tab-opened")}>Nghệ sĩ</div>
                        </Fragment>
                    )}
                </div>

                {tab == "Song" && (
                    <div className={cx("result")}>
                        {searchSongResult.map((song, index) => {
                            return (
                                <div className={cx("song-result")} key={index}>
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
                            );
                        })}
                    </div>
                )}

                {tab == "Artist" && (
                    <div className={cx("result")} style={{ flexDirection: "row" }}>
                        {searchArtistResult.map((artist, index) => {
                            return (
                                <Link key={index} className={cx("artist-result")} to={"/artist/" + artist.artistLink}>
                                    <img src={hostLink + apiArtistImage + artist.artistImage} />
                                    <p className={cx("name")}>{artist.artistName}</p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResult;
