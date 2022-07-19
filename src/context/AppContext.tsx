import React, { useState, createContext, useEffect } from "react";
import { EthereumAuthProvider, useViewerConnection } from "@self.id/framework";
import { initializeApp } from "firebase/app";
import { defaultFunc, getSelfIdCookie } from "../helpers/utils";
import { Workflow } from "../types/Workflow";
import {
  createWorkflow,
  listWorkflows,
  updateWorkflow,
} from "../helpers/engine";

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

const blankWorkflow: Workflow = {
  title: "New workflow",
  trigger: {
    type: "trigger",
    connector: "evmWallet",
    operation: "newTransaction",
    input: {
      _grinderyChain: "eip155:1",
      to: "",
    },
  },
  actions: [
    {
      type: "action",
      connector: "firebaseCloudMessaging",
      operation: "sendPushNotification",
      input: {
        token: "",
        title: "New deposit",
        body: "New deposit to the wallet {{trigger.to}} has been made",
      },
    },
  ],
  creator: "",
  state: "off",
};

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
  wallet: string;
  workflow: Workflow;
  saveWorkflow: () => void;
  editWorkflow: (a: Workflow) => void;
};

type AppContextProps = {
  children: React.ReactNode;
};

export const AppContext = createContext<ContextProps>({
  user: "",
  setUser: defaultFunc,
  disconnect: defaultFunc,
  wallet: "",
  workflow: blankWorkflow,
  saveWorkflow: defaultFunc,
  editWorkflow: defaultFunc,
});

export const AppContextProvider = ({ children }: AppContextProps) => {
  // Auth hook
  const [connection, connect, disconnect] = useViewerConnection();

  // User id
  const [user, setUser] = useState<any>(null);

  // User wallet address
  const [wallet, setWallet] = useState("");

  // workflow state
  const [workflow, setWorkflow] = useState<Workflow>(blankWorkflow);

  // user's workflows list
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const getAddress = async () => {
    const addresses = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(addresses[0]);
  };

  const getWorkflowsList = async () => {
    const res = await listWorkflows(user);

    if (res && res.data && res.data.error) {
      console.log("or_listWorkflows error", res.data.error);
    }
    if (res && res.data && res.data.result) {
      setWorkflows(
        res.data.result
          .map((result: any) => ({
            ...result.workflow,
            key: result.key,
          }))
          .filter((workflow: Workflow) => workflow)
      );
    }
  };

  // Save current workflow
  const saveWorkflow = async () => {
    if (workflow) {
      const readyWorkflow = {
        ...workflow,
        state: "on",
        signature: JSON.stringify(workflow),
      };
      const res = await createWorkflow(readyWorkflow);
      if (res && res.data && res.data.error) {
      }
      if (res && res.data && res.data.result) {
        getWorkflowsList();
      }
    }
  };

  // Edit existing workflow
  const editWorkflow = async (workflow: Workflow) => {
    const res = await updateWorkflow(workflow, user);

    if (res && res.data && res.data.error) {
      console.error("editWorkflow error", res.data.error);
    }
    if (res && res.data && res.data.result) {
      getWorkflowsList();
    }
  };

  useEffect(() => {
    if (user) {
      getAddress();
      getWorkflowsList();
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

  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const notificationWorkflow = workflows.find(
        (wf) =>
          wf &&
          wf.trigger &&
          wf.trigger.operation === "newTransaction" &&
          wf.trigger.connector === "evmWallet" &&
          wf.actions &&
          wf.actions[0] &&
          wf.actions[0].connector === "firebaseCloudMessaging" &&
          wf.actions[0].operation === "sendPushNotification"
      );
      if (notificationWorkflow) {
        setWorkflow(notificationWorkflow);
      }
    }
  }, [workflows]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        disconnect,
        wallet,
        workflow,
        saveWorkflow,
        editWorkflow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
