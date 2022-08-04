import React from "react";
import styled from "styled-components";
import ConnectButton from "../shared/ConnectButton";
import useAppContext from "../../hooks/useAppContext";
import BrowserNotSupported from "../shared/BrowserNotSupported";
import Header from "../shared/Header";
import Wallets from "../shared/Wallets";
import NotificationsDisabledBar from "../shared/NotificationsDisabledBar";
import NotificationsEnabledBar from "../shared/NotificationsEnabledBar";

const Container = styled.div`
  padding: 60px 20px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex-wrap: nowrap;
  min-height: calc(100vh - 120px);
  max-width: 456px;
  margin: 0 auto;
`;

type Props = {};

const WelcomePage = (props: Props) => {
  const { user, isBrowserSupported } = useAppContext();

  return (
    <Container>
      <Wrapper>
        <Header />
        {isBrowserSupported !== null && !isBrowserSupported ? (
          <BrowserNotSupported />
        ) : (
          <>
            {!user ? (
              <ConnectButton />
            ) : (
              <>
                <NotificationsDisabledBar />
                <NotificationsEnabledBar />
                <Wallets />
              </>
            )}
          </>
        )}
      </Wrapper>
    </Container>
  );
};

export default WelcomePage;
