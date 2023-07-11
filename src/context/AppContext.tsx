import React, { useState, createContext, useEffect, useCallback } from "react";
import { useGrinderyNexus } from "use-grindery-nexus";
import _ from "lodash";
import NexusClient from "grindery-nexus-client";
import { defaultFunc } from "../helpers/utils";
import { Workflow } from "../types/Workflow";
import { checkBrowser, requestPermission } from "../helpers/firebase";
import {
  BLOCKCHAINS,
  EVM_CHAINS,
  flowWorkflow,
  nearWalletWorkflow,
  subscribeUserAction,
  tokenWorkflow,
  //unsubscribeUserAction,
  walletWorkflow,
} from "../constants";
import { sendTwitterConversion } from "../utils/twitterTracking";
import { sendGoogleEvent } from "../utils/googleTracking";

// Context props
type ContextProps = {
  user: string | null;
  disconnect: any;
  connect: any;
  wallet: string | null;
  walletWorkflowState: Workflow;
  tokenWorkflowState: Workflow;
  handleNotificationsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  token: string;
  isBrowserSupported: null | boolean;
  testNotification: () => void;
  isTesting: boolean;
  testResult: string;
  setTestResult: (a: string) => void;
  additionalWorkflows: Workflow[];
  addAdditionalWorkflow: (
    a: string,
    b: string,
    c: () => void,
    d: string
  ) => void;
  deleteWorkflow: (a: string, b: string) => void;
  toggleWorkflow: (a: Workflow, b: string) => void;
  accessAllowed: boolean;
  verifying: boolean;
  client: NexusClient | null;
  isOptedIn: boolean;
  chekingOptIn: boolean;
  setIsOptedIn: (a: boolean) => void;
};

// Context provider props
type AppContextProps = {
  children: React.ReactNode;
};

// Init context
export const AppContext = createContext<ContextProps>({
  user: null,
  disconnect: defaultFunc,
  connect: defaultFunc,
  wallet: null,
  walletWorkflowState: walletWorkflow,
  tokenWorkflowState: tokenWorkflow,
  handleNotificationsChange: defaultFunc,
  token: "",
  isBrowserSupported: null,
  testNotification: defaultFunc,
  isTesting: false,
  testResult: "",
  setTestResult: defaultFunc,
  additionalWorkflows: [],
  addAdditionalWorkflow: defaultFunc,
  deleteWorkflow: defaultFunc,
  toggleWorkflow: defaultFunc,
  accessAllowed: false,
  verifying: true,
  client: null,
  isOptedIn: false,
  chekingOptIn: true,
  setIsOptedIn: () => {},
});

