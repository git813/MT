import React, { createContext, useState, useContext, useEffect } from "react";
import { requestWithToken } from "../utils/request";
import { AccountContext } from "./AccountContext";

export const MenuContext = createContext();

const MenuContextProvider = ({ children }) => {
    const MenuType = {
        MenuFull: "full",
        MenuNotFavour: "notfavour",
        MenuNotPlaylist: "notplaylist",
        MenuInPlaylist: "inplaylist",
    };
    const [typeMenu, setTypeMenu] = useState(MenuType.MenuFull);
    const [subPlaylist, setSubPlaylist] = useState([]);
    const [playlistDetail, setPlaylistDetail] = useState();
    const [song, setSong] = useState();
    const [showMenu, setShowMenu] = useState(false);
    const [forceRender, setForceRender] = useState(0);
    const { account } = useContext(AccountContext);
    useEffect(() => {
        fetchPlaylist();
    }, [account]);

    useEffect(() => {
        console.log("change show", showMenu);
        if (!showMenu) {
            closeMenu();
        }
    }, [showMenu]);

    const fetchPlaylist = () => {
        if (account)
            requestWithToken(account.accessToken)
                .get("/user/playlist")
                .then((res) => {
                    setSubPlaylist(res.data);
                });
    };

    const toggleMenu = (e, songSrc, type) => {
        if (showMenu) {
            if (song == songSrc) {
                setShowMenu(false);
            } else {
                openMenu(e, songSrc, type);
            }
        } else {
            if (songSrc != song || typeMenu != type) {
                openMenu(e, songSrc, type);
                setShowMenu(true);
            } else {
                setTypeMenu("");
            }
        }
    };

    const openMenu = (e, songSrc, type) => {
        setTypeMenu(type);
        setSong(songSrc);
        const menu = document.getElementById("menu-context");

        menu.style.display = "flex";
        if (e.view.innerWidth - e.clientX - menu.offsetWidth > 0) {
            menu.style.left = `${e.clientX}px`;
            menu.style.right = `auto`;
        } else {
            menu.style.left = `auto`;
            menu.style.right = `${e.view.innerWidth - e.clientX}px`;
        }

        if (e.view.innerHeight - e.clientY - menu.offsetHeight > 0) {
            menu.style.top = `${e.clientY + 30}px`;
            menu.style.bottom = `auto`;
        } else {
            menu.style.top = `auto`;
            menu.style.bottom = `${e.view.innerHeight - e.clientY + 20}px`;
        }

        menu.focus();
    };

    const closeMenu = () => {
        const menu = document.getElementById("menu-context");
        if (menu) menu.blur();
    };

    const menuContextData = {
        MenuType,
        typeMenu,
        subPlaylist,
        openMenu,
        closeMenu,
        toggleMenu,
        song,
        showMenu,
        setShowMenu,
        subPlaylist,
        fetchPlaylist,
        playlistDetail,
        setPlaylistDetail,
        forceRender,
        setForceRender,
    };

    return <MenuContext.Provider value={menuContextData}>{children}</MenuContext.Provider>;
};
export default MenuContextProvider;
