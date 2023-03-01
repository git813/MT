import React, { createContext, useState } from "react";
import { hostLink } from "../utils/const";
import { parseSecondToMinute, toastNotify } from "../utils";
import request from "../utils/request";

export const MusicPlayerContext = createContext();

const MusicPlayerContextProvider = ({ audio, children }) => {
    const volumeCache = localStorage.getItem("volume");
    const idPlayingCache = localStorage.getItem("idPlaying");
    const isLoopCache = Number(localStorage.getItem("isLoop"));
    const isShuffleCache = localStorage.getItem("isShuffle");
    const playListCache = JSON.parse(localStorage.getItem("playlist"))
        ? JSON.parse(localStorage.getItem("playlist"))
        : [];
    const shuffledPlaylistCache = JSON.parse(localStorage.getItem("shuffledPlaylist"))
        ? JSON.parse(localStorage.getItem("shuffledPlaylist"))
        : [];
    const [musicPlayer, setMusicPlayer] = useState({
        volume: volumeCache ? volumeCache : 1,
        volumePremute: 1,
        time: 0,
        idPlaying: idPlayingCache != null ? idPlayingCache : 0,
        isLoop: isLoopCache != null ? isLoopCache : 0,
        isShuffle: isShuffleCache != null ? isShuffleCache === "true" : false,
    });
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [playlist, setPlaylist] = useState(isShuffleCache == true ? shuffledPlaylistCache : playListCache);
    const [playlistOrigin, setPlaylistOrigin] = useState(playListCache ? playListCache : []);
    const [recommendList, setRecommendList] = useState([]);

    //Function
    const changeSong = (song, a, idPlaylist, play) => {
        const { songName, songImage, artists, songLink } = song;
        const id = Date.now();
        request
            .get("song/getlink/" + song._id)
            .then((res) => {
                if (res.data.success) {
                    audio.current.src = hostLink + "/api/song/" + res.data.songLink;
                } else {
                    setMusicPlayer({});
                    localStorage.removeItem("idPlaying");
                    toastNotify("Bài hát không khả dụng");
                }
            })
            .catch(() => {
                toastNotify("Có lỗi xảy ra");
            });

        audio.current.onloadeddata = () => {
            const lengthSong = parseSecondToMinute(audio.current.duration);
            setMusicPlayer({
                ...musicPlayer,
                songName,
                songImage,
                artists,
                currentTime: "00:00",
                lengthSong: lengthSong,
                songLink,
                isPlaying: play != null ? play : true,
                idPlaying: idPlaylist == null ? id : idPlaylist,
            });

            if (idPlaylist == null) {
                song = { ...song, id: id };
                setPlaylist([...playlist, song]);
                localStorage.setItem("idPlaying", song.id);
                localStorage.setItem("playlist", JSON.stringify([...playlist, song]));
            } else {
                localStorage.setItem("idPlaying", idPlaylist);
            }
            request
                .get(`/song/rec-all?songLink=${song.songLink}&top=10`)
                .then((res) => {
                    if (res.data.success == false) {
                    } else setRecommendList(res.data);
                })
                .catch();
        };
    };

    const setIsPlay = (state) => {
        setMusicPlayer({ ...musicPlayer, isPlaying: state });
    };

    const setIsLoop = (state) => {
        localStorage.setItem("isLoop", state);
        setMusicPlayer({ ...musicPlayer, isLoop: state });
    };

    const setIsShuffle = (state) => {
        localStorage.setItem("isShuffle", state);
        if (state) setMusicPlayer({ ...musicPlayer, isShuffle: state });
        else setMusicPlayer({ ...musicPlayer, isShuffle: state });
    };

    const setVolume = (volume) => {
        localStorage.setItem("volume", volume);
        setMusicPlayer({ ...musicPlayer, volume: volume });
    };

    const setVolumeAndPremute = (volume, premute) => {
        setMusicPlayer({ ...musicPlayer, volume: volume, volumePremute: premute });
    };

    const setCurrentTime = (time, playState) => {
        setMusicPlayer({ ...musicPlayer, isPlaying: playState, currentTime: parseSecondToMinute(time) });
    };

    const addSong = (song) => {
        song = { ...song, id: Date.now() };
        setPlaylist([...playlist, song]);
        setPlaylistOrigin([...playlistOrigin, song]);
        toastNotify("Đã thêm vào danh sách phát");

        if (playlist.length < 1) {
            changeSong(song, audio, song.id);
        }
        localStorage.setItem("playlist", JSON.stringify([...playlist, song]));
        localStorage.setItem("shuffledPlaylist", JSON.stringify([...playlistOrigin, song]));
    };

    const addPlaylist = (p) => {
        for (let i = 0; i < p.length; i++) {
            p[i] = { ...p[i], id: Date.now() + i };
        }
        setPlaylist(playlist.concat(p));
        setPlaylistOrigin(playlistOrigin.concat(p));

        if (playlist.length < 1) {
            changeSong(p[0], audio, p[0].id);
        }
        localStorage.setItem("playlist", JSON.stringify(playlist.concat(p)));
        localStorage.setItem("shuffledPlaylist", JSON.stringify(playlistOrigin.concat(p)));
    };

    const removeSong = (id) => {
        //playlist
        const removePlaylistIndex = playlist.findIndex((song) => {
            return song.id == id;
        });
        let newPlaylist = playlist;
        newPlaylist = newPlaylist
            .slice(0, removePlaylistIndex)
            .concat(newPlaylist.slice(removePlaylistIndex + 1, newPlaylist.length));

        //shuffledList
        const removeOriginlistIndex = playlistOrigin.findIndex((song) => {
            return song.id == id;
        });
        let newOriginList = playlistOrigin;
        newOriginList = newOriginList
            .slice(0, removeOriginlistIndex)
            .concat(newOriginList.slice(removeOriginlistIndex + 1, newOriginList.length));

        setPlaylist(newPlaylist);
        setPlaylistOrigin(newOriginList);
        localStorage.setItem("playlist", JSON.stringify(newPlaylist));
        localStorage.setItem("shuffledPlaylist", JSON.stringify(newOriginList));
        setMusicPlayer({ ...musicPlayer });
        setShowPlaylist(showPlaylist);
    };

    //Context data
    const musicPlayerContextData = {
        showPlaylist,
        musicPlayer,
        playlist,
        playlistOrigin,
        recommendList,
        changeSong,
        setIsPlay,
        setIsLoop,
        setIsShuffle,
        setVolume,
        setVolumeAndPremute,
        setCurrentTime,
        setShowPlaylist,
        setPlaylist,
        setPlaylistOrigin,
        addSong,
        addPlaylist,
        removeSong,
    };

    //Return provider
    return <MusicPlayerContext.Provider value={musicPlayerContextData}>{children}</MusicPlayerContext.Provider>;
};

export default MusicPlayerContextProvider;
