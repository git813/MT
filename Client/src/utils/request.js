import axios from "axios";

const request = axios.create({
    baseURL: "http://localhost:9999/api",
});

const requestWithToken = (accessToken) =>
    axios.create({
        baseURL: "http://localhost:9999/api",
        headers: { accessToken: accessToken },
    });

export default request;
export { requestWithToken };
