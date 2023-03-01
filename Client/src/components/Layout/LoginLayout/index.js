import styles from "./LoginLayout.module.scss";
import classNames from "classnames/bind";
import request from "../../../utils/request";
import { HiOutlineMail } from "react-icons/hi";
import { MdLockOutline } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Fragment, useContext, useRef, useState } from "react";
import { AccountContext } from "../../../contexts/AccountContext";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "../../MusicPlayer";
const cx = classNames.bind(styles);
function LoginLayout({ audio }) {
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(true);
    const formRef = useRef();
    const email = localStorage.getItem("email");
    const { account, setAccount } = useContext(AccountContext);
    const navigate = useNavigate();

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        var bodyFormData = new FormData(formRef.current);
        if (isLoginForm) {
            request({
                method: "post",
                url: "/auth/login",
                data: bodyFormData,
                headers: { "Content-Type": "application/json" },
            })
                .then(function (response) {
                    //handle success
                    if (response.data.success) {
                        const account = response.data.account;
                        localStorage.setItem("account", JSON.stringify(account));

                        const rememberMeCheckbox = document.getElementById("rememberMeCheckbox");
                        if (rememberMeCheckbox.checked) {
                            localStorage.setItem("email", bodyFormData.get("email"));
                        } else {
                            localStorage.removeItem("email");
                        }

                        setAccount(account);
                        navigate("/", { replace: true });
                    } else {
                        console.log(response.data);
                        setSuccess(response.data.success);
                        if (typeof response.data.message === "string") setMessage(response.data.message);
                        else setMessage("Có lỗi xảy ra! Vui lòng thử lại sau");
                        const mb = document.getElementById("message");
                        mb.style.animation = "vibrate 0.5s";
                        setTimeout(() => {
                            mb.style.animation = "";
                        }, 500);
                    }
                })
                .catch(function (err) {
                    //handle error
                    setSuccess(false);
                    setMessage("Có lỗi xảy ra! Vui lòng thử lại sau");
                    const mb = document.getElementById("message");
                    mb.style.animation = "vibrate 0.5s";
                    setTimeout(() => {
                        mb.style.animation = "";
                    }, 500);
                    console.log(err);
                });
        } else {
            request({
                method: "post",
                url: "/auth/signup",
                data: bodyFormData,
                headers: { "Content-Type": "application/json" },
            })
                .then(function (response) {
                    //handle success
                    console.log(response.data);
                    setSuccess(response.data.success);
                    if (typeof response.data.message === "string") setMessage(response.data.message);
                    if (!response.data.success) {
                        const mb = document.getElementById("message");
                        mb.style.animation = "vibrate 0.5s";
                        setTimeout(() => {
                            mb.style.animation = "";
                        }, 500);
                    } else {
                        formRef.current.reset();
                        setIsLoginForm(true);
                    }
                })
                .catch(function (err) {
                    //handle error
                    setSuccess(false);
                    setMessage("Có lỗi xảy ra! Vui lòng thử lại sau");
                    const mb = document.getElementById("message");
                    mb.style.animation = "vibrate 0.5s";
                    setTimeout(() => {
                        mb.style.animation = "";
                    }, 500);
                    console.log(err.code);
                });
        }
    };

    const handleEmailInput = (e) => {
        if (e.target.value == "") {
            e.target.setAttribute("isvalid", false);
            e.target.setCustomValidity("Vui lòng nhập email");
        } else {
            if (
                String(e.target.value)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )
            ) {
                e.target.setAttribute("isValid", true);
                e.target.setCustomValidity("");
            } else {
                e.target.setAttribute("isValid", false);
                e.target.setCustomValidity("Định dạng email không phù hợp!");
            }
        }
    };

    const handlePasswordInput = (e) => {
        if (isLoginForm) {
            e.target.setAttribute("isValid", true);
            e.target.setCustomValidity("");
            return;
        }
        if (e.target.value == "") {
            e.target.setAttribute("isvalid", false);
            e.target.setCustomValidity("Vui lòng nhập mật khẩu");
        } else {
            if (e.target.value.length < 6 || e.target.value.length > 20) {
                e.target.setAttribute("isValid", false);
                e.target.setCustomValidity("Mật khẩu phải từ 6-20 kí tự!");
            } else {
                const repassword = document.getElementById("repassword");
                if (repassword.value != e.target.value) {
                    e.target.setAttribute("isValid", false);
                    e.target.setCustomValidity("Mật khẩu không khớp");
                } else {
                    e.target.setAttribute("isValid", true);
                    e.target.setCustomValidity("");
                    repassword.setAttribute("isValid", true);
                    repassword.setCustomValidity("");
                }
            }
        }
    };

    const handleRepasswordInput = (e) => {
        if (e.target.value == "") {
            e.target.setAttribute("isvalid", false);
            e.target.setCustomValidity("Vui lòng nhập lại mật khẩu");
        } else {
            const password = document.getElementById("password");
            if (password.value != e.target.value) {
                e.target.setAttribute("isValid", false);
                e.target.setCustomValidity("Mật khẩu không khớp");
            } else {
                e.target.setAttribute("isValid", true);
                e.target.setCustomValidity("");
                password.setAttribute("isValid", true);
                password.setCustomValidity("");
            }
        }
    };

    const initEmail = () => {
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        if (emailInput) {
            emailInput.value = email;
            passwordInput.focus();
        }
    };

    return (
        <Fragment>
            <div className={cx("wrapper")} onLoad={() => initEmail()}>
                <div className={cx("login-card-container")}>
                    <div className={cx("login-card")}>
                        <Link to="/" className={cx("back")}>
                            <IoArrowBack />
                        </Link>
                        <div className={cx("login-card-logo")}>
                            <img src="assets/images/logo.png" alt="logo" />
                        </div>
                        <div className={cx("login-card-header")}>
                            {isLoginForm ? (
                                <>
                                    <h1>Đăng nhập</h1>
                                    <div>Vui lòng đăng nhập để sử dụng đầy đủ tính năng</div>
                                </>
                            ) : (
                                <>
                                    <h1>Đăng ký</h1>
                                    <div>Đăng ký để tham gia vào thế giới âm nhạc</div>
                                </>
                            )}
                            {message && success ? (
                                <div id="message" className={cx("message", "success")}>
                                    {message}
                                </div>
                            ) : (
                                <div id="message" className={cx("message", "fail")}>
                                    {message}
                                </div>
                            )}
                        </div>
                        <form className={cx("login-card-form")} onSubmit={(e) => handleSubmitForm(e)} ref={formRef}>
                            <div className={cx("form-item")}>
                                <span className={cx("form-item-icon")}>
                                    <HiOutlineMail />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Nhập email"
                                    name="email"
                                    id="email"
                                    autoFocus
                                    required
                                    spellCheck="false"
                                    onChange={(e) => handleEmailInput(e)}
                                />
                            </div>
                            <div className={cx("form-item")}>
                                <span className={cx("form-item-icon")}>
                                    <MdLockOutline />
                                </span>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    name="password"
                                    id="password"
                                    required
                                    onChange={(e) => handlePasswordInput(e)}
                                />
                            </div>
                            {!isLoginForm && (
                                <div className={cx("form-item")}>
                                    <span className={cx("form-item-icon")}>
                                        <MdLockOutline />
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="Nhập lại mật khẩu"
                                        name="repassword"
                                        id="repassword"
                                        required
                                        onChange={(e) => handleRepasswordInput(e)}
                                    />
                                </div>
                            )}
                            {isLoginForm && (
                                <div className={cx("form-item-other")}>
                                    <div className={cx("checkbox")}>
                                        <input type="checkbox" id="rememberMeCheckbox" />
                                        <label htmlFor="rememberMeCheckbox">Nhớ tên đăng nhập</label>
                                    </div>
                                    <span>Quên mật khẩu!</span>
                                </div>
                            )}
                            <button type="submit">{isLoginForm ? "Đăng nhập" : "Đăng ký"}</button>
                        </form>
                        {isLoginForm ? (
                            <div className={cx("login-card-footer")}>
                                Chưa có tài khoản?
                                <span onClick={() => setIsLoginForm(false)}> Tạo tài khoản.</span>
                            </div>
                        ) : (
                            <div className={cx("login-card-footer")}>
                                Đã có tài khoản?
                                <span onClick={() => setIsLoginForm(true)}> Đăng nhập.</span>
                            </div>
                        )}
                    </div>
                    {/* <div class={cx("login-card-social")}>
                    <div>Other Sign-In Options</div>
                    <div class="login-card-social-btns">
                        <a href="#">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon icon-tabler icon-tabler-brand-facebook"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path>
                            </svg>
                        </a>
                        <a href="#">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon icon-tabler icon-tabler-brand-google"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                stroke-width="3"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8"></path>
                            </svg>
                        </a>
                    </div>
                </div> */}
                </div>
            </div>
            <MusicPlayer audio={audio} />
        </Fragment>
    );
}

export default LoginLayout;
