import React, { useState, createContext, useEffect } from "react";
import { EthereumAuthProvider, useViewerConnection } from "@self.id/framework";
import _ from "lodash";
import { initializeApp } from "firebase/app";
//import { Workflow } from "../types/Workflow";
import { Connector } from "../types/Connector";
import { defaultFunc, getSelfIdCookie } from "../helpers/utils";
import { getCDSFiles } from "../helpers/github";

const firebaseConfig = {
  apiKey: "AIzaSyA36V03w7qZaOrfBtaxqk82iblwg88IsTQ",
  authDomain: "grindery-ping.firebaseapp.com",
  projectId: "grindery-ping",
  storageBucket: "grindery-ping.appspot.com",
  messagingSenderId: "1009789264721",
  appId: "1:1009789264721:web:468fe5b2c6dcc39e0ea970",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

declare global {
  interface Window {
    ethereum: any;
  }
}

async function createAuthProvider() {
  // The following assumes there is an injected `window.ethereum` provider
  const addresses = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return new EthereumAuthProvider(window.ethereum, addresses[0]);
}

type ContextProps = {
  user: any;
  setUser?: (a: any) => void;
  disconnect: any;
  connectors: Connector[];
  wallet: string;
};

type AppContextProps = {
  children: React.ReactNode;
};

export const AppContext = createContext<ContextProps>({
  user: "",
  setUser: defaultFunc,
  disconnect: defaultFunc,
  connectors: [],
  wallet: "",
});

export const AppContextProvider = ({ children }: AppContextProps) => {
  // Auth hook
  const [connection, connect, disconnect] = useViewerConnection();

  // User id
  const [user, setUser] = useState<any>(null);

  // User wallet address
  const [wallet, setWallet] = useState("");

  // connectors list
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const getConnectors = async () => {
    const responses = await getCDSFiles();

    setConnectors(
      _.orderBy(
        responses.filter((res) => res && res.data).map((res) => res.data),
        [(response) => response.name.toLowerCase()],
        ["asc"]
      )
    );
  };

  const getAddress = async () => {
    const addresses = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(addresses[0]);
  };

  useEffect(() => {
    if (user) {
      getConnectors();
      getAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // set user id on success authentication
  useEffect(() => {
    if (connection.status === "connected") {
      if (!user) {
        setUser(connection.selfID.id);
      } else {
        setUser(connection.selfID.id);
      }
    } else {
      setUser(null);
      setWallet("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  useEffect(() => {
    const cookie = getSelfIdCookie();
    if (
      cookie &&
      "ethereum" in window &&
      connection.status !== "connecting" &&
      connection.status !== "connected"
    ) {
      createAuthProvider().then(connect);
    }
  }, [connection, connect]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        disconnect,
        connectors,
        wallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
