import styles from "./Pagination.module.scss";
import classNames from "classnames/bind";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
const cx = classNames.bind(styles);
function Pagination({ setPage, page, count, perPage }) {
    const renderPage = () => {
        let tmp = [];
        const pageNum = Math.ceil(count / perPage);
        for (let i = page - 2; i < page + 3; i++) {
            if (i == pageNum) break;
            if (i == page) {
                tmp[i] = (
                    <div className={cx("page", "current-page")} onClick={() => setPage(i)}>
                        {i + 1}
                    </div>
                );
            } else
                tmp[i] = (
                    <div className={cx("page")} onClick={() => setPage(i)}>
                        {i + 1}
                    </div>
                );
        }
        return tmp;
    };
    return (
        <div className={cx("pagination")}>
            <div className={cx("page")} onClick={() => (page > 0 ? setPage(page - 1) : null)}>
                <IoIosArrowBack />
            </div>
            {renderPage()}
            <div className={cx("page")} onClick={() => (page < count / perPage - 1 ? setPage(page + 1) : null)}>
                <IoIosArrowForward />
            </div>
        </div>
    );
}

export default Pagination;
