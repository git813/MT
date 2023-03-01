import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import { DefaultLayout } from "./components/Layout";
import MusicPlayerContextProvider from "./contexts/MusicPlayerContext";
import MenuContextProvider from "./contexts/MenuContext";
import AccountContextProvider from "./contexts/AccountContext";
import { Fragment, useRef } from "react";
import { ToastContainer, Slide } from "react-toastify";
function App() {
    const audioRef = useRef();
    return (
        <Router>
            <div className="App">
                <ToastContainer
                    transition={Slide}
                    position="bottom-right"
                    autoClose={1000}
                    limit={2}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    draggable
                    theme="dark"
                    style={{
                        fontSize: "1rem",
                        bottom: "100px",
                        width: "fit-content",
                    }}
                />
                <Routes>
                    {publicRoutes.map((route, index) => {
                        const Layout = route.layout || DefaultLayout;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Fragment>
                                        <audio ref={audioRef}></audio>
                                        <MusicPlayerContextProvider audio={audioRef}>
                                            <AccountContextProvider>
                                                <MenuContextProvider>
                                                    <Layout audio={audioRef}>
                                                        <Page audio={audioRef} />
                                                    </Layout>
                                                </MenuContextProvider>
                                            </AccountContextProvider>
                                        </MusicPlayerContextProvider>
                                    </Fragment>
                                }
                            />
                        );
                    })}
                    {privateRoutes.map((route, index) => {
                        const Layout = route.layout || DefaultLayout;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Fragment>
                                        <audio ref={audioRef}></audio>
                                        <MusicPlayerContextProvider audio={audioRef}>
                                            <AccountContextProvider>
                                                <MenuContextProvider>
                                                    <Layout audio={audioRef}>
                                                        <Page audio={audioRef} />
                                                    </Layout>
                                                </MenuContextProvider>
                                            </AccountContextProvider>
                                        </MusicPlayerContextProvider>
                                    </Fragment>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
