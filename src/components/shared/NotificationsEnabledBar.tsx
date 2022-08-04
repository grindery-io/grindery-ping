import React from "react";
import styled from "styled-components";
import useAppContext from "../../hooks/useAppContext";
import TopBar from "./TopBar";

const TestTrigger = styled.span`
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    text-decoration: none;
  }
`;

type Props = {};

const NotificationsEnabledBar = (props: Props) => {
  const { token, testNotification, isTesting, testResult } = useAppContext();
  //const dismissedCache = localStorage.getItem("ping_notification_test");
  //const dismissed = !!dismissedCache;

  const handleTestClick = () => {
    testNotification();
  };

  const onCloseCallback = () => {
    //localStorage.setItem("ping_notification_test", "1");
  };

  return token ? (
    <TopBar
      background="#FDFBFF"
      iconColor="#8C30F5"
      closable
      onClose={onCloseCallback}
    >
      <p>
        {isTesting
          ? "Sending test notification..."
          : testResult || (
              <>
                Your browser notifications seem to be activated.{" "}
                <TestTrigger onClick={handleTestClick}>
                  Click here to test
                </TestTrigger>
                .
              </>
            )}
      </p>
    </TopBar>
  ) : null;
};

export default NotificationsEnabledBar;