export const AppContextProvider = ({ children }: AppContextProps) => {
  // Auth hook
  const {
    user,
    address,
    connect,
    disconnect,
    token: nexusToken,
  } = useGrinderyNexus();

  // Nexus API client
  const [client, setClient] = useState<NexusClient | null>(null);

  // User wallet address
  const wallet = address;

  // Current wallet workflow state
  const [walletWorkflowState, setWalletWorkflowState] =
    useState<Workflow>(walletWorkflow);

  // Current erc-20 token workflow state
  const [tokenWorkflowState, setTokenWorkflowState] =
    useState<Workflow>(tokenWorkflow);

  // user's workflows list
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  // user's notification token
  const [token, setToken] = useState("");

  // Is browser supports push notifications
  const [isBrowserSupported, setIsBrowserSupported] = useState<null | boolean>(
    null
  );

  const [isOptedIn, setIsOptedIn] = useState<boolean>(false);

  const [chekingOptIn, setChekingOptIn] = useState<boolean>(true);

  // is test notification sending
  const [isTesting, setIsTesting] = useState(false);

  // test notification result
  const [testResult, setTestResult] = useState("");

  // Additional notifciation workflows
  const [additionalWorkflows, setAdditionalWorkflows] = useState<Workflow[]>(
    []
  );

  const [accessAllowed, setAccessAllowed] = useState<boolean>(false);

  // verification state
  const [verifying, setVerifying] = useState<boolean>(true);

  // handle notification toggle change
  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (user) {
      // Set wallet workflow data
      let enrichedWalletWorkflow = { ...walletWorkflowState };
      const walletInput: any = {
        creator: user || "",
        "trigger.input.to": wallet || "",
        "actions[0].input.tokens": token ? [token] : [],
      };
      Object.keys(walletInput).forEach((path) => {
        _.set(enrichedWalletWorkflow, path, walletInput[path]);
      });

      // Set token workflow data
      let enrichedTokenWorkflow = { ...tokenWorkflowState };
      const tokenInput: any = {
        creator: user || "",
        "trigger.input.to": wallet || "",
        "actions[0].input.tokens": token ? [token] : [],
      };
      Object.keys(tokenInput).forEach((path) => {
        _.set(enrichedTokenWorkflow, path, tokenInput[path]);
      });

      if (e.target.checked) {
        if (enrichedWalletWorkflow.key) {
          editWorkflow({ ...enrichedWalletWorkflow, state: "on" }, user);
        } else {
          saveWorkflow({ ...enrichedWalletWorkflow, state: "on" }, user);
        }
        if (enrichedTokenWorkflow.key) {
          editWorkflow({ ...enrichedTokenWorkflow, state: "on" }, user);
        } else {
          saveWorkflow({ ...enrichedTokenWorkflow, state: "on" }, user);
        }
      } else {
        if (enrichedWalletWorkflow.key) {
          editWorkflow({ ...enrichedWalletWorkflow, state: "off" }, user);
        }
        if (enrichedTokenWorkflow.key) {
          editWorkflow({ ...enrichedTokenWorkflow, state: "off" }, user);
        }
      }
    }
  };

  // Get user's workflows
  const getWorkflowsList = useCallback(
    async (userId: string, client: NexusClient) => {
      const res = await client.workflow.list({});
      if (res) {
        setWorkflows(
          res
            .map((result: any) => ({
              ...result.workflow,
              key: result.key,
            }))
            .filter((workflow: Workflow) => workflow)
        );
      }
    },
    []
  );

  // Save current workflow
  const saveWorkflow = async (wf: Workflow, userId: string) => {
    if (wf) {
      const readyWorkflow = {
        ...wf,
        state: "on",
        signature: JSON.stringify(wf),
      };
      const res = await client?.workflow.create({ workflow: readyWorkflow });
      if (res && client) {
        getWorkflowsList(userId, client);
      }
    }
  };

  // Edit existing workflow
  const editWorkflow = async (workflow: Workflow, userId: string) => {
    const res = await client?.workflow.update({
      key: workflow.key,
      workflow: workflow,
    });

    if (res && client) {
      getWorkflowsList(userId, client);
    }
  };

  // Initialize user
  const initUser = useCallback(
    (userId: string | null, access_token: string) => {
      if (userId && access_token) {
        const nexus = new NexusClient(access_token);
        setClient(nexus);
        getWorkflowsList(userId, nexus);
        requestPermission(setToken, setIsBrowserSupported);
      } else {
        setToken("");
      }
    },
    [getWorkflowsList]
  );

  // Test notification action
  const testNotification = async () => {
    setIsTesting(true);
    setTestResult("");
    const currentToken = token;
    const res = await client?.connector
      .testAction({
        step: walletWorkflowState.actions[0],
        input: {
          title: "Demo notification",
          body: "Browser notification successfully received!",
          tokens: [currentToken],
        },
      })
      .catch((err) => {
        console.error("testNotification error:", err.message);
        setTestResult(`Test notification wasn't sent. Server error.`);
      });
    if (res) {
      setTestResult("Test notification sent.");
    }
    setIsTesting(false);
    setTimeout(() => {
      setTestResult("");
    }, 10000);
  };

  // Create additional EVM, FLow or Near workflow
  const addAdditionalWorkflow = (
    chain: string,
    address: string,
    callback: () => void,
    userId: string
  ) => {
    let newWF = walletWorkflow;

    if (chain === "flow:mainnet") {
      newWF = flowWorkflow;
      const input: any = {
        "trigger.input.to": address || "",
        creator: user || "",
        "actions[0].input.tokens": token ? [token] : [],
      };
      Object.keys(input).forEach((path) => {
        _.set(newWF, path, input[path]);
      });
    }

    if (chain === "near:mainnet") {
      newWF = nearWalletWorkflow;
      const input: any = {
        "trigger.input.to": address || "",
        creator: user || "",
        "actions[0].input.tokens": token ? [token] : [],
      };
      Object.keys(input).forEach((path) => {
        _.set(newWF, path, input[path]);
      });
    }

    if (chain === "evm") {
      newWF = walletWorkflow;
      const input: any = {
        title: "Grindery Ping notifications for MetaMask wallet transaction",
        "trigger.input.to": address || "",
        creator: user || "",
        "actions[0].input.tokens": token ? [token] : [],
      };
      Object.keys(input).forEach((path) => {
        _.set(newWF, path, input[path]);
      });
    }

    if (EVM_CHAINS.includes(chain)) {
      newWF = walletWorkflow;
      const chainName = BLOCKCHAINS.find((c) => c.value === chain)?.label || "";
      const input: any = {
        title: `Grindery Ping notifications for a transaction on ${chainName} chain`,
        "trigger.input.to": address || "",
        "trigger.input._grinderyChain": chain || "",
        creator: user || "",
        "actions[0].input.tokens": token ? [token] : [],
      };
      Object.keys(input).forEach((path) => {
        _.set(newWF, path, input[path]);
      });
    }

    saveWorkflow(newWF, userId);
    callback();
  };

  // turn workflow on/off by key
  const toggleWorkflow = async (workflow: Workflow, userId: string) => {
    let updatedWorkflow = {
      ...workflow,
      state: workflow.state === "on" ? "off" : "on",
    };

    const input: any = {
      "actions[0].input.tokens": token ? [token] : [],
    };
    Object.keys(input).forEach((path) => {
      _.set(updatedWorkflow, path, input[path]);
    });

    const res = await client?.workflow.update({
      key: workflow.key,
      workflow: updatedWorkflow,
    });

    if (res && client) {
      getWorkflowsList(userId, client);
    }
  };

  // Delete workflow by key
  const deleteWorkflow = async (userAccountId: string, key: string) => {
    const res = await client?.workflow.delete({ key: key }).catch((err) => {
      console.error("deleteWorkflow error:", err.message);
    });
    if (res && client) {
      getWorkflowsList(userAccountId, client);
    }
  };

  // save user wallet address to CRM
  const saveWallet = async (
    userId: string,
    walletAddress: string,
    client: NexusClient
  ) => {
    try {
      client.user.saveWalletAddress({
        walletAddress: userId,
        email: walletAddress,
      });
    } catch (err) {
      let error = "";
      if (typeof err === "string") {
        error = err;
      } else if (err instanceof Error) {
        error = err.message;
      }
      console.error("saveWalletAddress error:", error);
    }
  };

  const subscribeUserToUpdates = async (
    userID: string,
    notificationToken: string,
    client: NexusClient
  ) => {
    const isUserUnSubscribed = Boolean(
      localStorage.getItem("gr_ping_updates_canceled_" + userID)
    );
    const isUserSubscribed = Boolean(
      localStorage.getItem("gr_ping_updates_" + userID)
    );
    if (
      userID &&
      notificationToken &&
      !isUserUnSubscribed &&
      !isUserSubscribed
    ) {
      try {
        await client.connector.testAction({
          step: subscribeUserAction,
          input: {
            topic: subscribeUserAction.input.topic,
            tokens: [notificationToken],
          },
        });
        localStorage.setItem("gr_ping_updates_" + userID, "yes");
      } catch (err) {
        let error = "";
        if (typeof err === "string") {
          error = err;
        } else if (err instanceof Error) {
          error = err.message;
        }
        console.error("subscribeUserToUpdates error:", error);
      }
    }
  };

  /*const unsubscribeUserFromUpdates = async (
    userID: string,
    notificationToken: string
  ) => {
    const isUserUnSubscribed = Boolean(
      localStorage.getItem("gr_ping_updates_canceled_" + userID)
    );
    const isUserSubscribed = Boolean(
      localStorage.getItem("gr_ping_updates_" + userID)
    );
    if (
      userID &&
      notificationToken &&
      !isUserUnSubscribed &&
      isUserSubscribed
    ) {
      try {
        await client?.testAction(userID || "", unsubscribeUserAction, {
          topic: unsubscribeUserAction.input.topic,
          tokens: [notificationToken],
        });
        localStorage.setItem("gr_ping_updates_canceled_" + userID, "yes");
      } catch (err) {
        let error = "";
        if (typeof err === "string") {
          error = err;
        } else if (err instanceof Error) {
          error = err.message;
        }
        console.error("unsubscribeUserFromUpdates error:", error);
      }
    }
  };*/

  const verifyUser = async () => {
    setVerifying(true);
    const res = await client?.user.hasEmail().catch((err) => {
      console.error("isUserHasEmail error:", err.message);
      setAccessAllowed(false);
    });
    if (res) {
      setAccessAllowed(true);
      const optinRes = await client?.user.isAllowed({}).catch((err) => {
        console.error("isAllowedUser error:", err.message);
        setIsOptedIn(false);
      });
      if (optinRes) {
        setIsOptedIn(true);
      } else {
        setIsOptedIn(false);
      }
    } else {
      setAccessAllowed(false);
    }
    setChekingOptIn(false);
    setVerifying(false);
  };

  useEffect(() => {
    if (user && client) {
      verifyUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, client]);

  // Request user address, workflows list and notification permissions when user id is set
  useEffect(() => {
    if (user && nexusToken && nexusToken.access_token) {
      initUser(user, nexusToken.access_token);
    }
  }, [user, initUser, nexusToken]);

  // Filter notifications workflows from the list of user's workflows
  useEffect(() => {
    if (workflows && workflows.length > 0 && wallet) {
      const walletNotificationWorkflow = workflows.find(
        (wf) =>
          wf &&
          wf.trigger?.operation === "newTransaction" &&
          wf.trigger?.connector === "evmWallet" &&
          wf.trigger?.input?.to === wallet &&
          Array.isArray(wf.trigger?.input?._grinderyChain) &&
          wf.actions[0]?.connector === "firebaseCloudMessagingConnector" &&
          wf.actions[0]?.operation === "fcmPushNotification"
      );
      if (walletNotificationWorkflow) {
        setWalletWorkflowState(walletNotificationWorkflow);
      }

      const tokenNotificationWorkflow = workflows.find(
        (wf) =>
          wf &&
          wf.trigger?.operation === "TransferTrigger" &&
          wf.trigger?.connector === "erc20" &&
          wf.trigger?.input?.to === wallet &&
          Array.isArray(wf.trigger?.input?._grinderyChain) &&
          wf.actions[0]?.connector === "firebaseCloudMessagingConnector" &&
          wf.actions[0]?.operation === "fcmPushNotification"
      );
      if (tokenNotificationWorkflow) {
        setTokenWorkflowState(tokenNotificationWorkflow);
      }

      const additionalWFs = workflows.filter(
        (wf) =>
          ((wf.trigger?.operation === "TransferTrigger" &&
            wf.trigger?.connector === "erc20") ||
            (wf.trigger?.operation === "newTransaction" &&
              wf.trigger?.connector === "evmWallet") ||
            (wf.trigger?.operation === "newTransaction" &&
              wf.trigger?.connector === "near") ||
            (wf.trigger?.operation === "TokenTransferTrigger" &&
              wf.trigger?.connector === "near") ||
            (wf.trigger?.operation === "TokenTransferTrigger" &&
              wf.trigger?.connector === "flow")) &&
          wf?.actions[0]?.connector === "firebaseCloudMessagingConnector" &&
          wf?.actions[0]?.operation === "fcmPushNotification" &&
          !Array.isArray(wf.trigger.input._grinderyChain)
      );

      setAdditionalWorkflows(additionalWFs);
    }
  }, [workflows, wallet]);

  // Check if browser supports push notifications
  useEffect(() => {
    checkBrowser(setIsBrowserSupported);
  }, []);

  useEffect(() => {
    if (user && wallet && client) {
      saveWallet(user, wallet, client);
    }
  }, [user, wallet, client]);

  useEffect(() => {
    if (user && client && token) {
      subscribeUserToUpdates(user, token, client);
    }
  }, [token, user, client]);

  useEffect(() => {
    if (user) {
      sendGoogleEvent({
        event: "registration",
        authentication_method: "wallet",
        user_id: user,
      });
      sendTwitterConversion("tw-ofep3-ofep7");
    }
  }, [user]);

  console.log("notification token:", token);

  return (
    <AppContext.Provider
      value={{
        user,
        disconnect,
        connect,
        wallet,
        walletWorkflowState,
        tokenWorkflowState,
        handleNotificationsChange,
        token,
        isBrowserSupported,
        testNotification,
        isTesting,
        testResult,
        setTestResult,
        additionalWorkflows,
        addAdditionalWorkflow,
        deleteWorkflow,
        toggleWorkflow,
        accessAllowed,
        verifying,
        client,
        isOptedIn,
        chekingOptIn,
        setIsOptedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
