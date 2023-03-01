import styles from "./Menu.module.scss";
import classNames from "classnames/bind";
import { MenuContext } from "../../contexts/MenuContext";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import { Fragment, useContext, useEffect, useState } from "react";
import { requestWithToken } from "../../utils/request";
import { toastNotify } from "../../utils";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { BsMusicNoteList, BsTrash } from "react-icons/bs";
import { AccountContext } from "../../contexts/AccountContext";

const cx = classNames.bind(styles);

function Menu() {
    const {
        MenuType,
        typeMenu,
        subPlaylist,
        closeMenu,
        song,
        showMenu,
        setShowMenu,
        playlistDetail,
        forceRender,
        setForceRender,
    } = useContext(MenuContext);
    const { addSong } = useContext(MusicPlayerContext);
    const { account } = useContext(AccountContext);
    const [inFavourList, setInFavourList] = useState(false);

    useEffect(() => {
        if (song) {
            if (account)
                requestWithToken(account.accessToken)
                    .get(`/user/infavour/${song._id}`)
                    .then((res) => {
                        setInFavourList(res.data.state);
                    })
                    .catch(() => {
                        setInFavourList(false);
                    });
            else setInFavourList(false);
        } else setInFavourList(false);
    }, [song]);

    const addToFavourList = () => {
        if (account)
            requestWithToken(account.accessToken)
                .patch(`/user/favour/add?songId=${song._id}`)
                .then((res) => {
                    if (res.data.success) {
                        setInFavourList(true);
                        toastNotify("Đã thêm vào danh sách yêu thích");
                    } else toastNotify(res.data.message);
                })
                .catch((res) => {});
    };

    const removeFromFavourList = () => {
        if (account)
            requestWithToken(account.accessToken)
                .delete(`/user/favour/remove?songId=${song._id}`)
                .then((res) => {
                    if (res.status == 200) {
                        setInFavourList(false);
                        toastNotify("Đã xoá khỏi danh sách yêu thích");
                    } else toastNotify(res.data.message);
                })
                .catch(() => {});
    };

    const addToPlaylist = (playlist) => {
        if (account)
            requestWithToken(account.accessToken)
                .patch(
                    `/user/playlist/add/` + playlist._id,
                    { songId: song._id },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Đã thêm bài hát vào Playlist " + playlist.playlistName);
                    } else toastNotify(res.data.message);
                })
                .catch((res) => {});
    };

    const removeFromPlaylist = (playlist) => {
        if (account)
            requestWithToken(account.accessToken)
                .patch(
                    `/user/playlist/remove/` + playlist._id,
                    { songId: song._id },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Đã xoá bài hát khỏi Playlist " + playlist.playlistName);
                        setForceRender(forceRender + 1);
                    } else toastNotify(res.data.message);
                })
                .catch((res) => {});
    };

    return (
        <div
            className={cx("menu-options")}
            id="menu-context"
            onBlur={(e) => {
                e.target.style.display = "none";
                if (showMenu) setShowMenu(false);
            }}
            tabIndex="100"
        >
            {typeMenu != MenuType.MenuNotPlaylist && (
                <div
                    className={cx("option")}
                    onClick={() => {
                        addSong(song);
                        closeMenu();
                    }}
                >
                    <MdOutlinePlaylistAdd /> Thêm vào danh sách đang phát
                </div>
            )}
            {account && (
                <Fragment>
                    {typeMenu != MenuType.MenuNotFavour ? (
                        inFavourList ? (
                            <div className={cx("option")} onClick={() => removeFromFavourList()}>
                                <FaHeart /> Xoá khỏi danh sách yêu thích
                            </div>
                        ) : (
                            <div className={cx("option")} onClick={() => addToFavourList()}>
                                <FaRegHeart /> Thêm vào danh sách yêu thích
                            </div>
                        )
                    ) : null}

                    <div className={cx("option", "add-to-playlist")}>
                        <IoAddCircleOutline />
                        Thêm vào danh sách phát &emsp;
                        <IoIosArrowForward className={cx("btn-open-playlist-menu")} />
                        <div className={cx("playlist-menu")}>
                            {/* <div className={cx("playlist-item", "btn-add-playlist")}>
                                <IoAddCircleOutline />
                                Tạo danh sách phát
                            </div> */}
                            {subPlaylist.length > 0 &&
                                subPlaylist.map(
                                    (playlist, index) =>
                                        index > 0 && (
                                            <div
                                                className={cx("playlist-item")}
                                                onClick={() => addToPlaylist(playlist)}
                                            >
                                                <BsMusicNoteList />
                                                <div> {playlist.playlistName} </div>
                                            </div>
                                        )
                                )}
                        </div>
                    </div>
                    {typeMenu == MenuType.MenuInPlaylist && (
                        <div className={cx("option")} onClick={() => removeFromPlaylist(playlistDetail)}>
                            <BsTrash /> Xoá khỏi danh sách phát này
                        </div>
                    )}
                </Fragment>
            )}
        </div>
    );
}

export default Menu;
