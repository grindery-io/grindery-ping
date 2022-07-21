import React, { useState, createContext, useEffect, useCallback } from "react";
import { useViewerConnection } from "@self.id/framework";
import _ from "lodash";
import { defaultFunc, getSelfIdCookie } from "../helpers/utils";
import { Workflow } from "../types/Workflow";
import {
  createWorkflow,
  listWorkflows,
  updateWorkflow,
} from "../helpers/engine";
import { checkBrowser, requestPermission } from "../helpers/firebase";
import { createAuthProvider, getAddress } from "../helpers/ceramic";

// New workflow object
const blankWorkflow: Workflow = {
  title: "Grindery Ping notifications",
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
      connector: "firebaseCloudMessagingConnector",
      operation: "fcmPushNotification",
      input: {
        tokens: [""],
        title: "Payment received!",
        body: "New payment received by the wallet {{trigger.to}}",
      },
    },
  ],
  creator: "",
  state: "off",
};

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
      title: "Grindery Ping notifications",
      creator: user || "",
      "trigger.input.to": wallet || "",
      "actions[0].input.tokens": token ? [token] : [],
      "actions[0].input.title": "Payment received!",
      "actions[0].input.body":
        "New payment received by the wallet {{trigger.to}}",
      "actions[0].connector": "firebaseCloudMessagingConnector",
      "actions[0].operation": "fcmPushNotification",
    };
    Object.keys(data).forEach((path) => {
      _.set(enrichedWorkflow, path, data[path]);
    });
    if (e.target.checked) {
      if (enrichedWorkflow.key) {
        editWorkflow({ ...enrichedWorkflow, state: "on" }, user);
      } else {
        saveWorkflow({ ...enrichedWorkflow, state: "on" }, user);
      }
    } else {
      if (enrichedWorkflow.key) {
        editWorkflow({ ...enrichedWorkflow, state: "off" }, user);
      }
    }
  };

  // Get user's workflows
  const getWorkflowsList = useCallback(async (userId: string) => {
    const res = await listWorkflows(userId);

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
  }, []);

  // Save current workflow
  const saveWorkflow = async (wf: Workflow, userId: string) => {
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
        getWorkflowsList(userId);
      }
    }
  };

  // Edit existing workflow
  const editWorkflow = async (workflow: Workflow, userId: string) => {
    const res = await updateWorkflow(workflow, userId);

    if (res && res.data && res.data.error) {
      console.error("updateWorkflow error", res.data.error);
    }
    if (res && res.data && res.data.result) {
      getWorkflowsList(userId);
    }
  };

  const connectUser = useCallback((connection: any, userId: string | null) => {
    if (connection.status === "connected") {
      if (!userId) {
        setUser(connection.selfID.id);
      }
    } else {
      setUser(null);
      setWallet("");
    }
  }, []);

  const initUser = useCallback(
    (userId: string | null) => {
      if (userId) {
        getAddress(setWallet);
        getWorkflowsList(userId);
        requestPermission(setToken, setIsBrowserSupported);
      } else {
        setToken("");
      }
    },
    [getWorkflowsList]
  );

  // Request user address, workflows list and notification permissions when user id is set
  useEffect(() => {
    initUser(user);
  }, [user, initUser]);

  // set user id on success authentication
  useEffect(() => {
    connectUser(connection, user);
  }, [connection, user, connectUser]);

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
          (wf.actions[0].connector === "firebaseCloudMessaging" ||
            wf.actions[0].connector === "firebaseCloudMessagingConnector") &&
          (wf.actions[0].operation === "sendPushNotification" ||
            wf.actions[0].operation === "fcmPushNotification")
      );
      if (notificationWorkflow) {
        setWorkflow(notificationWorkflow);
      }
    }
  }, [workflows, wallet]);

  // Check if browser supports push notifications
  useEffect(() => {
    checkBrowser(setIsBrowserSupported);
  }, []);

  console.log("user", user);

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
