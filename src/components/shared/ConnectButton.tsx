import React from "react";
import styled from "styled-components";
import { ICONS } from "../../constants";
import useAppContext from "../../hooks/useAppContext";
import Button from "./Button";

const Disclaimer = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 150%;
  text-align: center;
  color: #0b0d17;
  opacity: 0.5;
  max-width: 500px;
  margin: 0 auto;
`;

type Props = {};

const ConnectButton = (props: Props) => {
  const { user, connect } = useAppContext();

  return user ? null : "ethereum" in window ? (
    <>
      <Button
        onClick={() => {
          connect();
        }}
        icon={ICONS.METAMASK_LOGO}
        value="Connect"
        hideIconBorder
      />
      <Disclaimer>
        Grindery Ping uses{" "}
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">
          MetaMask
        </a>{" "}
        to authenticate users.
      </Disclaimer>
    </>
  ) : (
    <p style={{ textAlign: "center" }}>
      An injected Ethereum provider such as{" "}
      <a href="https://metamask.io/" target="_blank" rel="noreferrer">
        MetaMask
      </a>{" "}
      is needed to authenticate.
    </p>
  );
};

export default ConnectButton;
