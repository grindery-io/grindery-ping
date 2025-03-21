import React from "react";
import styled from "styled-components";
import ConnectButton from "../shared/ConnectButton";
import useAppContext from "../../hooks/useAppContext";
import BrowserNotSupported from "../shared/BrowserNotSupported";
import Header from "../shared/Header";
import Wallets from "../shared/Wallets";
import NotificationsDisabledBar from "../shared/NotificationsDisabledBar";
import NotificationsEnabledBar from "../shared/NotificationsEnabledBar";
import useBrowserName from "../../hooks/useBrowserName";
import FundedBy from "../shared/FundedBy";
import AppHeader from "../shared/AppHeader";

const Container = styled.div`
  padding: 120px 20px 60px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex-wrap: nowrap;
  min-height: calc(100vh - 180px);
  max-width: 456px;
  margin: 0 auto;
`;

type Props = {};

const WelcomePage = (props: Props) => {
  const { user, isBrowserSupported } = useAppContext();
  const { browser } = useBrowserName();

  return (
    <Container>
      <AppHeader />
      <Wrapper>
        <Header />
        {(isBrowserSupported !== null && !isBrowserSupported) ||
        browser !== "chrome" ? (
          <>
            <BrowserNotSupported />
            <FundedBy />
          </>
        ) : (
          <>
            {!user ? (
              <>
                <ConnectButton />
                <FundedBy />
              </>
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
