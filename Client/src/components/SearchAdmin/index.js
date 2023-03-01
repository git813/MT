import classNames from "classnames/bind";
import styles from "./SearchAdmin.module.scss";
import { useState, useEffect, useContext } from "react";
import request, { requestWithToken } from "../../utils/request";
import { useDebounce } from "../../utils";
import { BiSearch, BiLoaderCircle } from "react-icons/bi";
import { MdClear } from "react-icons/md";
import { AccountContext } from "../../contexts/AccountContext";
const cx = classNames.bind(styles);

function SearchAdmin({ tab, setItem, setCount, page, setPage, perPage, editItem, setCheckedList }) {
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const debounced = useDebounce(searchValue, 800);
    const { account } = useContext(AccountContext);
    useEffect(() => {
        setLoading(true);
        if (tab == "song") {
            request.get("/song/count?songName=" + encodeURIComponent(debounced)).then((res) => {
                setCount(res.data.count);
            });

            if (page != 0) setPage(0);
            else {
                request
                    .get(`/song?limit=${perPage}&page=${page}&songName=` + encodeURIComponent(debounced))
                    .then((res) => {
                        setItem(res.data);
                    })
                    .catch((err) => console.log(err.code))
                    .finally(() => setLoading(false));
            }
        } else if (tab == "artist") {
            request.get("/artist/count?artistName=" + encodeURIComponent(debounced)).then((res) => {
                setCount(res.data.count);
            });

            if (page != 0) setPage(0);
            else {
                request
                    .get(`/artist?limit=${perPage}&page=${page}&artistName=` + encodeURIComponent(debounced))
                    .then((res) => {
                        setItem(res.data);
                    })
                    .catch((err) => console.log(err.code))
                    .finally(() => setLoading(false));
            }
        } else if (tab == "genre") {
            request.get("/genre/count?artistName=" + encodeURIComponent(debounced)).then((res) => {
                setCount(res.data.count);
            });

            if (page != 0) setPage(0);
            else {
                request
                    .get(`/genre?limit=${perPage}&page=${page}&genreName=` + encodeURIComponent(debounced))
                    .then((res) => {
                        setItem(res.data);
                    })
                    .catch((err) => console.log(err.code))
                    .finally(() => setLoading(false));
            }
            setCheckedList([]);
        } else if (tab == "account") {
            requestWithToken(account.accessToken)
                .get("/admin/account/count?email=" + encodeURIComponent(debounced))
                .then((res) => {
                    setCount(res.data.count);
                });

            if (page != 0) setPage(0);
            else {
                requestWithToken(account.accessToken)
                    .get(`/admin/account?limit=${perPage}&page=${page}&email=` + encodeURIComponent(debounced))
                    .then((res) => {
                        setItem(res.data);
                    })
                    .catch((err) => console.log(err.code))
                    .finally(() => setLoading(false));
            }
        }
    }, [debounced, editItem]);

    useEffect(() => {
        if (tab == "song") {
            request
                .get(`/song?limit=${perPage}&page=${page}&songName=` + encodeURIComponent(debounced))
                .then((res) => {
                    setItem(res.data);
                })
                .catch((err) => console.log(err.code))
                .finally(() => setLoading(false));
        } else if (tab == "artist") {
            request
                .get(`/artist?limit=${perPage}&page=${page}&artistName=` + encodeURIComponent(debounced))
                .then((res) => {
                    setItem(res.data);
                })
                .catch((err) => console.log(err.code))
                .finally(() => setLoading(false));
        } else if (tab == "genre") {
            request
                .get(`/genre?limit=${perPage}&page=${page}&genreName=` + encodeURIComponent(debounced))
                .then((res) => {
                    setItem(res.data);
                })
                .catch((err) => console.log(err.code))
                .finally(() => setLoading(false));
        } else if (tab == "account") {
            requestWithToken(account.accessToken)
                .get(`/admin/account?limit=${perPage}&page=${page}&email=` + encodeURIComponent(debounced))
                .then((res) => {
                    setItem(res.data);
                })
                .catch((err) => console.log(err.code))
                .finally(() => setLoading(false));
        }
    }, [page, editItem]);

    const handleClear = () => {
        setSearchValue("");
        setLoading(false);
    };
    return (
        <div className={cx("search")}>
            <div>
                <BiSearch />
                <input
                    placeholder={
                        tab == "song"
                            ? "Tìm kiếm bài hát"
                            : tab == "artist"
                            ? "Tìm kiếm ca sĩ"
                            : tab == "genre"
                            ? "Tìm kiếm thể loại"
                            : "Tìm kiếm email"
                    }
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    spellCheck="false"
                ></input>
                {!loading && searchValue != "" && <MdClear className={cx("clear")} onClick={() => handleClear()} />}
                {loading && <BiLoaderCircle className={cx("loading")} />}
            </div>
        </div>
    );
}
export default SearchAdmin;
