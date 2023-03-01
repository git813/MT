import styles from "./ArtistSong.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import { hostLink, apiArtistImage } from "../../utils/const";
import request from "../../utils/request";
import { useParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import BannerSong from "../../components/BannerSong";
const cx = classNames.bind(styles);

function ArtistSong() {
    const [listSong, setListSong] = useState([]);
    const [artist, setArtist] = useState({});
    const [page, setPage] = useState(0);
    const [songCount, setSongCount] = useState(0);
    let { slug } = useParams();
    const perPage = 20;
    useEffect(() => {
        const artistSlug = window.location.pathname.replace("/artist/", "");

        request.get("/artist/" + artistSlug).then((res) => {
            setArtist(res.data[0]);
        });
        request.get("/song/count?artist=" + artistSlug).then((res) => {
            setSongCount(res.data.count);
        });
    }, [window.location.pathname]);

    useEffect(() => {
        request.get(`/song?artists=${artist._id}&limit=${perPage}&page=${page}`).then((res) => {
            setListSong(res.data);
        });
    }, [artist, page]);

    return (
        <div className={cx("wrapper")}>
            <div className={cx("banner-singer")}>
                {artist.artistImage && <img src={hostLink + apiArtistImage + artist.artistImage} />}
                <div className={cx("name")}>{artist.artistName}</div>
            </div>
            <div className={cx("header-text")}>Danh sách bài hát</div>
            {listSong && listSong.length == 0 && <div className={cx("nosong-text")}>Ca sĩ chưa có bài hát nào</div>}
            <div className={cx("content")}>{listSong && listSong.map((song) => <BannerSong song={song} />)}</div>
            {songCount > perPage && <Pagination page={page} perPage={perPage} count={songCount} setPage={setPage} />}
        </div>
    );
}

export default ArtistSong;
