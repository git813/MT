import styles from "./General.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect, useContext } from "react";
import request from "../../utils/request";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import BannerSong from "../../components/BannerSong";
import Pagination from "../../components/Pagination";
const cx = classNames.bind(styles);

function General() {
    const location = useLocation();
    const [listSong, setListSong] = useState([]);
    const [page, setPage] = useState(0);
    const [songCount, setSongCount] = useState(0);
    const [filterQuery, setFilterQuery] = useState(new URLSearchParams(location.search).get("filter"));
    const navigate = useNavigate();
    const perPage = 20;
    useEffect(() => {
        request.get(`/song/count`).then((res) => {
            setSongCount(res.data.count);
        });
    }, []);

    useEffect(() => {
        request.get(`/song/general?filter=${filterQuery}&limit=${perPage}&page=${page}`).then((res) => {
            setListSong(res.data);
        });
    }, [filterQuery, page]);

    const colourStyles = {
        control: (styles) => ({ ...styles, backgroundColor: "white" }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                    ? "var(--primary-color)"
                    : isFocused
                    ? "var(--gray-color)"
                    : undefined,
                cursor: isDisabled ? "not-allowed" : "pointer",
            };
        },
        multiValue: (styles) => {
            return {
                ...styles,
                backgroundColor: "#b3cde0",
            };
        },
        multiValueLabel: (styles) => ({
            ...styles,
            color: "#22b052",
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: "white",
            ":hover": {
                color: "red",
            },
        }),
        menuList: (styles) => {
            return {
                ...styles,
                color: "var(--black-color)",
            };
        },
        valueContainer: (styles) => ({
            ...styles,
            width: "600px",
        }),
    };
    const optionSelect = [
        { value: "name", label: "Tên" },
        { value: "top-listen", label: "Lượt nghe" },
        { value: "new", label: "Ngày phát hành" },
    ];

    const setComboboxOption = () => {
        if (filterQuery == "top-listen") {
            return optionSelect[1];
        } else if (filterQuery == "new") {
            return optionSelect[2];
        }
        return optionSelect[0];
    };

    return (
        <div className={cx("wrapper")}>
            <div className={cx("heading")}>
                <div className={cx("heading-text")}>Danh sách nhạc</div>
                <div className={cx("heading-filter")}>
                    <Select
                        options={optionSelect}
                        defaultValue={setComboboxOption()}
                        styles={colourStyles}
                        className={cx("filter-select")}
                        isSearchable={false}
                        onChange={(e) => {
                            setFilterQuery(e.value);
                            navigate(`/song?filter=${e.value}`);
                        }}
                    />
                </div>
            </div>
            <div className={cx("content")}>
                {listSong.map((song) => (
                    <BannerSong song={song} />
                ))}
            </div>
            {songCount > perPage && <Pagination page={page} perPage={perPage} count={songCount} setPage={setPage} />}
        </div>
    );
}

export default General;
