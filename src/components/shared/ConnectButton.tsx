import React from "react";
import styled from "styled-components";
import { ICONS } from "../../constants";
import useAppContext from "../../hooks/useAppContext";
import AlertBox from "./AlertBox";
import Button from "./Button";
import WarningIcon from "./WarningIcon";

const ButtonWrapper = styled.div`
  margin: 10px auto 0;
`;

type Props = {};

const ConnectButton = (props: Props) => {
  const { user, connect } = useAppContext();

  return user ? null : "ethereum" in window ? (
    <ButtonWrapper>
      <Button
        onClick={() => {
          connect();
        }}
        icon={ICONS.METAMASK_LOGO}
        value="Connect wallet"
        hideIconBorder
      />
    </ButtonWrapper>
  ) : (
    <AlertBox color="warning" icon={<WarningIcon />}>
      <p>
        The app is unable to detect{" "}
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">
          MetaMask
        </a>
        . Make sure you have it installed in this browser.
      </p>
    </AlertBox>
  );
};

export default ConnectButton;
