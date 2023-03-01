import styles from "./AdminAccount.module.scss";
import classNames from "classnames/bind";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { MdPersonAdd } from "react-icons/md";
import { useState, useContext, useEffect, Fragment } from "react";
import request, { requestWithToken } from "../../../utils/request";
import SearchAdmin from "../../../components/SearchAdmin";
import Pagination from "../../../components/Pagination";
import { AccountContext } from "../../../contexts/AccountContext";
import { toastNotify } from "../../../utils";
import Select from "react-select";
const cx = classNames.bind(styles);

function AdminGenre({ audio }) {
    const [accountCount, setAccountCount] = useState(0);
    const [listAccount, setListAccount] = useState([]);
    const [page, setPage] = useState(0);
    const [editItem, setEditItem] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [checkedList, setCheckedList] = useState([]);
    const perPage = 20;

    const { account } = useContext(AccountContext);

    useEffect(() => {
        requestWithToken(account.accessToken)
            .get("/admin/account")
            .then((res) => {
                setListAccount(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        const modal = document.getElementById("modal-confirm");
        modal.style.top = `calc(50vh - 150px + ${scrollPosition}px`;
    }, [scrollPosition]);

    const showOverlay = () => {
        const overlay = document.getElementById("overlay");
        overlay.style.display = "flex";
    };

    const hideOverlay = () => {
        const modal = document.getElementById("modal-confirm");
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
        modal.style.display = "none";
    };

    window.addEventListener("scroll", function () {
        const overlay = document.getElementById("overlay");
        if (!overlay) return;
        if (overlay.style.display == "flex") {
            setScrollPosition(this.window.scrollY);
        }
    });

    const openModal = (index) => {
        setScrollPosition(window.scrollY);
        const userId = document.getElementById("user-id");
        const text = document.getElementById("name-action");
        userId.value = index;
        text.innerText = "Xác nhận xoá thể loại ?";
        showOverlay();
        const modal = document.getElementById("modal-confirm");
        modal.style.display = "flex";
    };

    const submitForm = async () => {
        const userIndex = document.getElementById("user-id").value;
        const status = document.getElementById(`user-status-${userIndex}`).value;
        if (listAccount[userIndex]._id != "") {
            requestWithToken(account.accessToken)
                .patch(
                    "/admin/account/status",
                    { userId: listAccount[userIndex]._id, status: status },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    if (res.data.success) {
                        toastNotify(res.data.message);
                        setEditItem(editItem + 1);
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

    const cancelForm = () => {
        const userIndex = document.getElementById(`user-id`).value;
        const user = document.getElementById(`user-status-${userIndex}`);
        user.value = !listAccount[userIndex].isDisable;
        hideOverlay();
    };

    const getTypeAccount = (role) => {
        if (role == 0) return "Admin";
        else return "User";
    };

    const getValueStatus = (isDisabled) => {
        let res;
        if (isDisabled) res = false;
        else res = true;
        return res;
    };
    return (
        <div className={cx("wrapper")}>
            <input id="user-id" style={{ display: "none" }} disabled />
            <div className={cx("overlay")} id="overlay" onClick={() => cancelForm()}></div>
            <form className={cx("modal-confirm")} id="modal-confirm">
                <div className={cx("text-field")}>
                    <div id="name-action"></div>
                    <div className={cx("row-field", "btn")}>
                        <div className={cx("btn-accept")} onClick={() => submitForm()}>
                            Xác nhận
                        </div>
                        <div className={cx("btn-decline")} onClick={() => cancelForm()}>
                            Huỷ
                        </div>
                    </div>
                </div>
            </form>
            <div className={cx("search")}>
                <SearchAdmin
                    tab={"account"}
                    setItem={setListAccount}
                    setCount={setAccountCount}
                    page={page}
                    setPage={setPage}
                    perPage={perPage}
                    editItem={editItem}
                />
                <div className={cx("search-margin-right")}></div>
            </div>
            <div className={cx("account-table")}>
                <div className={cx("header-account-col")}>Email</div>
                <div className={cx("header-account-col")}>Tên hiển thị</div>
                <div className={cx("header-account-col")}>Loại tài khoản</div>
                <div className={cx("header-account-col")}>Trạng thái</div>

                {listAccount.map((acc, index) => (
                    <Fragment>
                        <div className={cx("account-info")}>{acc.email}</div>
                        <div className={cx("account-info")}>{acc.name}</div>
                        <div className={cx("account-info")}>{getTypeAccount(acc.role)}</div>
                        <select
                            className={cx("account-info", "account-status")}
                            defaultValue={getValueStatus(acc.isDisable)}
                            onChange={() => openModal(index)}
                            id={`user-status-${index}`}
                        >
                            <option value={true}> Active</option>
                            <option value={false}> Deactive</option>
                        </select>
                    </Fragment>
                ))}
                {listAccount.length == 0 && "Không có kết quả phù hợp"}
            </div>

            {accountCount > perPage && (
                <Pagination page={page} perPage={perPage} count={accountCount} setPage={setPage} />
            )}
        </div>
    );
}

export default AdminGenre;
