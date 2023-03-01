import styles from "./AdminGenre.module.scss";
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

function AdminGenre({ audio }) {
    const [genreCount, setGenreCount] = useState(0);
    const [listGenre, setListGenre] = useState([]);
    const [page, setPage] = useState(0);
    const [editItem, setEditItem] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [checkedList, setCheckedList] = useState([]);
    const [listName, setListName] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const perPage = 20;

    const { account } = useContext(AccountContext);

    useEffect(() => {
        request
            .get("/genre")
            .then((res) => {
                setListGenre(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        let list = [];
        for (let i = 0; i < listGenre.length; i++) {
            list.push(listGenre[i].genreName);
            let genre = document.getElementById(`genre-${i}`);
            genre.value = listGenre[i].genreName;
        }
        setListName(list);
        setCurrentIndex(-1);
    }, [listGenre]);

    useEffect(() => {
        if (currentIndex != -1) {
            const editDiv = document.getElementById(`genre-${currentIndex}`);
            const btnConfirm = document.getElementById(`btn-confirm-${currentIndex}`);
            const btnCancel = document.getElementById(`btn-cancel-${currentIndex}`);
            editDiv.style.color = "green";
            editDiv.disabled = false;
            editDiv.focus();
            btnConfirm.style.display = "block";
            btnCancel.style.display = "block";
        }

        return () => {
            if (currentIndex != -1) {
                const editDiv = document.getElementById(`genre-${currentIndex}`);
                const btnConfirm = document.getElementById(`btn-confirm-${currentIndex}`);
                const btnCancel = document.getElementById(`btn-cancel-${currentIndex}`);
                btnConfirm.style.display = "none";
                btnCancel.style.display = "none";
                editDiv.disabled = true;
                editDiv.style.color = "white";
            }
        };
    }, [currentIndex]);

    useEffect(() => {
        const modalDelete = document.getElementById("modal-delete");
        modalDelete.style.top = `calc(50vh - 150px + ${scrollPosition}px`;
    }, [scrollPosition]);

    const showOverlay = () => {
        const overlay = document.getElementById("overlay");
        overlay.style.display = "flex";
    };

    const hideOverlay = () => {
        const deleteModal = document.getElementById("modal-delete");
        const editModal = document.getElementById("modal-edit");
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
        editModal.style.display = "none";
        deleteModal.style.display = "none";
    };

    window.addEventListener("scroll", function () {
        const overlay = document.getElementById("overlay");
        if (!overlay) return;
        if (overlay.style.display == "flex") {
            setScrollPosition(this.window.scrollY);
        }
    });

    const openEditModal = () => {
        setScrollPosition(window.scrollY);

        const formEdit = document.getElementById("modal-edit");
        const genreId = document.getElementById("genre-id");
        formEdit.reset();
        genreId.value = null;
        showOverlay();
        const editModal = document.getElementById("modal-edit");
        editModal.style.display = "flex";
    };

    const openDeleteModal = (genre) => {
        setScrollPosition(window.scrollY);
        if (genre) {
            const genreId = document.getElementById("genre-id");
            const text = document.getElementById("name-delete");
            text.innerText = "Xác nhận xoá thể loại " + genre.genreName + " ?";
            genreId.value = genre._id;
        } else {
            const genreId = document.getElementById("genre-id");
            const text = document.getElementById("name-delete");
            text.innerText = "Xác nhận xoá các thể loại đã chọn ?";
            genreId.value = "";
        }
        showOverlay();
        const deleteModal = document.getElementById("modal-delete");
        deleteModal.style.display = "flex";
    };

    const submitDeleteForm = async () => {
        const genreId = document.getElementById("genre-id").value;
        if (genreId != "") {
            requestWithToken(account.accessToken)
                .delete("genre?genreId=" + genreId)
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
            for (let i = 0; i < checkedList.length; i++) query += "genreId=" + checkedList[i] + "&";
            console.log(query);
            requestWithToken(account.accessToken)
                .delete("genre?" + query)
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
            for (let i = 0; i < listGenre.length; i++) list.push(listGenre[i]._id);
            setCheckedList(list);
        } else setCheckedList([]);
    };

    const handleCancel = () => {
        const editDiv = document.getElementById(`genre-${currentIndex}`);
        editDiv.value = listName[currentIndex];
        setCurrentIndex(-1);
    };

    const handleSubmit = (genreId) => {
        if (genreId) {
            const genreName = document.getElementById(`genre-${currentIndex}`).value;
            requestWithToken(account.accessToken)
                .patch(
                    "/genre/" + genreId,
                    { genreName: genreName },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Cập nhật thể loại thành công");
                        setEditItem(editItem + 1);
                        setCurrentIndex(-1);
                    } else toastNotify(res.data.message);
                });
        } else {
            const genreName = document.getElementById("genreName-on-form").value;
            requestWithToken(account.accessToken)
                .post("/genre", { genreName: genreName }, { headers: { "Content-Type": "application/json" } })
                .then((res) => {
                    if (res.data.success) {
                        toastNotify("Thêm thể loại thành công");
                        setEditItem(editItem + 1);
                        hideOverlay();
                        setCurrentIndex(-1);
                    } else toastNotify(res.data.message);
                });
        }
    };

    return (
        <div className={cx("wrapper")}>
            <input id="genre-id" style={{ display: "none" }} disabled />
            <div className={cx("overlay")} id="overlay" onClick={() => hideOverlay()}></div>
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
            <form className={cx("modal-edit")} id="modal-edit">
                <div className={cx("text-field")}>
                    <div className={cx("row-field")}>
                        <label>Tên thể loại</label>
                        <input type="text" spellCheck="false" name="genreName" id="genreName-on-form" />
                    </div>
                    <div className={cx("row-field", "btn")}>
                        <div className={cx("btn-accept")} onClick={() => handleSubmit()}>
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
                    tab={"genre"}
                    setItem={setListGenre}
                    setCount={setGenreCount}
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
                {listGenre.map((genre, index) => (
                    <div className={cx("item")}>
                        <input
                            type="checkbox"
                            onChange={(e) => checkItem(e, genre)}
                            checked={isInCheckedList(genre._id)}
                        />
                        <input
                            className={cx("name")}
                            id={`genre-${index}`}
                            tabIndex={index}
                            spellCheck="false"
                            disabled
                            autoComplete="off"
                        />
                        <div className={cx("action")}>
                            <div
                                className={cx("btn-accept", "btn")}
                                id={`btn-confirm-${index}`}
                                onClick={(e) => handleSubmit(genre._id)}
                            >
                                Xác nhận
                            </div>
                            <div
                                className={cx("btn-decline", "btn")}
                                id={`btn-cancel-${index}`}
                                onClick={() => handleCancel()}
                            >
                                Huỷ
                            </div>
                            <BsPencilSquare onClick={() => setCurrentIndex(index)} />
                            <BsTrash onClick={() => openDeleteModal(genre)} />
                        </div>
                    </div>
                ))}
                {listGenre.length == 0 && "Không có thể loại phù hợp"}
            </div>

            {genreCount > perPage && <Pagination page={page} perPage={perPage} count={genreCount} setPage={setPage} />}
        </div>
    );
}

export default AdminGenre;
