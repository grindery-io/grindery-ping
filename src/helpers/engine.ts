import axios from "axios";
import { WORKFLOW_ENGINE_URL } from "../constants";
import { Workflow } from "../types/Workflow";
import { jsonrpcObj } from "./utils";

export const updateWorkflow = async (workflow: Workflow, user: string) => {
  return await axios
    .post(
      WORKFLOW_ENGINE_URL,
      jsonrpcObj("or_updateWorkflow", {
        key: workflow.key,
        userAccountId: user,
        workflow: workflow,
      })
    )
    .catch((err) => {
      console.error("or_updateWorkflow error", err.message);
    });
};

export const isAllowedUser = async (user: string) => {
  return await axios
    .post(
      WORKFLOW_ENGINE_URL,
      jsonrpcObj("or_isAllowedUser", {
        userAccountId: user,
      })
    )
    .catch((err) => {
      console.error("or_isAllowedUser error", err.message);
    });
};

export const getWorkflowExecutions = async (workflowKey: string) => {
  return await axios
    .post(
      WORKFLOW_ENGINE_URL,
      jsonrpcObj("or_getWorkflowExecutions", {
        workflowKey: workflowKey,
      })
    )
    .catch((err) => {
      console.error("or_getWorkflowExecutions error", err.message);
    });
};

export const listWorkflows = async (user: string) => {
  return await axios
    .post(
      WORKFLOW_ENGINE_URL,
      jsonrpcObj("or_listWorkflows", {
        userAccountId: user,
      })
    )
    .catch((err) => {
      console.log("or_listWorkflows error", err.message);
    });
};

export const createWorkflow = async (workflow: Workflow) => {
  return await axios
    .post(
      WORKFLOW_ENGINE_URL,
      jsonrpcObj("or_createWorkflow", {
        userAccountId: workflow.creator,
        workflow: workflow,
      })
    )
    .catch((err) => {
      console.log("or_createWorkflow error", err.message);
    });
};
