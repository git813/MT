import styles from "./Genre.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect, useContext } from "react";
import React from "react";
import request from "../../utils/request";
import { MdClear } from "react-icons/md";
import BannerSong from "../../components/BannerSong";
import Pagination from "../../components/Pagination";

const cx = classNames.bind(styles);
function Genre() {
    const [listGenre, setListGenre] = useState([]);
    const [listSelectedGenreState, setListSelectedGenreState] = useState([]);
    const [listSongState, setListSongState] = useState([]);
    const [page, setPage] = useState(0);
    const [songCount, setSongCount] = useState(0);
    const perPage = 20;
    useEffect(() => {
        request.get("/genre").then((res) => {
            setListGenre(res.data);
            removeAllGenreSelected();
        });
        request.get(`/song/count`).then((res) => {
            setSongCount(res.data.count);
        });
    }, []);

    const genreClick = (genre) => {
        let newSelectedGenreState = listSelectedGenreState;
        if (listSelectedGenreState.includes(genre)) {
            const index = listSelectedGenreState.indexOf(genre);
            if (index !== -1) newSelectedGenreState.splice(index, 1);
        } else {
            newSelectedGenreState.push(genre);
        }
        setListSelectedGenreState(newSelectedGenreState);

        let query = "?";
        newSelectedGenreState.forEach((genre) => {
            if (genre) query += "genres=" + genre._id + "&";
        });
        request.get(`/song/count${query}`).then((res) => {
            setSongCount(res.data.count);
        });
        setPage(0);
    };

    useEffect(() => {
        let query = "?";
        listSelectedGenreState.forEach((genre) => {
            if (genre) query += "genres=" + genre._id + "&";
        });
        request.get(`/song${query}limit=${perPage}&page=${page}`).then((res) => {
            setListSongState(res.data);
        });
    }, [page, listSelectedGenreState, songCount]);

    const removeAllGenreSelected = () => {
        setListSelectedGenreState([]);
        request.get("/song").then((res) => {
            const listSongData = [];
            for (let song of res.data) {
                listSongData.push(song);
            }
            setListSongState(listSongData);
        });
    };

    return (
        <div className={cx("wrapper")}>
            <div className={cx("heading")}>
                Danh sách thể loại
                {listSelectedGenreState.length > 0 && (
                    <h4 onClick={() => removeAllGenreSelected()}>
                        Bỏ chọn tất cả <MdClear />
                    </h4>
                )}
            </div>
            <div className={cx("category-list")}>
                {listGenre.map((genre) =>
                    listSelectedGenreState.includes(genre) ? (
                        <div key={genre._id} className={cx("category", "picked")} onClick={() => genreClick(genre)}>
                            {genre.genreName}
                        </div>
                    ) : (
                        <div key={genre._id} className={cx("category")} onClick={() => genreClick(genre)}>
                            {genre.genreName}
                        </div>
                    )
                )}
            </div>
            {listSongState.length > 0 ? (
                <div className={cx("content")}>
                    {listSongState.map((song) => (
                        <BannerSong song={song} />
                    ))}
                </div>
            ) : (
                <div className={cx("no-content")}>Không có kết quả phù hợp </div>
            )}
            {songCount > perPage && <Pagination page={page} perPage={perPage} count={songCount} setPage={setPage} />}
        </div>
    );
}

export default Genre;
