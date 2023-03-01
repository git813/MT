import Header from "./Header";
import RoomManage from "./RoomManager";
import MusicPlayer from "../../MusicPlayer";
import Menu from "../../Menu";
import styles from "./DefaultLayout.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

function DefaultLayout({ children, audio }) {
    return (
        <div className={cx("wrapper")}>
            <Header audio={audio} />
            <div className={cx("container")}>
                <RoomManage />
                <div className={cx("content")}>{children}</div>
                <MusicPlayer audio={audio} />
                <Menu />
            </div>
        </div>
    );
}

export default DefaultLayout;
