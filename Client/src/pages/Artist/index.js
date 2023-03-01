import styles from "./Artist.module.scss";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import request from "../../utils/request";
import { apiArtistImage, hostLink } from "../../utils/const";
import Pagination from "../../components/Pagination";
const cx = classNames.bind(styles);

function Artist() {
    const [listArtist, setListArtist] = useState([]);
    const [page, setPage] = useState(0);
    const [artistCount, setArtistCount] = useState(0);
    const perPage = 20;
    useEffect(() => {
        request.get(`/artist/count`).then((res) => {
            setArtistCount(res.data.count);
        });
    }, []);

    useEffect(() => {
        request.get(`/artist?limit=${perPage}&page=${page}`).then((res) => {
            setListArtist(res.data);
        });
    }, [page]);
    return (
        <div className={cx("wrapper")}>
            <div className={cx("heading")}>Danh sách ca sĩ</div>
            <div className={cx("content")}>
                {listArtist.map((artist, index) => (
                    <Link key={index} className={cx("medium-banner")} to={"/artist/" + artist.artistLink}>
                        <img src={hostLink + apiArtistImage + artist.artistImage} />
                        <p className={cx("name")}>{artist.artistName}</p>
                    </Link>
                ))}
            </div>
            {artistCount > perPage && (
                <Pagination page={page} perPage={perPage} count={artistCount} setPage={setPage} />
            )}
        </div>
    );
}

export default Artist;
