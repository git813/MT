import Home from "../pages/Home";
import Genre from "../pages/Genre";
import Artist from "../pages/Artist";
import ArtistSong from "../pages/ArtistSong";
import General from "../pages/General";
import SearchResult from "../pages/SearchResult";
import { AdminLayout, LoginLayout } from "../components/Layout";
import AdminSong from "../pages/Admin/AdminSong";
import AdminArtist from "../pages/Admin/AdminArtist";
import AdminGenre from "../pages/Admin/AdminGenre";
import AdminAccount from "../pages/Admin/AdminAccount";
import Profile from "../pages/Profile";
import Playlist from "../pages/Playlist";
import SongForYou from "../pages/SongForYou";
const publicRoutes = [
    { path: "/", component: Home },
    { path: "/genre", component: Genre },
    { path: "/artist", component: Artist },
    { path: "/artist/:slug", component: ArtistSong },
    { path: "/song", component: General },
    { path: "/new", component: Genre },
    { path: "/search/:slug", component: SearchResult },
    { path: "/login", component: null, layout: LoginLayout },
    { path: "*", component: Home },
];

const privateRoutes = [
    { path: "/admin/artist", component: AdminArtist, layout: AdminLayout },
    { path: "/admin/user", component: AdminSong, layout: AdminLayout },
    { path: "/admin/genre", component: AdminGenre, layout: AdminLayout },
    { path: "/admin/account", component: AdminAccount, layout: AdminLayout },
    { path: "/admin/*", component: AdminSong, layout: AdminLayout },
    { path: "/song-for-you", component: SongForYou },
    { path: "/profile", component: Profile },
    { path: "/playlist", component: Playlist },
];

export { publicRoutes, privateRoutes };
