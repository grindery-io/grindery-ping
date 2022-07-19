import React, { useState, createContext, useEffect } from "react";
import { EthereumAuthProvider, useViewerConnection } from "@self.id/framework";
import _ from "lodash";
import { initializeApp } from "firebase/app";
import { defaultFunc, getSelfIdCookie } from "../helpers/utils";
import { Workflow } from "../types/Workflow";
import {
  createWorkflow,
  listWorkflows,
  updateWorkflow,
} from "../helpers/engine";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA36V03w7qZaOrfBtaxqk82iblwg88IsTQ",
  authDomain: "grindery-ping.firebaseapp.com",
  projectId: "grindery-ping",
  storageBucket: "grindery-ping.appspot.com",
  messagingSenderId: "1009789264721",
  appId: "1:1009789264721:web:468fe5b2c6dcc39e0ea970",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// // Initialize Firebase Cloud Messaging
const messaging = getMessaging(firebaseApp);

// New workflow object
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

// Declare `ethereum` property for `window` object
declare global {
  interface Window {
    ethereum: any;
  }
}

// Create auth provider for SelfID authentication
async function createAuthProvider() {
  // The following assumes there is an injected `window.ethereum` provider
  const addresses = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return new EthereumAuthProvider(window.ethereum, addresses[0]);
}

// Context props
type ContextProps = {
  user: any;
  disconnect: any;
  wallet: string;
  workflow: Workflow;
  handleNotificationsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  token: string;
  isBrowserSupported: null | boolean;
};

// Context provider props
type AppContextProps = {
  children: React.ReactNode;
};

// Init context
export const AppContext = createContext<ContextProps>({
  user: "",
  disconnect: defaultFunc,
  wallet: "",
  workflow: blankWorkflow,
  handleNotificationsChange: defaultFunc,
  token: "",
  isBrowserSupported: null,
});

export const AppContextProvider = ({ children }: AppContextProps) => {
  // Auth hook
  const [connection, connect, disconnect] = useViewerConnection();

  // User id
  const [user, setUser] = useState<any>(null);

  // User wallet address
  const [wallet, setWallet] = useState("");

  // Current workflow state
  const [workflow, setWorkflow] = useState<Workflow>(blankWorkflow);

  // user's workflows list
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  // user's notification token
  const [token, setToken] = useState("");

  // Is browser supports push notifications
  const [isBrowserSupported, setIsBrowserSupported] = useState<null | boolean>(
    null
  );

  // handle notification toggle change
  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let enrichedWorkflow = { ...workflow };
    const data: any = {
      creator: user || "",
      "trigger.input.to": wallet || "",
      "actions[0].input.tokens": token ? [token] : [],
    };
    Object.keys(data).forEach((path) => {
      _.set(enrichedWorkflow, path, data[path]);
    });
    if (e.target.checked) {
      if (enrichedWorkflow.key) {
        editWorkflow({ ...enrichedWorkflow, state: "on" });
      } else {
        saveWorkflow({ ...enrichedWorkflow, state: "on" });
      }
    } else {
      if (enrichedWorkflow.key) {
        editWorkflow({ ...enrichedWorkflow, state: "off" });
      }
    }
  };

  // Request permissions to receive notifications
  const requestPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, {
          vapidKey:
            "BAaPC5Kx24prWkEWnIEFOKvlseb2_DFVc6wzqwAQrHw_lJ96BE3r9dvX6I1LOuzW1HCAiIMftP35FLZW1FcXpUI",
        })
          .then((currentToken) => {
            if (currentToken) {
              setToken(currentToken);
            } else {
              console.error(
                "No registration token available. Request permission to generate one."
              );
              setToken("");
            }
          })
          .catch((err) => {
            console.error("An error occurred while retrieving token. ", err);
            setToken("");
            setIsBrowserSupported(false);
          });
      } else {
        setToken("");
      }
    });
  };

  // Get user's wallet address
  const getAddress = async () => {
    const addresses = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(addresses[0]);
  };

  // Get user's workflows
  const getWorkflowsList = async () => {
    const res = await listWorkflows(user);

    if (res && res.data && res.data.error) {
      console.error("or_listWorkflows error", res.data.error);
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
  const saveWorkflow = async (wf: Workflow) => {
    if (wf) {
      const readyWorkflow = {
        ...wf,
        state: "on",
        signature: JSON.stringify(wf),
      };
      const res = await createWorkflow(readyWorkflow);
      if (res && res.data && res.data.error) {
        console.error("createWorkflow error", res.data.error);
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
      console.error("updateWorkflow error", res.data.error);
    }
    if (res && res.data && res.data.result) {
      getWorkflowsList();
    }
  };

  // Request user address, workflows list and notification permissions when user id is set
  useEffect(() => {
    if (user) {
      getAddress();
      getWorkflowsList();
      requestPermission();
    } else {
      setToken("");
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

  // Automatically sign in user if SelfID cookie exists
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

  // Filter EVM to FCM workflow from the list of user's workflows
  useEffect(() => {
    if (workflows && workflows.length > 0 && wallet) {
      const notificationWorkflow = workflows.find(
        (wf) =>
          wf &&
          wf.trigger &&
          wf.trigger.operation === "newTransaction" &&
          wf.trigger.connector === "evmWallet" &&
          wf.trigger.input &&
          wf.trigger.input.to &&
          wf.trigger.input.to === wallet &&
          wf.actions &&
          wf.actions[0] &&
          wf.actions[0].connector === "firebaseCloudMessaging" &&
          wf.actions[0].operation === "sendPushNotification"
      );
      if (notificationWorkflow) {
        setWorkflow(notificationWorkflow);
      }
    }
  }, [workflows, wallet]);

  // Check if browser supports push notifications
  useEffect(() => {
    isSupported()
      .then((res) => {
        if (res) {
          setIsBrowserSupported(true);
        } else {
          setIsBrowserSupported(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsBrowserSupported(false);
      });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        disconnect,
        wallet,
        workflow,
        handleNotificationsChange,
        token,
        isBrowserSupported,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
