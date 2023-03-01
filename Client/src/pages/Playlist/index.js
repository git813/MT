import styles from "./Playlist.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect, useContext, Fragment } from "react";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import { MenuContext } from "../../contexts/MenuContext";
import request, { requestWithToken } from "../../utils/request";
import { parseListArtist } from "../../utils";
import { hostLink, apiSongImage, apiPlaylistImage } from "../../utils/const";
import { BsFillPlayFill, BsPlayCircle, BsThreeDots } from "react-icons/bs";
import { AccountContext } from "../../contexts/AccountContext";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline, IoAddCircleOutline } from "react-icons/io5";
import { MdEdit, MdOutlineClear } from "react-icons/md";
import { toastNotify } from "../../utils";

const cx = classNames.bind(styles);

function Playlist({ audio }) {
    const [listPlaylist, setListPlaylist] = useState([]);
    const [playListSelected, setPlayListSelected] = useState();
    const [imgPreview, setImgPreview] = useState("");
    const [page, setPage] = useState(0);
    const [editItem, setEditItem] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const { account } = useContext(AccountContext);
    const navigate = useNavigate();
    const { MenuType, toggleMenu, fetchPlaylist, setPlaylistDetail, forceRender } = useContext(MenuContext);
    const { changeSong, addPlaylist } = useContext(MusicPlayerContext);
    const perPage = 20;
    useEffect(() => {
        if (account)
            requestWithToken(account.accessToken)
                .get(`/user/playlist`)
                .then((res) => {
                    console.log(res.data);
                    setListPlaylist(res.data);
                });
        else navigate("/", { replace: true });
    }, [editItem]);

    useEffect(() => {
        if (playListSelected) getListSong(playListSelected);
    }, [forceRender]);

    useEffect(() => {
        return () => {
            imgPreview && URL.revokeObjectURL(imgPreview.preview);
        };
    }, [imgPreview]);

    useEffect(() => {
        const modalEdit = document.getElementById("modal-edit");
        const modalDelete = document.getElementById("modal-delete");
        modalEdit.style.top = `calc(50vh - 150px + ${scrollPosition}px`;
        modalDelete.style.top = `calc(50vh - 150px + ${scrollPosition}px`;
    }, [scrollPosition]);

    const handleImgAvatar = (e) => {
        const file = e.target.files[0];
        file.preview = URL.createObjectURL(file);
        const img = document.getElementById("img-preview");
        img.src = file.preview;
        setImgPreview(file);
    };

    const getListSong = (playlist) => {
        requestWithToken(account.accessToken)
            .get("/user/playlist/" + playlist._id)
            .then((res) => {
                if (res.status == 200) setPlayListSelected(res.data[0]);
            });
    };

    const showOverlay = () => {
        const overlay = document.getElementById("overlay");
        overlay.style.display = "flex";
    };

    const hideOverlay = () => {
        const editArtistModal = document.getElementById("modal-edit");
        const deleteArtistModal = document.getElementById("modal-delete");
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
        editArtistModal.style.display = "none";
        deleteArtistModal.style.display = "none";
    };

    window.addEventListener("scroll", function () {
        const overlay = document.getElementById("overlay");
        if (!overlay) return;
        if (overlay.style.display == "flex") {
            setScrollPosition(this.window.scrollY);
        }
    });

    const openEditModal = (playlist) => {
        setScrollPosition(window.scrollY);
        if (playlist) {
            const formEdit = document.getElementById("modal-edit");
            const imgPreview = document.getElementById("img-preview");
            const playlistId = document.getElementById("playlist-id");
            const imgFile = document.getElementById("img-file");

            formEdit.elements["playlistName"].value = playlist.playlistName;
            imgFile.value = "";
            imgPreview.src = hostLink + apiPlaylistImage + playlist.playlistImage;
            playlistId.value = playlist._id;
        } else {
            const formEdit = document.getElementById("modal-edit");
            const imgPreview = document.getElementById("img-preview");
            const playlistId = document.getElementById("playlist-id");
            const imgFile = document.getElementById("img-file");

            formEdit.reset();
            imgFile.value = "";
            imgPreview.src = "../assets/images/defaultPlaylist.png";
            playlistId.value = null;
        }
        showOverlay();
        const editModal = document.getElementById("modal-edit");
        editModal.style.display = "flex";
    };

    const openDeleteModal = (playlist) => {
        setScrollPosition(window.scrollY);
        if (playlist) {
            const playlistId = document.getElementById("playlist-id");
            const text = document.getElementById("name-delete");
            text.innerText = "Xác nhận xoá Playlist " + playlist.playlistName + " ?";
            playlistId.value = playlist._id;
        }
        console.log(playlist._id);
        showOverlay();
        const deleteModal = document.getElementById("modal-delete");
        deleteModal.style.display = "flex";
    };

    const submitEditForm = async () => {
        const playlistId = document.getElementById("playlist-id").value;
        const formEdit = document.getElementById("modal-edit");
        const formData = new FormData(formEdit);
        formData.delete("playlistImage");
        formData.append("playlistImage", formEdit.elements["playlistImage"].files[0]);
        if (playlistId) {
            const res = await requestWithToken(account.accessToken).patch("/user/playlist/" + playlistId, formData);
            if (res.data.success) {
                setEditItem(editItem + 1);
                const imgFile = document.getElementById("img-file");
                imgFile.value = "";
                toastNotify("Cập nhật thông tin thành công");
                hideOverlay();
                fetchPlaylist();
            } else {
                if (res.data.message) toastNotify(res.data.message);
                else toastNotify("Có lỗi xảy ra");
            }
        } else {
            const res = await requestWithToken(account.accessToken).post("/user/playlist", formData);
            if (res.data.success) {
                setEditItem(editItem + 1);
                hideOverlay();
                toastNotify(res.data.message);
                fetchPlaylist();
            } else {
                if (res.data.message) toastNotify(res.data.message);
                else toastNotify("Có lỗi xảy ra");
            }
        }
    };

    const submitDeleteForm = async () => {
        const playlistId = document.getElementById("playlist-id").value;
        if (playlistId != "") {
            requestWithToken(account.accessToken)
                .delete("/user/playlist/" + playlistId)
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Xoá Playlist thành công");
                        setEditItem(editItem + 1);
                        hideOverlay();
                        fetchPlaylist();
                    } else {
                        toastNotify(res.data.message);
                    }
                })
                .catch(() => {
                    toastNotify("Có lỗi xảy ra");
                });
        }
    };

    const playPlaylist = (idPlaylist) => {
        console.log(idPlaylist);
        requestWithToken(account.accessToken)
            .get("user/playlist/" + idPlaylist)
            .then((res) => {
                if (res.data[0].playlistSong.length > 0) {
                    addPlaylist(res.data[0].playlistSong);
                    toastNotify(`Đã thêm Playlist ${res.data[0].playlistName} vào danh sách phát`);
                } else toastNotify(`Playlist rỗng`);
            });
    };

    return (
        <div className={cx("wrapper")}>
            <input id="playlist-id" style={{ display: "none" }} disabled />
            <div className={cx("overlay")} id="overlay" onClick={() => hideOverlay()}></div>
            <form className={cx("modal-edit")} id="modal-edit">
                <div className={cx("img-field")}>
                    <input
                        type="file"
                        style={{ display: "none" }}
                        id="img-file"
                        name="playlistImage"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleImgAvatar(e)}
                    />
                    <label for="img-file">
                        <img src="assets/images/logo.png" id="img-preview" />
                        <br /> Chọn hình ảnh
                    </label>
                </div>
                <div className={cx("text-field")}>
                    <div className={cx("row-field")}>
                        <label>Tên Playlist</label>
                        <input type="text" spellCheck="false" name="playlistName" autoComplete="off" />
                    </div>
                    <div className={cx("row-field", "btn")}>
                        <div className={cx("btn-accept")} onClick={() => submitEditForm()}>
                            Xác nhận
                        </div>
                        <div className={cx("btn-decline")} onClick={() => hideOverlay()}>
                            Huỷ
                        </div>
                    </div>
                </div>
            </form>
            <form className={cx("modal-delete")} id="modal-delete">
                <div className={cx("text-field")}>
                    <div id="name-delete"></div>
                    <div className={cx("row-field", "btn")}>
                        <div className={cx("btn-accept")} onClick={() => submitDeleteForm()}>
                            Xác nhận
                        </div>
                        <div className={cx("btn-decline")} onClick={() => hideOverlay()}>
                            Huỷ
                        </div>
                    </div>
                </div>
            </form>
            <div className={cx("heading")}>
                {playListSelected ? (
                    <Fragment>
                        <IoChevronBackOutline />
                        <div
                            className={cx("heading-text", "back-to-playlist")}
                            onClick={() => setPlayListSelected(null)}
                        >
                            Quay lại
                        </div>
                    </Fragment>
                ) : (
                    <div className={cx("heading-text")}>Danh sách phát</div>
                )}
            </div>
            {!playListSelected && (
                <div className={cx("content")}>
                    <div className={cx("medium-banner", "add-playlist")}>
                        <div className={cx("image")}>
                            <IoAddCircleOutline onClick={() => openEditModal()} />
                            Tạo Playlist
                        </div>
                    </div>
                    {listPlaylist.map((playlist, index) => (
                        <div key={index} className={cx("medium-banner")} onClick={() => getListSong(playlist)}>
                            <div className={cx("image")}>
                                <img src={hostLink + apiPlaylistImage + playlist.playlistImage} />
                                <div className={cx("song-option")}>
                                    {index > 0 && (
                                        <div>
                                            <MdOutlineClear
                                                onClick={(e) => {
                                                    openDeleteModal(playlist);
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className={cx("big-option")}>
                                        <BsPlayCircle
                                            onClick={(e) => {
                                                playPlaylist(playlist._id);
                                                e.stopPropagation();
                                            }}
                                        />
                                    </div>
                                    {index > 0 && (
                                        <div>
                                            <MdEdit
                                                onClick={(e) => {
                                                    openEditModal(playlist);
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className={cx("name")}>{playlist.playlistName}</p>
                        </div>
                    ))}
                </div>
            )}
            {playListSelected && (
                <div className={cx("content-sub")}>
                    <div className={cx("col-banner")}>
                        <div className={cx("image")}>
                            <img src={hostLink + apiPlaylistImage + playListSelected.playlistImage} />
                            <div className={cx("song-option")}>
                                <div className={cx("big-option")}>
                                    <BsPlayCircle
                                        onClick={(e) => {
                                            playPlaylist(playListSelected._id);
                                            e.stopPropagation();
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={cx("text")}>{playListSelected.playlistName}</div>
                        </div>
                    </div>
                    <div className={cx("col-song")}>
                        {playListSelected.playlistSong.map((song, index) => (
                            <div className={cx("banner")} key={index}>
                                <div className={cx("image")} onClick={() => changeSong(song, audio)}>
                                    <img src={hostLink + apiSongImage + song.songImage} />
                                    <BsFillPlayFill />
                                </div>
                                <div className={cx("text")}>
                                    <div className={cx("name")}>{song.songName}</div>
                                    <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
                                </div>
                                <div className={cx("action")}>
                                    <BsThreeDots
                                        onClick={(e) => {
                                            setPlaylistDetail(playListSelected);
                                            toggleMenu(e, song, MenuType.MenuInPlaylist);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {playListSelected.playlistSong.length < 1 && "Playlist rỗng"}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Playlist;
