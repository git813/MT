import classNames from "classnames/bind";
import styles from "./RoomManager.module.scss";
import { Link } from "react-router-dom";
import { BiPlus } from "react-icons/bi";
import { useContext } from "react";
import { AccountContext } from "../../../../contexts/AccountContext";
import { apiAccountImage, hostLink } from "../../../../utils/const";
const cx = classNames.bind(styles);

function RoomManager() {
    const { account } = useContext(AccountContext);

    return (
        <div className={cx("wrapper")}>
            <Link to="/" className={cx("header-logo")}>
                <img src="../assets/images/logo.png" alt="logo" />
            </Link>

            <div className={cx("search-bar")}>
                <input placeholder="Nhập tên phòng, ID"></input>
                <BiPlus />
            </div>
            {account ? (
                <div className={cx("room")}>
                    <div className={cx("master")}>
                        <img src={hostLink + apiAccountImage + account.accountImage} />
                        <p className={cx("name")}>{account.name}</p>
                    </div>
                </div>
            ) : (
                <div className={cx("room--disabled")}>Vui lòng đăng nhập để sử dụng </div>
            )}
        </div>
    );
}

export default RoomManager;
