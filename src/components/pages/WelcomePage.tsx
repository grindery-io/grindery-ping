import React, { useEffect, useState } from "react";
import styled from "styled-components";
import _ from "lodash";
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
  justify-content: center;
  flex-wrap: nowrap;
  gap: 20px;
  margin: 20px 0;
`;

type Props = {};

const WelcomePage = (props: Props) => {
  const { user, wallet, workflow, editWorkflow, saveWorkflow } =
    useAppContext();
  const [token, setToken] = useState("");

  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let enrichedWorkflow = { ...workflow };
    const data: any = {
      creator: user || "",
      "trigger.input.to": wallet || "",
      "actions[0].input.token": token || "",
    };
    Object.keys(data).forEach((path) => {
      _.set(enrichedWorkflow, path, data[path]);
    });
    if (e.target.checked) {
      if (enrichedWorkflow.key) {
        editWorkflow({ ...enrichedWorkflow, state: "on" });
      } else {
        saveWorkflow();
      }
    } else {
      if (enrichedWorkflow.key) {
        editWorkflow({ ...enrichedWorkflow, state: "off" });
      }
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
              setToken(currentToken);
            } else {
              console.log(
                "No registration token available. Request permission to generate one."
              );
              setToken("");
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
            setToken("");
          });
      } else {
        setToken("");
      }
    });
  };

  useEffect(() => {
    if (user) {
      requestPermission();
    } else {
      setToken("");
    }
  }, [user]);

  return (
    <Container>
      <Wrapper>
        {!user ? (
          <>
            <Img src="/images/welcome.svg" alt="Welcome" />
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
                    <Img src="/images/welcome.svg" alt="Welcome" />
                    <Desc>
                      Please grant permissions to the website to receive
                      notifications when a deposit to your wallet address is
                      made.
                    </Desc>
                  </>
                ) : (
                  <>
                    <Img src="/images/welcome.svg" alt="Welcome" />
                    <Desc>
                      You will receive browser notifications when a deposit to
                      your wallet address is made.
                    </Desc>
                    <SwitchInputWrapper>
                      <span>
                        Wallet <strong>{wallet}</strong>
                      </span>
                      <SwitchInput
                        value={workflow.state === "on"}
                        onChange={handleNotificationsChange}
                      />
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
