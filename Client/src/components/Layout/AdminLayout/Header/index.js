import classNames from "classnames/bind";
import styles from "../Header/Header.module.scss";
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDebounce } from "../../../../utils";
import request from "../../../../utils/request";
import { BiSearch } from "react-icons/bi";
import { parseListArtist } from "../../../../utils";
import { MusicPlayerContext } from "../../../../contexts/MusicPlayerContext";
import { hostLink, apiSongImage, apiArtistImage, apiAccountImage } from "../../../../utils/const";
import { MdClear } from "react-icons/md";
import { BsFillPlayFill } from "react-icons/bs";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { BiLoaderCircle } from "react-icons/bi";
import { AccountContext } from "../../../../contexts/AccountContext";

const cx = classNames.bind(styles);

function Header() {
    const { account } = useContext(AccountContext);
    const [showMenuAccount, setShowMenuAccount] = useState(false);

    const navigate = useNavigate();
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
        const menuAccount = document.getElementById("menu-account-admin");
        if (showMenuAccount) {
            menuAccount.style.display = "flex";
            menuAccount.focus();
        } else menuAccount.style.display = "none";
    }, [showMenuAccount]);
    return (
        <header className={cx("wrapper")}>
            <div className={cx("inner")}>
                <div className={cx("content")}>
                    <Link to="/" className={cx("logo")}>
                        <img src="../assets/images/logo.png" />
                    </Link>
                    <div className={cx("category")}>
                        <Link to="/admin/account">Quản lý Tài khoản</Link>
                        <Link to="/admin/song">Quản lý Bài hát</Link>
                        <Link to="/admin/artist">Quản lý Ca sĩ</Link>
                        <Link to="/admin/genre">Quản lý Thể loại</Link>
                    </div>

                    <div className={cx("account")}>
                        {account ? (
                            <div className={cx("account-image")} id="account-image-admin">
                                <img
                                    src={hostLink + apiAccountImage + account.accountImage}
                                    alt="account"
                                    onClick={() => setShowMenuAccount(true)}
                                />
                                {
                                    <div
                                        className={cx("menu")}
                                        id="menu-account-admin"
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
            </div>
        </header>
    );
}
export default Header;
