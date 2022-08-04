import React from "react";
import AlertBox from "../shared/AlertBox";
import WarningIcon from "../shared/WarningIcon";

type Props = {};

const BrowserNotSupported = (props: Props) => {
  return (
    <AlertBox color="error" icon={<WarningIcon color="#FF5858" />}>
      <p>
        Your browser is not supported. Please use{" "}
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noreferrer"
        >
          Chrome
        </a>{" "}
        and make sure you have MetaMask installed.
      </p>
    </AlertBox>
  );
};

export default BrowserNotSupported;
