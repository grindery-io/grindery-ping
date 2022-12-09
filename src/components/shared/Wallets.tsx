import React, { useState } from "react";
import styled from "styled-components";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { TextInput, Switch } from "grindery-ui";
import { BLOCKCHAINS, ICONS } from "../../constants";
import useAppContext from "../../hooks/useAppContext";
import { hideAddress } from "../../helpers/utils";
import Button from "./Button";
import CustomSelect from "./CustomSelect";
import { Workflow } from "../../types/Workflow";
import Foco from "react-foco";

const Wrapper = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  padding: 0 20px 20px;

  & .wallet-row:first-of-type {
    border-top: none !important;
  }
`;

const WalletRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 20px 0;
  border-top: 1px solid #dcdcdc;
`;

const WalletIcon = styled.div`
  width: 46px;
  text-align: center;

  & img {
    display: block;
    width: 24px;
    height: 24px;
    margin: 0 auto;
  }
`;

const WalletAddress = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: #0b0d17;
  padding: 0;
  margin: 0;
`;

const WalletToggle = styled.div`
  margin-left: auto;

  & label {
    cursor: pointer;
  }
`;

const WalletDelete = styled.div`
  width: 24px;
`;

const AddWalletButton = styled.div`
  margin: 0;
  padding: 0;

  & .MuiButton-root {
    padding: 8px 16px !important;
    background: #f4f5f7 !important;
    border-radius: 10px !important;
    font-size: 12px;
    line-height: 150%;
    color: #170b10;
    font-weight: 700;

    &:hover {
      box-shadow: none;
    }

    & .MuiButton-startIcon {
      margin-right: 5px;

      & img {
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
`;

const AddWalletForm = styled.div`
  background: #f4f5f7;
  border-radius: 10px;
  padding: 20px;
  margin: 0 0 20px;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
`;

const AddressInputWrapper = styled.div`
  flex: 1;
  & .MuiBox-root {
    margin: 0;
  }
  & .MuiInputBase-root {
    margin: 0;
    background: #ffffff;
    border: 1px solid #dcdcdc;
    border-radius: 5px;
    padding: 6.5px 12px !important;

    & input.MuiInputBase-input {
      padding: 0 !important;
    }
  }

  & .MuiFormControl-root-MuiTextField-root.custom-text-input {
    input {
      padding: 0 !important;
    }
  }

  &.has-error input {
    border: 1px solid #ff5858 !important;
  }
`;

const SaveWalletButton = styled.div`
  margin: 0;
  padding: 0;

  & .MuiButton-root {
    padding: 10px 20px !important;
    background: #170b10 !important;
    border-radius: 10px !important;
    font-size: 12px;
    line-height: 150%;
    color: #ffffff;
    font-weight: 700;
    margin: 2px 0 0;

    &:hover {
      box-shadow: none;
    }
  }
`;

const CloseForm = styled.button`
  position: absolute;
  right: 6px;
  top: 6px;
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;

  & img {
    display: block;
    width: 12px;
    height: 12px;
  }
`;

const ChainInputWrapper = styled.div`
  height: 38px;
  & .MuiInputBase-root {
    border: none !important;
    padding: 0 !important;
    margin-top: 2px !important;
  }

  & .MuiInputBase-input {
    background: #ffffff;
    border-radius: 5px;
    padding: 7px 38px 7px 12px !important;

    & img {
      display: block;
      width: 24px;
      height: 24px;
    }
  }

  & .MuiOutlinedInput-notchedOutline {
    border: 1px solid #dcdcdc !important;
  }
`;

const ChainOption = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 8px;

  & img {
    display: block;
    width: 16px;
    height: 16px;
  }
`;

const DeleteButton = styled.button`
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 4px;
  margin: 0;
  cursor: pointer;
  opacity: 0.35;

  &:hover {
    opacity: 1;
  }

  & img {
    display: block;
    width: 16px;
    height: 16px;
  }
`;

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#0B0D17",
    color: "#ffffff",
    maxWidth: 180,
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "150%",
    border: "none",
    boxShadow: "0px 2px 7px rgba(45, 62, 80, 0.15)",
    borderRadius: "3px",
  },
}));

const getIconTooltip = (workflow: Workflow) => {
  const chainValue = workflow.trigger.input._grinderyChain;
  if (Array.isArray(chainValue)) {
    return `Blockchains supported: ${BLOCKCHAINS.filter((chain) =>
      chain.value.includes("eip155")
    )
      .map((chain) => chain.label)
      .join(", ")}`;
  }
  const chainName = BLOCKCHAINS.find(
    (chain) => chain.value === chainValue
  )?.label;
  return `${chainName || chainValue || ""} blockchain`;
};

type Props = {};

