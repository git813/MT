import styles from "./AdminArtist.module.scss";
import classNames from "classnames/bind";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { hostLink, apiArtistImage } from "../../../utils/const";
import { Link } from "react-router-dom";
import { MdPersonAdd } from "react-icons/md";
import { useState, useContext, useEffect } from "react";
import request, { requestWithToken } from "../../../utils/request";
import SearchAdmin from "../../../components/SearchAdmin";
import Pagination from "../../../components/Pagination";
import { AccountContext } from "../../../contexts/AccountContext";
import { toastNotify } from "../../../utils";
const cx = classNames.bind(styles);

function AdminArtist({ audio }) {
    const [artistCount, setArtistCount] = useState(0);
    const [listArtist, setListArtist] = useState([]);
    const [imgPreview, setImgPreview] = useState("");
    const [page, setPage] = useState(0);
    const [editItem, setEditItem] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [checkedList, setCheckedList] = useState([]);
    const perPage = 20;

    const { account } = useContext(AccountContext);
    useEffect(() => {
        request
            .get("/artist")
            .then((res) => {
                setListArtist(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

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
        const img = document.getElementById("artist-img-preview");
        img.src = file.preview;
        setImgPreview(file);
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

    const openEditModal = (artist) => {
        setScrollPosition(window.scrollY);
        if (artist) {
            const formEdit = document.getElementById("modal-edit");
            const imgPreview = document.getElementById("artist-img-preview");
            const artistId = document.getElementById("artist-id");
            const imgFile = document.getElementById("img-file");

            formEdit.elements["artistName"].value = artist.artistName;
            imgFile.value = "";
            imgPreview.src = hostLink + apiArtistImage + artist.artistImage;
            artistId.value = artist._id;
        } else {
            const formEdit = document.getElementById("modal-edit");
            const imgPreview = document.getElementById("artist-img-preview");
            const artistId = document.getElementById("artist-id");
            const imgFile = document.getElementById("img-file");

            formEdit.reset();
            imgFile.value = "";
            imgPreview.src = "../assets/images/defaultArtist.jpg";
            artistId.value = null;
        }
        showOverlay();
        const editModal = document.getElementById("modal-edit");
        editModal.style.display = "flex";
    };

    const openDeleteModal = (artist) => {
        setScrollPosition(window.scrollY);
        if (artist) {
            const artistId = document.getElementById("artist-id");
            const text = document.getElementById("name-artist-delete");
            text.innerText = "Xác nhận xoá ca sĩ " + artist.artistName + " ?";
            artistId.value = artist._id;
        } else {
            const artistId = document.getElementById("artist-id");
            const text = document.getElementById("name-artist-delete");
            text.innerText = "Xác nhận xoá các ca sĩ đã chọn ?";
            artistId.value = "";
        }
        showOverlay();
        const deleteModal = document.getElementById("modal-delete");
        deleteModal.style.display = "flex";
    };

    const submitEditForm = async () => {
        const artistId = document.getElementById("artist-id").value;
        const formEdit = document.getElementById("modal-edit");
        const formData = new FormData(formEdit);
        formData.delete("artistImage");
        formData.append("artistImage", formEdit.elements["artistImage"].files[0]);
        if (artistId) {
            const res = await requestWithToken(account.accessToken).patch("/artist/" + artistId, formData);
            if (res.data.success) {
                setEditItem(editItem + 1);
                const imgFile = document.getElementById("img-file");
                imgFile.value = "";
                toastNotify("Cập nhật thông tin thành công");
            } else {
                if (res.data.message) toastNotify(res.data.message);
                else toastNotify("Có lỗi xảy ra");
            }
        } else {
            const res = await requestWithToken(account.accessToken).post("/artist", formData);
            if (res.data.success) {
                setEditItem(editItem + 1);
                hideOverlay();
                toastNotify("Thêm ca sĩ thành công");
            } else {
                if (res.data.message) toastNotify(res.data.message);
                else toastNotify("Có lỗi xảy ra");
            }
        }
    };
    const submitDeleteForm = async () => {
        const artistId = document.getElementById("artist-id").value;
        if (artistId != "") {
            requestWithToken(account.accessToken)
                .delete("artist?artistId=" + artistId)
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Xoá ca sĩ thành công");
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
            for (let i = 0; i < checkedList.length; i++) query += "artistId=" + checkedList[i] + "&";
            console.log(query);
            requestWithToken(account.accessToken)
                .delete("artist?" + query)
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

    const checkItem = (e, artist) => {
        if (e.target.checked) setCheckedList([...checkedList, artist._id]);
        else {
            const index = checkedList.indexOf(artist._id);
            const newList = checkedList.slice(0, index).concat(checkedList.slice(index + 1, checkedList.length));
            if (index != -1) setCheckedList(newList);
        }
    };

    const isInCheckedList = (artistId) => {
        const index = checkedList.indexOf(artistId);
        if (index != -1) return true;
        else return false;
    };

    const handleCheckAll = (e) => {
        if (e.target.checked) {
            let list = [];
            for (let i = 0; i < listArtist.length; i++) list.push(listArtist[i]._id);
            setCheckedList(list);
        } else setCheckedList([]);
    };

    return (
        <div className={cx("wrapper")}>
            <input id="artist-id" style={{ display: "none" }} disabled />
            <div className={cx("overlay")} id="overlay" onClick={() => hideOverlay()}></div>
            <form className={cx("modal-edit")} id="modal-edit">
                <div className={cx("img-field")}>
                    <input
                        type="file"
                        style={{ display: "none" }}
                        id="img-file"
                        name="artistImage"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleImgAvatar(e)}
                    />
                    <label for="img-file">
                        <img src="assets/images/logo.png" id="artist-img-preview" />
                        <br /> Chọn hình ảnh
                    </label>
                </div>
                <div className={cx("text-field")}>
                    <div className={cx("row-field")}>
                        <label>Tên ca sĩ</label>
                        <input type="text" spellCheck="false" name="artistName" />
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
                    <div id="name-artist-delete"></div>
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
                    onClick={() => openDeleteModal()}
                >
                    Xóa đã chọn
                </button>
                <SearchAdmin
                    tab={"artist"}
                    setItem={setListArtist}
                    setCount={setArtistCount}
                    page={page}
                    setPage={setPage}
                    perPage={perPage}
                    editItem={editItem}
                    setCheckedList={setCheckedList}
                />
                <div className={cx("upload")} onClick={() => handleCheckAll}>
                    <MdPersonAdd onClick={() => openEditModal()} />
                </div>
            </div>
            <div className={cx("list-item")}>
                {listArtist.map((artist) => (
                    <div className={cx("item")}>
                        <input
                            type="checkbox"
                            onChange={(e) => checkItem(e, artist)}
                            checked={isInCheckedList(artist._id)}
                        />
                        <Link to={"/artist/" + artist.artistLink} className={cx("info")}>
                            <img src={hostLink + apiArtistImage + artist.artistImage} />
                            <div className={cx("text")}>
                                <p className={cx("name")}>{artist.artistName}</p>
                            </div>
                        </Link>
                        <div className={cx("action")}>
                            <BsPencilSquare onClick={() => openEditModal(artist)} />
                            <BsTrash onClick={() => openDeleteModal(artist)} />
                        </div>
                    </div>
                ))}{" "}
                {listArtist.length == 0 && "Không tìm thấy kết quả phù hợp"}
            </div>

            {artistCount > perPage && (
                <Pagination page={page} perPage={perPage} count={artistCount} setPage={setPage} />
            )}
        </div>
    );
}

export default AdminArtist;
