import styles from "./AdminSong.module.scss";
import classNames from "classnames/bind";
import { useState, useContext, useEffect } from "react";
import { MusicPlayerContext } from "../../../contexts/MusicPlayerContext";
import { parseListArtist } from "../../../utils";
import { hostLink, apiSongImage } from "../../../utils/const";
import request, { requestWithToken } from "../../../utils/request";
import { BsPencilSquare, BsTrash, BsMusicNote, BsFillPlayFill } from "react-icons/bs";
import { IoIosAdd, IoMdHeadset } from "react-icons/io";
import SearchAdmin from "../../../components/SearchAdmin";
import Pagination from "../../../components/Pagination";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { AccountContext } from "../../../contexts/AccountContext";
import { toastNotify } from "../../../utils";
import { AiOutlineUpload } from "react-icons/ai";
const cx = classNames.bind(styles);

function AdminSong({ audio }) {
    const [listSong, setListSong] = useState([]);
    const [songCount, setSongCount] = useState(0);
    const [listGenre, setListGenre] = useState([]);
    const [listArtist, setListArtist] = useState([]);
    const [listArtistSong, setListArtistSong] = useState([]);
    const [listGenreSong, setListGenreSong] = useState([]);
    const [imgPreview, setImgPreview] = useState("");
    const [songPreview, setSongPreview] = useState("");
    const [page, setPage] = useState(0);
    const [editItem, setEditItem] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [checkedList, setCheckedList] = useState([]);
    const perPage = 20;

    const { changeSong } = useContext(MusicPlayerContext);
    const { account } = useContext(AccountContext);
    const colourStyles = {
        control: (styles) => ({ ...styles, backgroundColor: "white" }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                    ? "var(--primary-color)"
                    : isFocused
                    ? "var(--primary-color)"
                    : undefined,
                cursor: isDisabled ? "not-allowed" : "pointer",
            };
        },
        multiValue: (styles) => {
            return {
                ...styles,
                backgroundColor: "#b3cde0",
            };
        },
        multiValueLabel: (styles) => ({
            ...styles,
            color: "#22b052",
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: "white",
            ":hover": {
                color: "red",
            },
        }),
        menuList: (styles) => {
            return {
                ...styles,
                color: "var(--black-color)",
            };
        },
        valueContainer: (styles) => ({
            ...styles,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "initial",
        }),
    };

    const multiValueContainer = ({ selectProps, data }) => {
        const label = data.label;
        const allSelected = selectProps.value;
        const index = allSelected.findIndex((selected) => selected.label === label);
        const isLastSelected = index === allSelected.length - 1;
        const labelSuffix = isLastSelected ? ` (${allSelected.length})` : ", ";
        const val = `${label}${labelSuffix}`;
        return val;
    };

    useEffect(() => {
        request.get("/genre").then((res) => {
            setListGenre(
                res.data.map((genre) => {
                    return { value: genre._id, label: genre.genreName };
                })
            );
        });
        request.get("/artist").then((res) => {
            setListArtist(
                res.data.map((artist) => {
                    return { value: artist._id, label: artist.artistName };
                })
            );
        });
    }, []);

    useEffect(() => {
        return () => {
            imgPreview && URL.revokeObjectURL(imgPreview.preview);
        };
    }, [imgPreview]);

    useEffect(() => {
        return () => {
            songPreview && URL.revokeObjectURL(songPreview.preview);
        };
    }, [songPreview]);

    useEffect(() => {
        const modalEdit = document.getElementById("modal-edit-song");
        const modalDelete = document.getElementById("modal-delete-song");
        modalEdit.style.top = `calc(50vh - 150px + ${scrollPosition}px`;
        modalDelete.style.top = `calc(50vh - 150px + ${scrollPosition}px`;
    }, [scrollPosition]);

    const handleImgAvatar = (e) => {
        const file = e.target.files[0];
        file.preview = URL.createObjectURL(file);
        const img = document.getElementById("song-img-preview");
        img.src = file.preview;
        setImgPreview(file);
    };

    const handleFileSong = (e) => {
        const file = e.target.files[0];
        const name = document.getElementById("name-song-file");
        const audio = document.getElementById("audio-preview");
        if (!file) {
            audio.src = "";
            name.innerText = "Chọn bài hát";
            return;
        }

        file.preview = URL.createObjectURL(file);

        audio.src = file.preview;
        setSongPreview(file);
        name.innerText = file.name;
    };

    const showOverlay = () => {
        const overlay = document.getElementById("overlay");
        overlay.style.display = "flex";
    };

    const hideOverlay = () => {
        const editSongModal = document.getElementById("modal-edit-song");
        const deleteSongModal = document.getElementById("modal-delete-song");
        const overlay = document.getElementById("overlay");
        const audioPreview = document.getElementById("audio-preview");
        overlay.style.display = "none";
        editSongModal.style.display = "none";
        deleteSongModal.style.display = "none";
        audioPreview.src = "";
    };

    const openEditSongModal = (song) => {
        setScrollPosition(window.scrollY);
        if (song) {
            setListGenreSong(
                song.genres.map((genre) => {
                    return { value: genre._id, label: genre.genreName };
                })
            );
            setListArtistSong(
                song.artists.map((artist) => {
                    return { value: artist._id, label: artist.artistName };
                })
            );
            const formEdit = document.getElementById("modal-edit-song");
            const imgPreview = document.getElementById("song-img-preview");
            const audioPreview = document.getElementById("audio-preview");
            const name = document.getElementById("name-song-file");
            const songId = document.getElementById("song-id");
            const imgFile = document.getElementById("img-file-song");
            const songFile = document.getElementById("song-file");

            formEdit.elements["songName"].value = song.songName;
            if (song.releaseDate) {
                let fullDate = new Date(song.releaseDate);
                let date = fullDate.getDate();
                let month = fullDate.getMonth() + 1;
                let year = fullDate.getFullYear();
                if (date < 10) date = "0" + date;
                if (month < 10) month = "0" + month;
                fullDate = year + "-" + month + "-" + date;
                formEdit.elements["releaseDate"].value = fullDate;
            } else {
                formEdit.elements["releaseDate"].value = "";
            }

            imgFile.value = "";
            songFile.value = "";
            imgPreview.src = hostLink + apiSongImage + song.songImage;
            audioPreview.src = hostLink + "/api/song/" + song.songLink;
            name.innerText = song.songName;
            songId.value = song._id;
        } else {
            const formEdit = document.getElementById("modal-edit-song");
            const imgPreview = document.getElementById("song-img-preview");
            const audioPreview = document.getElementById("audio-preview");
            const name = document.getElementById("name-song-file");
            const songId = document.getElementById("song-id");
            const imgFile = document.getElementById("img-file-song");
            const songFile = document.getElementById("song-file");

            setListGenreSong([]);
            setListArtistSong([]);
            formEdit.reset();
            imgFile.value = "";
            songFile.value = "";
            imgPreview.src = "../assets/images/defaultSongImage.png";
            audioPreview.src = "";
            name.innerText = "Chọn bài hát";
            songId.value = null;
        }
        showOverlay();
        const editSongModal = document.getElementById("modal-edit-song");
        editSongModal.style.display = "flex";
    };

    const openDeleteSongModal = (song) => {
        setScrollPosition(window.scrollY);
        if (song) {
            const songId = document.getElementById("song-id");
            const text = document.getElementById("name-song-delete");
            text.innerText = "Xác nhận xoá bài hát " + song.songName + " ?";
            songId.value = song._id;
        } else {
            const songId = document.getElementById("song-id");

            const text = document.getElementById("name-song-delete");
            text.innerText = "Xác nhận xoá các bài hát đã chọn ?";
            songId.value = "";
        }
        showOverlay();
        const deleteModal = document.getElementById("modal-delete-song");
        deleteModal.style.display = "flex";
    };

    const submitSongForm = async () => {
        const songId = document.getElementById("song-id").value;
        const formSong = document.getElementById("modal-edit-song");
        const formData = new FormData(formSong);
        formData.delete("songImage");
        formData.append("songImage", formSong.elements["songImage"].files[0]);
        if (songId) {
            const res = await requestWithToken(account.accessToken).patch("/song/" + songId, formData);
            if (res.data.success) {
                setEditItem(editItem + 1);
                const imgFile = document.getElementById("img-file-song");
                const songFile = document.getElementById("song-file");
                imgFile.value = "";
                songFile.value = "";
                toastNotify("Cập nhật thông tin thành công");
                requestWithToken(account.accessToken).get("/song/csv");
            } else {
                if (res.data.message) toastNotify(res.data.message);
                else toastNotify("Có lỗi xảy ra");
            }
        } else {
            const res = await requestWithToken(account.accessToken).post("/song", formData);
            if (res.data.success) {
                setEditItem(editItem + 1);
                hideOverlay();
                toastNotify("Thêm bài hát thành công");
                requestWithToken(account.accessToken).get("/song/csv");
            } else {
                if (res.data.message) toastNotify(res.data.message);
                else toastNotify("Có lỗi xảy ra");
            }
        }
    };

    const submitDeleteSong = async () => {
        const songId = document.getElementById("song-id").value;
        if (songId != "") {
            requestWithToken(account.accessToken)
                .delete("song?songId=" + songId)
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Xoá bài hát thành công");
                        setEditItem(editItem + 1);
                        hideOverlay();
                    } else {
                        toastNotify(res.data.message);
                    }
                })
                .catch(() => {
                    toastNotify("Có lỗi xảy ra");
                });
        } else {
            if (checkedList.length == 0) {
                toastNotify("Danh sách dã chọn rỗng");
                return;
            }
            let query = "";
            for (let i = 0; i < checkedList.length; i++) query += "songId=" + checkedList[i] + "&";
            console.log(query);
            requestWithToken(account.accessToken)
                .delete("song?" + query)
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Xoá thành công");
                        setEditItem(editItem + 1);
                        setCheckedList([]);
                        hideOverlay();
                    } else {
                        toastNotify(res.data.message);
                    }
                })
                .catch(() => {
                    toastNotify("Có lỗi xảy ra");
                });
        }
    };

    window.addEventListener("scroll", function () {
        const overlay = document.getElementById("overlay");
        if (!overlay) return;
        if (overlay.style.display == "flex") {
            setScrollPosition(this.window.scrollY);
        }
    });

    const checkItem = (e, song) => {
        if (e.target.checked) setCheckedList([...checkedList, song._id]);
        else {
            const index = checkedList.indexOf(song._id);
            const newList = checkedList.slice(0, index).concat(checkedList.slice(index + 1, checkedList.length));
            if (index != -1) setCheckedList(newList);
        }
    };

    const isInCheckedList = (songId) => {
        const index = checkedList.indexOf(songId);
        if (index != -1) return true;
        else return false;
    };

    const handleCheckAll = (e) => {
        if (e.target.checked) {
            let list = [];
            for (let i = 0; i < listSong.length; i++) list.push(listSong[i]._id);
            setCheckedList(list);
        } else setCheckedList([]);
    };

    const handleCreateGenre = (inputValue) => {
        console.log("create");
        requestWithToken(account.accessToken)
            .post("/genre", { genreName: inputValue })
            .then((res) => {
                if (res.data.success) {
                    const newGenre = { value: res.data.genre._id, label: res.data.genre.genreName };
                    setListGenre([...listGenre, newGenre]);
                    toastNotify("Thêm thể loại thành công");
                } else toastNotify(res.data.message);
            });
    };
    return (
        <div className={cx("wrapper")}>
            <input id="song-id" style={{ display: "none" }} disabled />
            <div className={cx("overlay")} id="overlay" onClick={() => hideOverlay()}></div>
            <form className={cx("modal-edit-song")} id="modal-edit-song">
                <div className={cx("img-field")}>
                    <input
                        type="file"
                        style={{ display: "none" }}
                        id="img-file-song"
                        name="songImage"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleImgAvatar(e)}
                    />
                    <label for="img-file-song">
                        <img src="assets/images/logo.png" id="song-img-preview" />
                        <br /> Chọn hình ảnh
                    </label>
                </div>
                <div className={cx("text-field")}>
                    <div className={cx("row-field")}>
                        <label>Tên bài hát</label>
                        <input type="text" spellCheck="false" name="songName" />
                    </div>
                    <div className={cx("row-field", "input-select-container")}>
                        <label>Thể loại</label>
                        <CreatableSelect
                            closeMenuOnSelect={false}
                            value={listGenreSong}
                            isMulti
                            styles={colourStyles}
                            className={cx("input-select")}
                            name="genres[]"
                            placeholder=""
                            id="select-genres"
                            options={listGenre}
                            noOptionsMessage={(obj) => "Không có thể loại " + obj.inputValue}
                            onChange={(e) => setListGenreSong(e.value)}
                            components={{
                                MultiValueContainer: multiValueContainer,
                            }}
                            hideSelectedOptions={false}
                            formatCreateLabel={(userInput) => {
                                return `Tạo thể loại "${userInput}"`;
                            }}
                            onCreateOption={(inputValue) => handleCreateGenre(inputValue)}
                        />
                    </div>
                    <div className={cx("row-field", "input-select-container")}>
                        <label>Ca sĩ</label>
                        <Select
                            closeMenuOnSelect={false}
                            value={listArtistSong}
                            isMulti
                            styles={colourStyles}
                            className={cx("input-select")}
                            name="artists[]"
                            placeholder=""
                            id="select-artists"
                            options={listArtist}
                            noOptionsMessage={(obj) => "Không có ca sĩ " + obj.inputValue}
                            onChange={(e) => setListArtistSong(e.value)}
                            components={{
                                MultiValueContainer: multiValueContainer,
                                // Option: CustomOption,
                            }}
                            span
                            hideSelectedOptions={false}
                        />
                    </div>
                    <div className={cx("row-field")}>
                        <label>Ngày phát hành</label>
                        <input type="date" name="releaseDate" />
                    </div>
                    <div className={cx("row-field")}>
                        <label>File nhạc</label>
                        <input
                            type="file"
                            name="songFile"
                            accept=".mp3,.m4a"
                            style={{ display: "none" }}
                            id="song-file"
                            onChange={(e) => handleFileSong(e)}
                        />
                        <audio id="audio-preview" controls preload="true"></audio>
                    </div>
                    <div className={cx("row-field")}>
                        <label>Chọn file nhạc</label>
                        <label for="song-file" className={cx("label-song-file")}>
                            <AiOutlineUpload /> <span id="name-song-file">Chọn file nhạc </span>
                        </label>
                    </div>
                    <div className={cx("row-field", "btn")}>
                        <div className={cx("btn-accept")} onClick={() => submitSongForm()}>
                            Xác nhận
                        </div>
                        <div className={cx("btn-decline")} onClick={() => hideOverlay()}>
                            Huỷ
                        </div>
                    </div>
                </div>
            </form>
            <form className={cx("modal-delete-song")} id="modal-delete-song">
                <div className={cx("text-field")}>
                    <div id="name-song-delete"></div>
                    <div className={cx("row-field", "btn")}>
                        <div className={cx("btn-accept")} onClick={() => submitDeleteSong()}>
                            Xác nhận
                        </div>
                        <div className={cx("btn-decline")} onClick={() => hideOverlay()}>
                            Huỷ
                        </div>
                    </div>
                </div>
            </form>
            <div className={cx("search")}>
                <input
                    type="checkbox"
                    id="clear-checkedlist"
                    onChange={(e) => handleCheckAll(e)}
                    checked={checkedList.length > 0}
                />
                <button
                    className={cx("delete-text")}
                    disabled={!(checkedList.length > 0)}
                    onClick={() => openDeleteSongModal()}
                >
                    Xóa đã chọn
                </button>
                <SearchAdmin
                    tab={"song"}
                    setItem={setListSong}
                    setCount={setSongCount}
                    page={page}
                    setPage={setPage}
                    perPage={perPage}
                    editItem={editItem}
                    setCheckedList={setCheckedList}
                />
                <div className={cx("upload")} onClick={() => openEditSongModal()}>
                    <IoIosAdd />
                    <BsMusicNote />
                </div>
            </div>
            <div className={cx("list-item")}>
                {listSong &&
                    listSong.map((song, index) => (
                        <div className={cx("item")} key={index}>
                            <input
                                type="checkbox"
                                onChange={(e) => checkItem(e, song)}
                                checked={isInCheckedList(song._id)}
                            />
                            <div className={cx("info")}>
                                <div className={cx("image")} onClick={() => changeSong(song, audio)}>
                                    <img src={hostLink + apiSongImage + song.songImage} />
                                    <BsFillPlayFill />
                                </div>
                                <div className={cx("text")}>
                                    <p className={cx("name")}>{song.songName}</p>
                                    <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
                                </div>
                                <div className={cx("listen-time")}>
                                    <IoMdHeadset />
                                    {song.playTime}
                                </div>
                            </div>
                            <div className={cx("action")}>
                                <BsPencilSquare onClick={() => openEditSongModal(song)} />
                                <BsTrash onClick={() => openDeleteSongModal(song)} />
                            </div>
                        </div>
                    ))}
            </div>
            {songCount > perPage && <Pagination page={page} perPage={perPage} count={songCount} setPage={setPage} />}
        </div>
    );
}

export default AdminSong;
