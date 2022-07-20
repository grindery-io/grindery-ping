import React from "react";
import { useViewerConnection } from "@self.id/framework";
import { ICONS } from "../../constants";
import Button from "./Button";
import { createAuthProvider } from "../../helpers/ceramic";

type Props = {};

const ConnectButton = (props: Props) => {
  const [connection, connect] = useViewerConnection();

  return connection.status === "connected" ? null : "ethereum" in window ? (
    <Button
      onClick={() => {
        if (connection.status !== "connecting") {
          createAuthProvider().then(connect);
        }
      }}
      icon={ICONS.CERAMIC_LOGO}
      value="Sign in"
      loading={connection.status === "connecting"}
      hideIconBorder
    />
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
