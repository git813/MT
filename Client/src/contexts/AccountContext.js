import React, { createContext, useContext, useEffect, useState } from "react";
import { requestWithToken } from "../utils/request";
import { toastNotify } from "../utils";
import { MenuContext } from "./MenuContext";
export const AccountContext = createContext();

const AccountContextProvider = ({ children }) => {
    const [account, setAccount] = useState(JSON.parse(localStorage.getItem("account")));

    useEffect(() => {
        fetchAccountInfo();
    }, []);

    const fetchAccountInfo = async () => {
        if (account)
            await requestWithToken(account.accessToken)
                .get("/user/profile")
                .then((res) => {
                    console.log(res);
                    const newInfo = {
                        ...account,
                        email: res.data.accountProfile.email,
                        name: res.data.accountProfile.name,
                        accountImage: res.data.accountProfile.accountImage,
                    };
                    setAccount(newInfo);
                    localStorage.setItem("account", JSON.stringify(newInfo));
                });
    };

    const accountContextData = {
        account,
        setAccount,
        fetchAccountInfo,
    };

    return <AccountContext.Provider value={accountContextData}>{children}</AccountContext.Provider>;
};
export default AccountContextProvider;
