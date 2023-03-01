import classNames from "classnames/bind";
import styles from "./MusicPlayer.module.scss";
import { Fragment, useContext } from "react";
import { MusicPlayerContext } from "../../contexts/MusicPlayerContext";
import { MenuContext } from "../../contexts/MenuContext";
import { parseListArtist, parseTimeStringToSecond } from "../../utils";
import { hostLink, defaultSongImage, apiSongImage } from "../../utils/const";
import { MdOutlineRepeat, MdOutlinePlaylistAdd } from "react-icons/md";
import {
    BsShuffle,
    BsSkipStartFill,
    BsSkipEndFill,
    BsPauseCircle,
    BsPlayCircle,
    BsMusicNoteList,
    BsVolumeMute,
    BsTrash,
    BsFillPlayFill,
    BsFillPauseFill,
    BsThreeDots,
} from "react-icons/bs";
import { IoVolumeMediumOutline } from "react-icons/io5";
import { RiRepeatOneLine } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa";

const cx = classNames.bind(styles);

function MusicPlayer({ audio }) {
    const { MenuType, toggleMenu } = useContext(MenuContext);
    const {
        musicPlayer,
        showPlaylist,
        playlist,
        playlistOrigin,
        recommendList,
        setIsPlay,
        setIsLoop,
        setIsShuffle,
        setVolume,
        setVolumeAndPremute,
        setCurrentTime,
        setShowPlaylist,
        setPlaylist,
        setPlaylistOrigin,
        changeSong,
        removeSong,
        addSong,
    } = useContext(MusicPlayerContext);

    let {
        songName = "",
        artists = [],
        currentTime = "00:00",
        lengthSong = "00:00",
        volume = 1,
        volumePremute = 1,
        songImage = defaultSongImage,
        songLink = "",
        isPlaying = false,
        isShuffle = false,
        isLoop = 0,
        idPlaying = null,
    } = musicPlayer;

    const adjustRangeBar = (target, value) => {
        const percent = (value / target.max) * 100;
        const primaryColor = "#ffffff";
        const progressColor = "#808080";
        target.style.background = `linear-gradient(to right, ${primaryColor} ${percent}%, ${progressColor} ${percent}%`;
        target.style.borderRadius = `8px`;
    };

    const getSongPlayingIndex = (idSong) => {
        return playlist.findIndex((song) => {
            return song.id == idSong;
        });
    };

    const shuffleList = (list, indexSongPlaying) => {
        const shuffledList = [];
        let tmpList = [...list];
        shuffledList.push(tmpList[indexSongPlaying]);
        tmpList = tmpList.slice(0, indexSongPlaying).concat(tmpList.slice(indexSongPlaying + 1, tmpList.length));
        let randomIndex;
        while (tmpList.length > 0) {
            randomIndex = Math.floor(Math.random() * tmpList.length);
            shuffledList.push(tmpList[randomIndex]);
            tmpList = tmpList.slice(0, randomIndex).concat(tmpList.slice(randomIndex + 1, tmpList.length));
        }

        return shuffledList;
    };

    const handleShuffleSong = () => {
        if (isShuffle) {
            setIsShuffle(false);
            setPlaylist(playlistOrigin);
            localStorage.setItem("playlist", JSON.stringify(playlistOrigin));
        } else {
            setIsShuffle(true);
            const songPlayingIndex = playlist.findIndex((song) => {
                return song.id == idPlaying;
            });
            const shuffledList = shuffleList(playlist, songPlayingIndex);
            setPlaylistOrigin(playlist);
            setPlaylist(shuffledList);
            localStorage.setItem("shuffledPlaylist", JSON.stringify(shuffledList));
        }
    };

    const handlePlaySong = () => {
        if (!audio.current.src) return;
        setIsPlay(!isPlaying);
    };

    const handleLoopSong = () => {
        isLoop++;
        if (isLoop > 2) isLoop = 0;
        setIsLoop(isLoop);
    };

    const handleMuteVolume = () => {
        setVolumeAndPremute(0, audio.current.volume);
        audio.volume = 0;
    };

    const handleUnmuteVolume = () => {
        setVolume(volumePremute);
        audio.volume = volumePremute;
    };

    const handleChangeVolume = (value) => {
        value == 0 ? setVolume(0) : setVolume(value / 100);
        audio.volume = value / 100;
    };

    const handleTimeChange = (time) => {
        audio.current.currentTime = time;
        setCurrentTime(time, isPlaying);
    };

    const handleNextSong = () => {
        if (playlist.length > 1) {
            let indexCurrent = playlist.findIndex((song) => {
                return song.id == idPlaying;
            });
            const nextIndex = indexCurrent == playlist.length - 1 ? 0 : indexCurrent + 1;
            changeSong(playlist[nextIndex], audio, playlist[nextIndex].id);
        }
    };

    const handleBackSong = () => {
        if (playlist.length > 1) {
            let indexCurrent = playlist.findIndex((song) => {
                return song.id == idPlaying;
            });
            const preIndex = indexCurrent == 0 ? playlist.length - 1 : indexCurrent - 1;
            changeSong(playlist[preIndex], audio, playlist[preIndex].id);
        }
    };

    const isExistInPlaylist = (song) => {
        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].songLink == song) return true;
        }
    };

    const renderPlaylist = () => {
        let isPassed = true;
        if (playlist.length < 1) return;
        const playListRender = playlist.map((song, index) => {
            if (!isPassed) {
                return (
                    <div className={cx("song")} key={song.id}>
                        <div className={cx("image")} onClick={() => changeSong(song, audio, song.id)}>
                            <img src={hostLink + apiSongImage + song.songImage} />
                            <div className={cx("overlay")}>
                                <BsFillPlayFill />
                            </div>
                        </div>
                        <div className={cx("text")}>
                            <p className={cx("name")}>{song.songName}</p>
                            <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
                        </div>
                        <div className={cx("action")}>
                            <BsTrash onClick={() => removeSong(song.id)} />
                            <BsThreeDots onClick={(e) => toggleMenu(e, song, MenuType.MenuNotPlaylist)} />
                        </div>
                    </div>
                );
            } else if (song.id != idPlaying) {
                return (
                    <div className={cx("song", "passed")} key={song.id}>
                        <div className={cx("image")} onClick={() => changeSong(song, audio, song.id)}>
                            <img src={hostLink + apiSongImage + song.songImage} />
                            <div className={cx("overlay")}>
                                <BsFillPlayFill />
                            </div>
                        </div>
                        <div className={cx("text")}>
                            <p className={cx("name")}>{song.songName}</p>
                            <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
                        </div>
                        <div className={cx("action")}>
                            <BsTrash onClick={() => removeSong(song.id)} />
                            <BsThreeDots onClick={(e) => toggleMenu(e, song, MenuType.MenuNotPlaylist)} />
                        </div>
                    </div>
                );
            } else {
                isPassed = false;
                return (
                    <Fragment>
                        <div className={cx("song", "playing")} key={song.id}>
                            <div className={cx("image")} onClick={() => setIsPlay(!isPlaying)}>
                                <img src={hostLink + apiSongImage + song.songImage} />
                                <div className={cx("overlay")}>
                                    {isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
                                </div>
                            </div>
                            <div className={cx("text")}>
                                <p className={cx("name")}>{song.songName}</p>
                                <p className={cx("artist")}>{parseListArtist(song.artists)}</p>
                            </div>
                            <div className={cx("action")}></div>
                        </div>
                        {index == playlist.length - 1 ? null : <div className={cx("text-header")}>Tiếp theo</div>}
                    </Fragment>
                );
            }
        });
        return playListRender;
    };

    const volumeBar = document.getElementById("volumeBar");
    const timeBar = document.getElementById("timeBar");
    window.addEventListener("load", () => {
        if (volumeBar) adjustRangeBar(volumeBar, volume * 100);
        if (playlist) {
            const songCache = playlist.find((song) => {
                if (song.id == idPlaying) return song;
            });
            console.log(songCache);
            if (!songCache) changeSong(playlist[0], audio, playlist[0].id, false);
            else changeSong(songCache, audio, songCache.id, false);
        }
    });

    if (volumeBar) {
        adjustRangeBar(volumeBar, volume * 100);
    }

    if (timeBar) {
        adjustRangeBar(timeBar, parseTimeStringToSecond(currentTime));
    }
    //handleAudioEvent
    if (audio.current && audio.current.src) {
        audio.current.volume = volume;
        if (isPlaying) {
            if (true || audio.current.paused) {
                audio.current.ontimeupdate = () => {
                    setCurrentTime(audio.current.currentTime, isPlaying);
                };

                const indexSong = getSongPlayingIndex(idPlaying);
                audio.current.onended = () => {
                    switch (isLoop) {
                        case 0:
                            if (indexSong == playlist.length - 1) setCurrentTime(audio.current.duration, false);
                            else handleNextSong();
                            break;
                        case 1:
                            //repeat list
                            console.log("next");
                            handleNextSong();
                            break;
                        case 2:
                            //repeat one
                            changeSong(playlist[indexSong], audio, idPlaying);
                            break;
                        default:
                            console.log(isLoop === 1);
                            console.log("wrong state");
                    }
                };
                audio.current.play();
            }
        } else {
            if (true || !audio.current.paused) {
                audio.current.pause();
                audio.current.ontimeupdate = () => {};
            }
        }
    }

    return (
        <div className={cx("wrapper")}>
            <div className={cx("detail")}>
                <img src={songImage ? hostLink + apiSongImage + songImage : '../assets/images/defaultSongImage.png'} alt="Image" />
                <div className={cx("text")}>
                    <div className={cx("name")}>{songName}</div>
                    <div className={cx("artist")}>{parseListArtist(artists)}</div>
                </div>
            </div>
            <div className={cx("controller")}>
                <div className={cx("button")}>
                    <div className={cx("shuffle")} onClick={() => handleShuffleSong()}>
                        {isShuffle ? <BsShuffle style={{ color: "var(--primary-color" }} /> : <BsShuffle />}
                    </div>
                    <div className={cx("previous")} onClick={() => handleBackSong()}>
                        <BsSkipStartFill />
                    </div>
                    <div className={cx("play")} onClick={() => handlePlaySong()}>
                        {isPlaying ? <BsPauseCircle /> : <BsPlayCircle />}
                    </div>
                    <div className={cx("next")} onClick={() => handleNextSong()}>
                        <BsSkipEndFill />
                    </div>
                    <div className={cx("repeat")} onClick={() => handleLoopSong()}>
                        {isLoop == 0 && <MdOutlineRepeat />}
                        {isLoop > 0 &&
                            (isLoop == 1 ? (
                                <MdOutlineRepeat style={{ color: "var(--primary-color" }} />
                            ) : (
                                <RiRepeatOneLine style={{ color: "var(--primary-color" }} />
                            ))}
                    </div>
                </div>
                <div className={cx("time")}>
                    <p>{currentTime}</p>
                    <input
                        id="timeBar"
                        type="range"
                        min="0"
                        max={parseTimeStringToSecond(lengthSong)}
                        value={parseTimeStringToSecond(currentTime)}
                        onChange={(e) => handleTimeChange(e.target.value)}
                    />
                    <p>{lengthSong}</p>
                </div>
            </div>
            <div className={cx("vollist")}>
                <div className={cx("volume")}>
                    {volume > 0 ? (
                        <div>
                            <IoVolumeMediumOutline onClick={() => handleMuteVolume()} />
                        </div>
                    ) : (
                        <div>
                            <BsVolumeMute onClick={() => handleUnmuteVolume()} />
                        </div>
                    )}
                    <input
                        id="volumeBar"
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100}
                        onChange={(e) => handleChangeVolume(e.target.value)}
                    />
                </div>
                <div className={cx("playlist")}>
                    {showPlaylist ? (
                        <div className={cx("iconlist", "opened")} onClick={() => setShowPlaylist(!showPlaylist)}>
                            <BsMusicNoteList />
                        </div>
                    ) : (
                        <div className={cx("iconlist")} onClick={() => setShowPlaylist(!showPlaylist)}>
                            <BsMusicNoteList />
                        </div>
                    )}
                    {showPlaylist ? (
                        <div className={cx("list")}>
                            <div className={cx("text-header")}>Danh sách phát</div>
                            {playlist.length > 0 ? (
                                <Fragment>
                                    {renderPlaylist()}
                                    {recommendList.length > 0 && (
                                        <Fragment>
                                            <div className={cx("text-header")}>Danh sách gợi ý</div>
                                            <div className={cx("text-content")}>Dựa theo bài hát hiện tại</div>
                                            {recommendList.map((song, index) => {
                                                if (!isExistInPlaylist(song.songLink))
                                                    return (
                                                        <div className={cx("song")} key={index}>
                                                            <div
                                                                className={cx("image")}
                                                                onClick={() => changeSong(song, audio)}
                                                            >
                                                                <img src={hostLink + apiSongImage + song.songImage} />
                                                                <div className={cx("overlay")}>
                                                                    <BsFillPlayFill />
                                                                </div>
                                                            </div>
                                                            <div className={cx("text")}>
                                                                <p className={cx("name")}>{song.songName}</p>
                                                                <p className={cx("artist")}>
                                                                    {parseListArtist(song.artists)}
                                                                </p>
                                                            </div>
                                                            <div className={cx("action")}>
                                                                <MdOutlinePlaylistAdd onClick={() => addSong(song)} />
                                                                <BsThreeDots
                                                                    onClick={(e) =>
                                                                        toggleMenu(e, song, MenuType.MenuNotPlaylist)
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                            })}
                                        </Fragment>
                                    )}
                                </Fragment>
                            ) : (
                                <div className={cx("text-content")}>Danh sách rỗng</div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default MusicPlayer;
