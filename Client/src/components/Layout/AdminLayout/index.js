import Header from "./Header";
import MusicPlayer from "../../MusicPlayer";
import styles from "./AdminLayout.module.scss";
import classNames from "classnames/bind";
import Menu from "../../Menu";
import { Fragment, useContext } from "react";
import { AccountContext } from "../../../contexts/AccountContext";
const cx = classNames.bind(styles);

function AdminLayout({ children, audio }) {
    const { account } = useContext(AccountContext);
    if (!account || account.role != 0) window.location.href = "/";
    return (
        <Fragment>
            {account && (
                <div className={cx("wrapper")}>
                    <div className={cx("container")}>
                        <Header />
                        <div className={cx("content")}>{children}</div>
                        <MusicPlayer audio={audio} />
                        <Menu />
                    </div>
                </div>
            )}
        </Fragment>
    );
}

export default AdminLayout;
