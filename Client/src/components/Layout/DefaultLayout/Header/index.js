import classNames from "classnames/bind";
import styles from "../Header/Header.module.scss";
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDebounce } from "../../../../utils";
import request from "../../../../utils/request";
import { parseListArtist } from "../../../../utils";
import { MusicPlayerContext } from "../../../../contexts/MusicPlayerContext";
import { hostLink, apiSongImage, apiArtistImage, apiAccountImage } from "../../../../utils/const";
import { BiSearch, BiLoaderCircle } from "react-icons/bi";
import { MdClear } from "react-icons/md";
import { BsFillPlayFill } from "react-icons/bs";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { AccountContext } from "../../../../contexts/AccountContext";

const cx = classNames.bind(styles);

function Header({ audio }) {
    const [searchValue, setSearchValue] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [showMenuAccount, setShowMenuAccount] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchSongResult, setSongSearchResult] = useState([]);
    const [searchArtistResult, setArtistSearchResult] = useState([]);

    const debounced = useDebounce(searchValue, 800);
    const searchInputRef = useRef();
    const { account } = useContext(AccountContext);
    useEffect(() => {
        if (!debounced.trim()) {
            setSongSearchResult([]);
            setArtistSearchResult([]);
            return;
        }

        setLoading(true);

        request
            .get("/song?limit=5&songName=" + encodeURIComponent(debounced))
            .then((res) => {
                setSongSearchResult(res.data);
            })
            .catch((err) => console.log(err.code));

        request
            .get("/artist?limit=5&artistName=" + encodeURIComponent(debounced))
            .then((res) => {
                setArtistSearchResult(res.data);
            })
            .catch((err) => console.log(err.code))
            .finally(() => setLoading(false));

        setShowResult(true);
    }, [debounced]);

    window.addEventListener("load", () => {
        const searchDiv = document.getElementById("search");

        document.addEventListener("mousedown", (event) => {
            if (searchDiv.contains(event.target)) {
                setShowResult(true);
            } else {
                setShowResult(false);
            }
        });
    });

    const { musicPlayer, changeSong, setVolumeAndPremute, addSong } = useContext(MusicPlayerContext);
    const { volume } = musicPlayer;
    const handleDirect = () => {
        setShowResult(false);
        setVolumeAndPremute(volume, volume);
    };
    const navigate = useNavigate();
    const handleKeyUp = (e) => {
        if (e.key === "Enter" || e.keyCode === 13) {
            setShowResult(false);
            navigate("/search/" + e.target.value, { replace: true });
            setVolumeAndPremute(volume, volume);
            const search = document.getElementById("search");
            search.blur();
        }
    };

    const handleClear = () => {
        setSearchValue("");
        setLoading(false);
        setShowResult(false);
        setSongSearchResult([]);
        setArtistSearchResult([]);
        searchInputRef.current.focus();
    };

    const handleLogout = () => {
        localStorage.removeItem("account");
        window.location.href = "/login";
    };

    const link = (link) => {
        navigate(link, { replace: false });
        setShowMenuAccount(false);
    };

    useEffect(() => {
        if (!account) return;
        const menuAccount = document.getElementById("menu-account");
        if (showMenuAccount) {
            menuAccount.style.display = "flex";
            menuAccount.focus();
        } else menuAccount.style.display = "none";
    }, [showMenuAccount]);

    return (
        <header className={cx("wrapper")}>
            <div className={cx("inner")}>
                <div className={cx("content")}>
                    <div className={cx("search")} id="search">
                        <BiSearch />
                        <input
                            spellCheck="false"
                            ref={searchInputRef}
                            placeholder="Tìm kiếm bài hát, ca sĩ..."
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                            onFocus={() => setShowResult(true)}
                            onKeyUp={(e) => handleKeyUp(e)}
                        ></input>
                        {!loading && searchValue != "" && (
                            <MdClear className={cx("clear")} onClick={() => handleClear()} />
                        )}
                        {loading && <BiLoaderCircle className={cx("loading")} />}
                        {showResult && searchValue != "" && (
                            <div className={cx("result")}>
                                <div className={cx("header")}>Kết quả</div>
                                {searchSongResult.map((song, index) => {
                                    return (
                                        <div className={cx("banner")} key={index}>
                                            <div className={cx("image")} onClick={() => changeSong(song, audio)}>
                                                <img src={hostLink + apiSongImage + song.songImage} />
                                                <div className={cx("overlay")}>
                                                    <BsFillPlayFill />
                                                </div>
                                            </div>
                                            <div className={cx("text")}>
                                                <div className={cx("name")}>{song.songName}</div>
                                                <div className={cx("artist")}>{parseListArtist(song.artists)}</div>
                                            </div>
                                            <div className={cx("action")}>
                                                <MdOutlinePlaylistAdd onClick={() => addSong(song)} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {searchArtistResult.map((artist, index) => (
                                    <Link
                                        key={index}
                                        className={cx("result-artist")}
                                        to={"/artist/" + artist.artistLink}
                                        onClick={() => {
                                            handleDirect();
                                        }}
                                    >
                                        <img src={hostLink + apiArtistImage + artist.artistImage} />
                                        <div className={cx("info")}>
                                            <p className={cx("name")}>{artist.artistName}</p>
                                            <p className={cx("des")}>Nghệ sĩ</p>
                                        </div>
                                    </Link>
                                ))}
                                {!loading &&
                                    debounced != "" &&
                                    searchSongResult.length == 0 &&
                                    searchArtistResult.length == 0 && (
                                        <div className={cx("no-result-text")}>Không có kết quả phù hợp</div>
                                    )}
                            </div>
                        )}
                    </div>
                    <div className={cx("category")}>
                        <Link to="/">Trang chủ</Link>
                        <Link to="/song">Bài hát</Link>
                        <Link to="/genre">Thể Loại</Link>
                        <Link to="/artist">Ca Sĩ</Link>
                    </div>
                </div>

                <div className={cx("account")}>
                    {account ? (
                        <div className={cx("account-image")} id="account-image">
                            <img
                                src={hostLink + apiAccountImage + account.accountImage}
                                alt="account"
                                onClick={() => setShowMenuAccount(true)}
                            />
                            {
                                <div
                                    className={cx("menu")}
                                    id="menu-account"
                                    tabIndex="10"
                                    onBlur={() => setShowMenuAccount(false)}
                                >
                                    {account.role == 0 && (
                                        <div to="/admin" className={cx("option")} onClick={() => link("/admin")}>
                                            Quản lý dữ liệu (Admin)
                                        </div>
                                    )}
                                    <div to="/profile" className={cx("option")} onClick={() => link("/profile")}>
                                        Thông tin tài khoản
                                    </div>
                                    <div to="/playlist" className={cx("option")} onClick={() => link("/playlist")}>
                                        Quản lý Playlist
                                    </div>
                                    <div className={cx("option")} onClick={() => handleLogout()}>
                                        Đăng xuất
                                    </div>
                                </div>
                            }
                        </div>
                    ) : (
                        <div className={cx("login-btn")} onClick={() => navigate("/login", { replace: true })}>
                            Đăng nhập
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
export default Header;
