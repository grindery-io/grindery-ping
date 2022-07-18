import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import ConnectButton from "../shared/ConnectButton";
import { SCREEN } from "../../constants";
import useAppContext from "../../hooks/useAppContext";
import { SwitchInput } from "grindery-ui";
import { firebaseApp } from "../../context/AppContext";

const messaging = getMessaging(firebaseApp);

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // ...
});

const Container = styled.div`
  @media (min-width: ${SCREEN.TABLET}) {
    padding: 60px 106px;
    margin: 40px 20px 0;
  }
`;

const Wrapper = styled.div`
  margin-top: 67px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex-wrap: nowrap;
  min-height: calc(100vh - 150px);
  @media (min-width: ${SCREEN.TABLET}) {
    padding: 40px 0;
    margin-top: 67px;
    height: calc(100vh - 280px);
    max-height: calc(100vh - 350px);
    min-height: auto;
  }
`;

const Title = styled.p`
  font-weight: 700;
  font-size: 25px;
  line-height: 120%;
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
  padding: 0 90px;
  margin: 0 0 15px;
  @media (min-width: ${SCREEN.TABLET}) {
    padding: 0;
    margin: 0 auto 15px;
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
    max-width: 576px;
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

const WalletWrapper = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: #0b0d17;
  padding: 0;
  margin: 20px 0 20px;
`;

const SwitchInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 20px;
`;

type Props = {};

const WelcomePage = (props: Props) => {
  const { user, wallet } = useAppContext();
  const [notifications, setNotifications] = useState("");

  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      requestPermission();
    } else {
      setNotifications("");
    }
  };

  const requestPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, {
          vapidKey:
            "BAaPC5Kx24prWkEWnIEFOKvlseb2_DFVc6wzqwAQrHw_lJ96BE3r9dvX6I1LOuzW1HCAiIMftP35FLZW1FcXpUI",
        })
          .then((currentToken) => {
            if (currentToken) {
              setNotifications(currentToken);
            } else {
              console.log(
                "No registration token available. Request permission to generate one."
              );
              setNotifications("");
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
            setNotifications("");
          });
      }
    });
  };

  useEffect(() => {
    if (user) {
      requestPermission();
    } else {
      setNotifications("");
    }
  }, [user]);

  console.log("notificationsToken", notifications);

  return (
    <Container>
      <Wrapper>
        <Title>Welcome to Grindery Ping</Title>
        <Img src="/images/welcome.svg" alt="Welcome" />
        <Desc>
          Grindery Ping is the easiest way to receive notifications on
          blockchain transactions.
        </Desc>
        {!user ? (
          <>
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
                <WalletWrapper>
                  Wallet address: <strong>{wallet}</strong>
                </WalletWrapper>
                <SwitchInputWrapper>
                  <span>Enable push notifications</span>
                  <SwitchInput
                    value={!!notifications}
                    onChange={handleNotificationsChange}
                  />
                </SwitchInputWrapper>
              </>
            )}
          </>
        )}
      </Wrapper>
    </Container>
  );
};

export default WelcomePage;
