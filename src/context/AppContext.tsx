import React, { useState, createContext, useEffect, useCallback } from "react";
import { useGrinderyNexus } from "use-grindery-nexus";
import _ from "lodash";
import NexusClient, { Operation } from "grindery-nexus-client";
import { defaultFunc } from "../helpers/utils";
import { Workflow } from "../types/Workflow";
import { checkBrowser, requestPermission } from "../helpers/firebase";

const NOTIFICATION = {
  TITLE: "Event detected",
  BODY: "You received a deposit from {{trigger.from}}",
};

// New wallet workflow object
const walletWorkflow: Workflow = {
  title: "Grindery Ping notifications for Wallet transaction",
  trigger: {
    type: "trigger",
    connector: "evmWallet",
    operation: "newTransaction",
    input: {
      _grinderyChain: [
        "eip155:42161",
        "eip155:43114",
        "eip155:56",
        "eip155:42220",
        "eip155:1",
        "eip155:250",
        "eip155:137",
        "eip155:100",
        "eip155:1666600000",
      ],
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
        title: NOTIFICATION.TITLE,
        body: NOTIFICATION.BODY,
      },
    },
  ],
  creator: "",
  state: "off",
};

// New token workflow object
const tokenWorkflow: Workflow = {
  title: "Grindery Ping notifications for ERC-20 Token transfer",
  trigger: {
    type: "trigger",
    connector: "erc20",
    operation: "TransferTrigger",
    input: {
      _grinderyChain: [
        "eip155:42161",
        "eip155:43114",
        "eip155:56",
        "eip155:42220",
        "eip155:1",
        "eip155:250",
        "eip155:137",
        "eip155:100",
        "eip155:1666600000",
      ],
      _grinderyContractAddress: "0x0",
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
        title: NOTIFICATION.TITLE,
        body: NOTIFICATION.BODY,
      },
    },
  ],
  creator: "",
  state: "off",
};

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
  testNotification: (a: string, b: Operation, c: object) => void;
  isTesting: boolean;
  testResult: string;
  setTestResult: (a: string) => void;
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

  // handle notification toggle change
  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (user) {
      // Set wallet workflow data
      let enrichedWalletWorkflow = { ...walletWorkflowState };
      const walletInput: any = {
        title: "Grindery Ping notifications for Wallet transaction",
        creator: user || "",
        "trigger.input._grinderyChain": [
          "eip155:42161",
          "eip155:43114",
          "eip155:56",
          "eip155:42220",
          "eip155:1",
          "eip155:250",
          "eip155:137",
          "eip155:100",
          "eip155:1666600000",
        ],
        "trigger.input.to": wallet || "",
        "actions[0].input.tokens": token ? [token] : [],
        "actions[0].input.title": NOTIFICATION.TITLE,
        "actions[0].input.body": NOTIFICATION.BODY,
        "actions[0].connector": "firebaseCloudMessagingConnector",
        "actions[0].operation": "fcmPushNotification",
      };
      Object.keys(walletInput).forEach((path) => {
        _.set(enrichedWalletWorkflow, path, walletInput[path]);
      });

      // Set token workflow data
      let enrichedTokenWorkflow = { ...tokenWorkflowState };
      const tokenInput: any = {
        title: "Grindery Ping notifications for ERC-20 Token transfer",
        creator: user || "",
        "trigger.input._grinderyChain": [
          "eip155:42161",
          "eip155:43114",
          "eip155:56",
          "eip155:42220",
          "eip155:1",
          "eip155:250",
          "eip155:137",
          "eip155:100",
          "eip155:1666600000",
        ],
        "trigger.input.to": wallet || "",
        "actions[0].input.tokens": token ? [token] : [],
        "actions[0].input.title": NOTIFICATION.TITLE,
        "actions[0].input.body": NOTIFICATION.BODY,
        "actions[0].connector": "firebaseCloudMessagingConnector",
        "actions[0].operation": "fcmPushNotification",
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

  const testNotification = async (
    userAccountId: string,
    step: Operation,
    input: object
  ) => {
    setIsTesting(true);
    setTestResult("");
    const res = await NexusClient.testAction(user || "", step, input).catch(
      (err) => {
        console.error("testNotification error:", err.message);
        setTestResult(`Test notification wasn't sent. ${err.message}`);
      }
    );
    if (res) {
      setTestResult("Test notification sent");
    }
    setIsTesting(false);
    setTimeout(() => {
      setTestResult("");
    }, 5000);
  };

  // Request user address, workflows list and notification permissions when user id is set
  useEffect(() => {
    initUser(user);
  }, [user, initUser]);

  // Filter EVM to FCM workflow from the list of user's workflows
  useEffect(() => {
    if (workflows && workflows.length > 0 && wallet) {
      const walletNotificationWorkflow = workflows.find(
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
      if (walletNotificationWorkflow) {
        setWalletWorkflowState(walletNotificationWorkflow);
      }

      const tokenNotificationWorkflow = workflows.find(
        (wf) =>
          wf &&
          wf.trigger &&
          wf.trigger.operation === "TransferTrigger" &&
          wf.trigger.connector === "erc20" &&
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
      if (tokenNotificationWorkflow) {
        setTokenWorkflowState(tokenNotificationWorkflow);
      }
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
