import styles from "./Profile.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect, useContext } from "react";
import React from "react";
import { requestWithToken } from "../../utils/request";
import { AccountContext } from "../../contexts/AccountContext";
import { hostLink, apiAccountImage } from "../../utils/const";
import { toastNotify } from "../../utils";
const cx = classNames.bind(styles);
function Profile() {
    const { account, fetchAccountInfo } = useContext(AccountContext);
    const [avatarPreview, setAvatarPreview] = useState("");

    useEffect(() => {
        if (!account) {
            alert("Bạn chưa đăng nhập");
            window.location.href = "/";
        }
        const accountNameInput = document.getElementById("accountNameInput");
        accountNameInput.value = account.name;
    }, []);

    useEffect(() => {
        return () => {
            avatarPreview && URL.revokeObjectURL(avatarPreview.preview);
        };
    }, [avatarPreview]);

    const handlePreviewAvatar = (e) => {
        const file = e.target.files[0];
        file.preview = URL.createObjectURL(file);
        const img = document.getElementById("account-img-preview");
        img.src = file.preview;
        setAvatarPreview(file);
    };

    const handleUpdateInfo = async () => {
        const formInfo = document.getElementById("form-info");
        const formData = new FormData(formInfo);
        const res = await requestWithToken(account.accessToken).patch("/user/profile", formData);
        if (res.data.success) {
            toastNotify("Cập nhật thông tin thành công");
            const imgFile = document.getElementById("img-preview");
            imgFile.value = "";
            fetchAccountInfo();
        } else {
            toastNotify("Có lỗi xảy ra");
        }
    };

    const handleChangePassword = async () => {
        const formChangePassword = document.getElementById("form-changepassword");
        const formData = new FormData(formChangePassword);
        const res = await requestWithToken(account.accessToken).request({
            method: "patch",
            url: "/user/password",
            data: formData,
            headers: { "Content-Type": "application/json" },
        });
        if (res.data.success) {
            toastNotify("Đổi mật khẩu thành công");
        } else {
            toastNotify(res.data.message);
        }
    };
    if (account)
        return (
            <div className={cx("wrapper")}>
                <div className={cx("heading")}>Thông tin tài khoản</div>
                <div className={cx("content")}>
                    <form className={cx("info")} id="form-info" encType="multipart/form-data">
                        <label for="img-preview" className={cx("img-label")}>
                            <img src={hostLink + apiAccountImage + account.accountImage} id="account-img-preview" />
                            <span>Đổi ảnh đại diện</span>
                        </label>
                        <div>
                            <input
                                id="img-preview"
                                name="accountImage"
                                type="file"
                                onChange={(e) => handlePreviewAvatar(e)}
                                style={{ display: "none" }}
                                accept=".jpg,.jpeg,.png"
                            />
                        </div>
                        <div className={cx("change-info")}>
                            <div className={cx("div-input")}>
                                <label>Email</label>
                                <input type="text" value={account ? account.email : ""} disabled />
                            </div>
                            <div className={cx("div-input")}>
                                <label>
                                    Tên hiển thị <span>*</span>
                                </label>
                                <input type="text" name="name" id="accountNameInput" />
                            </div>
                            <div className={cx("btn-submit")} onClick={() => handleUpdateInfo()}>
                                Lưu thay đổi
                            </div>
                        </div>
                    </form>
                    <form
                        className={cx("change-password")}
                        id="form-changepassword"
                        encType="application/x-www-form-urlencoded"
                    >
                        <p className={cx("header-field")}>
                            <strong>ĐỔI MẬT KHẨU</strong>
                        </p>
                        <div className={cx("div-input")}>
                            <label>
                                Mật khẩu hiện tại <span>*</span>
                            </label>
                            <input type="password" name="currentPassword" />
                        </div>
                        <div className={cx("div-input")}>
                            <label>
                                Mật khẩu mới <span>*</span>
                            </label>
                            <input type="password" name="password" />
                        </div>
                        <div className={cx("div-input")}>
                            <label>
                                Nhập lại mật khẩu mới <span>*</span>
                            </label>
                            <input type="password" name="repassword" />
                        </div>
                        <div className={cx("btn-submit")} onClick={() => handleChangePassword()}>
                            Đổi mật khẩu
                        </div>
                    </form>
                </div>
            </div>
        );
    else return;
}

export default Profile;
