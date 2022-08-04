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
  tokenWorkflow,
  walletWorkflow,
} from "../constants";

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
});

export const AppContextProvider = ({ children }: AppContextProps) => {
  // Auth hook
  const { user, address, connect, disconnect } = useGrinderyNexus();

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

  // is test notification sending
  const [isTesting, setIsTesting] = useState(false);

  // test notification result
  const [testResult, setTestResult] = useState("");

  // Additional notifciation workflows
  const [additionalWorkflows, setAdditionalWorkflows] = useState<Workflow[]>(
    []
  );

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
  const getWorkflowsList = useCallback(async (userId: string) => {
    const res = await NexusClient.listWorkflows(userId);
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
  }, []);

  // Save current workflow
  const saveWorkflow = async (wf: Workflow, userId: string) => {
    if (wf) {
      const readyWorkflow = {
        ...wf,
        state: "on",
        signature: JSON.stringify(wf),
      };
      const res = await NexusClient.createWorkflow(readyWorkflow);
      if (res) {
        getWorkflowsList(userId);
      }
    }
  };

  // Edit existing workflow
  const editWorkflow = async (workflow: Workflow, userId: string) => {
    const res = await NexusClient.updateWorkflow(
      workflow.key,
      userId,
      workflow
    );

    if (res) {
      getWorkflowsList(userId);
    }
  };

  // Initialize user
  const initUser = useCallback(
    (userId: string | null) => {
      if (userId) {
        getWorkflowsList(userId);
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
    const res = await NexusClient.testAction(
      user || "",
      walletWorkflowState.actions[0],
      {
        title: "Demo notification",
        body: "Browser notification successfully received!",
        tokens: [token],
      }
    ).catch((err) => {
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

    const res = await NexusClient.updateWorkflow(
      workflow.key,
      userId,
      updatedWorkflow
    );

    if (res) {
      getWorkflowsList(userId);
    }
  };

  // Delete workflow by key
  const deleteWorkflow = async (userAccountId: string, key: string) => {
    const res = await NexusClient.deleteWorkflow(userAccountId, key).catch(
      (err) => {
        console.error("deleteWorkflow error:", err.message);
      }
    );
    if (res) {
      getWorkflowsList(userAccountId);
    }
  };

  // Request user address, workflows list and notification permissions when user id is set
  useEffect(() => {
    initUser(user);
  }, [user, initUser]);

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

  console.log("token", token);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
