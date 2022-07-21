import React from "react";
import styled from "styled-components";
import ConnectButton from "../shared/ConnectButton";
import { ICONS, IMAGES, SCREEN } from "../../constants";
import useAppContext from "../../hooks/useAppContext";
import { SwitchInput } from "grindery-ui";

const Container = styled.div`
  @media (min-width: ${SCREEN.TABLET}) {
    padding: 60px 106px;
    margin: 40px 20px 0;
  }
`;

const Wrapper = styled.div`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex-wrap: nowrap;
  min-height: calc(100vh - 150px);
  @media (min-width: ${SCREEN.TABLET}) {
    padding: 40px 0;
    height: calc(100vh - 280px);
    max-height: calc(100vh - 350px);
    min-height: auto;
  }
`;

const Img = styled.img`
  margin: 0 auto 15px;
  width: 335px;
  max-width: 100%;
  height: 322px;
  @media (min-width: ${SCREEN.TABLET}) {
    width: 100%;
    max-width: 500px;
    height: 100%;
    max-height: 547px;
  }
`;

const Desc = styled.p`
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: #0b0d17;
  padding: 0;
  margin: 0 0 5px;
  @media (min-width: ${SCREEN.TABLET}) {
    max-width: 600px;
    margin: 0 auto 5px;
  }
`;

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

const SwitchInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
  margin: 15px auto 20px;
  width: 628px;
  max-width: calc(100vw - 80px);
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 20px;

  & span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

type Props = {};

const WelcomePage = (props: Props) => {
  const {
    user,
    wallet,
    walletWorkflowState,
    tokenWorkflowState,
    handleNotificationsChange,
    token,
    isBrowserSupported,
  } = useAppContext();

  return (
    <Container>
      <Wrapper>
        {!user ? (
          <>
            <Img src={IMAGES.WELCOME} alt="Welcome image" />
            <Desc>
              Grindery Ping is the easiest way to receive notifications on
              blockchain transactions.
            </Desc>
            <ConnectButton />
            <Disclaimer>
              Grindery Ping uses{" "}
              <a
                href="https://blog.ceramic.network/what-is-3id-connect/"
                target="_blank"
                rel="noreferrer"
              >
                Ceramic 3ID
              </a>{" "}
              to authenticate users.
            </Disclaimer>
          </>
        ) : (
          <>
            {wallet && (
              <>
                {!token ? (
                  <>
                    {isBrowserSupported !== null && !isBrowserSupported ? (
                      <>
                        <Img
                          src={IMAGES.NOT_SUPOORTED}
                          alt="Browser not supported image"
                        />
                        <Desc>Your browser is not supported</Desc>
                      </>
                    ) : (
                      <>
                        <Img src={IMAGES.ENABLE_NOTIFICATIONS} alt="Welcome" />
                        <Desc>Please enable notifications</Desc>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Img src={IMAGES.WELCOME} alt="Welcome image" />
                    <Desc>
                      You will receive browser notifications when a deposit to
                      your wallet address is made.
                    </Desc>
                    <SwitchInputWrapper>
                      <img src={ICONS.WALLET} alt="wallet icon" />
                      <span>{wallet}</span>
                      <div style={{ marginLeft: "auto" }}>
                        <label style={{ cursor: "pointer" }}>
                          <SwitchInput
                            value={
                              walletWorkflowState.state === "on" &&
                              tokenWorkflowState.state === "on"
                            }
                            onChange={handleNotificationsChange}
                          />
                        </label>
                      </div>
                    </SwitchInputWrapper>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Wrapper>
    </Container>
  );
};

export default WelcomePage;