const Wallets = (props: Props) => {
  const {
    user,
    wallet,
    walletWorkflowState,
    tokenWorkflowState,
    handleNotificationsChange,
    additionalWorkflows,
    addAdditionalWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    token,
  } = useAppContext();
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [newWalletChain, setNewWalletChain] = useState("eip155:1");
  const [error, setError] = useState(false);

  const chainOptions = [
    ...BLOCKCHAINS.map((c) => ({
      label: (
        <ChainOption>
          <img src={c.icon} alt="" />
          <span>{c.label}</span>
        </ChainOption>
      ),
      value: c.value,
      icon: c.icon,
    })),
  ];

  const handleAddWalletClick = () => {
    if (token) {
      setIsAddingWallet(true);
    }
  };

  const handleAddressChange = (value: string) => {
    if (value) {
      setError(false);
    }
    setNewWalletAddress(value);
  };

  const handleChainChange = (value: string) => {
    setNewWalletChain(value);
  };

  const handleSaveWalletClick = () => {
    if (newWalletAddress) {
      setIsAddingWallet(false);
      addAdditionalWorkflow(
        newWalletChain,
        newWalletAddress,
        () => {
          setNewWalletAddress("");
          setNewWalletChain("eip155:1");
        },
        user || ""
      );
    } else {
      setError(true);
    }
  };

  const handleAddressDelete = (workflowKey: string) => {
    deleteWorkflow(user || "", workflowKey);
  };

  const handleFormCloseClick = () => {
    setIsAddingWallet(false);
    setNewWalletAddress("");
    setNewWalletChain("eip155:1");
    setError(false);
  };

  const handleAdditionalWorkflowChange = (workflow: Workflow) => {
    if (token) {
      toggleWorkflow(workflow, user || "");
    }
  };

  const handleClickOutsideForm = () => {
    setIsAddingWallet(false);
    setNewWalletAddress("");
    setNewWalletChain("eip155:1");
    setError(false);
  };

  console.log("walletWorkflowState", walletWorkflowState);

  return wallet ? (
    <Wrapper>
      <WalletRow className="wallet-row">
        <WalletIcon>
          <HtmlTooltip
            title={getIconTooltip(walletWorkflowState)}
            placement="top"
          >
            <img src={ICONS.METAMASK_LOGO} alt="MetaMask wallet logo" />
          </HtmlTooltip>
        </WalletIcon>
        <WalletAddress>{hideAddress(wallet)}</WalletAddress>
        <WalletToggle>
          <label>
            <Switch
              value={
                walletWorkflowState.state === "on" &&
                tokenWorkflowState.state === "on"
              }
              onChange={!token ? () => {} : handleNotificationsChange}
            />
          </label>
        </WalletToggle>
        <WalletDelete></WalletDelete>
      </WalletRow>
      {additionalWorkflows.map((wf: Workflow, i: number) => (
        <WalletRow className="wallet-row" key={wf.key || wf.creator + i}>
          <WalletIcon>
            <HtmlTooltip title={getIconTooltip(wf)} placement="top">
              <img
                src={
                  chainOptions.find(
                    (opt) => opt.value === wf.trigger.input._grinderyChain
                  )?.icon || ICONS.METAMASK_LOGO
                }
                alt="wallet logo"
              />
            </HtmlTooltip>
          </WalletIcon>
          <WalletAddress>
            {hideAddress(
              wf.trigger.input?.to?.toString() ||
                wf.trigger.input?.receiver_id?.toString() ||
                ""
            )}
          </WalletAddress>
          <WalletToggle>
            <label>
              <Switch
                value={wf.state === "on"}
                onChange={() => {
                  handleAdditionalWorkflowChange(wf);
                }}
              />
            </label>
          </WalletToggle>
          <WalletDelete>
            <DeleteButton
              onClick={() => {
                handleAddressDelete(wf.key);
              }}
            >
              <img src="/images/icons/trash.svg" alt="" />
            </DeleteButton>
          </WalletDelete>
        </WalletRow>
      ))}
      {isAddingWallet && (
        <Foco onClickOutside={handleClickOutsideForm}>
          <AddWalletForm>
            <CloseForm onClick={handleFormCloseClick}>
              <img src="/images/icons/cross-circle.svg" alt="" />
            </CloseForm>
            <ChainInputWrapper>
              <CustomSelect
                options={chainOptions}
                value={newWalletChain}
                onChange={handleChainChange}
              />
            </ChainInputWrapper>
            <AddressInputWrapper className={error ? "has-error" : ""}>
              <TextInput
                value={newWalletAddress}
                onChange={handleAddressChange}
                Switch="Wallet Address"
              />
            </AddressInputWrapper>
            <SaveWalletButton>
              <Button value="Save" onClick={handleSaveWalletClick} />
            </SaveWalletButton>
          </AddWalletForm>
        </Foco>
      )}
      {!isAddingWallet && (
        <AddWalletButton>
          <Button
            value="Add wallet"
            icon="/images/icons/plus.png"
            hideIconBorder
            onClick={handleAddWalletClick}
          />
        </AddWalletButton>
      )}
    </Wrapper>
  ) : null;
};

export default Wallets;
