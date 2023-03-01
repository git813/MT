import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const parseSecondToMinute = (seconds) => {
    seconds = Math.ceil(seconds);
    let minute = Math.floor(seconds / 60);
    let second = seconds % 60;

    if (minute < 10) minute = "0" + minute;
    if (second < 10) second = "0" + second;

    return minute + ":" + second;
};

const parseTimeStringToSecond = (time) => {
    const second = time.slice(3, 5);
    const minute = time.slice(0, 2);
    const total = Number(second) + Number(minute) * 60;
    return total;
};

const parseListArtist = (listArtist) => {
    const parsedListArtist = [];
    if (listArtist.length == 0) {
        parsedListArtist.push(<Link to={"/artist"}>Không xác định</Link>);
    }
    for (let [index, artist] of listArtist.entries()) {
        index < 1
            ? parsedListArtist.push(
                  <Link key={index} to={"/artist/" + artist.artistLink}>
                      {artist.artistName}
                  </Link>
              )
            : parsedListArtist.push(
                  <Link key={index} to={"/artist/" + artist.artistLink}>
                      , {artist.artistName}
                  </Link>
              );
    }

    return parsedListArtist;
};

const parseDatetoString = (date) => {
    if (!date) return "Không xác định";
    date = date.split("-");
    date[2] = date[2].slice(0, 2);
    let newDate = new Date(date).getTime();
    let day = Math.floor((Date.now() - newDate) / (60 * 60 * 24 * 1000));
    if (day > 30) return Math.floor(day / 30) + " tháng trước";
    if (day > 6) return Math.floor(day / 7) + " tuần trước";
    if (day > 1) return day + " ngày trước";
    if (day == 1) return "Hôm qua";
    return "Hôm nay";
};

const toastNotify = (notify) => {
    toast(notify, {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });
};

export { parseSecondToMinute, parseTimeStringToSecond, parseListArtist, parseDatetoString, useDebounce, toastNotify };
