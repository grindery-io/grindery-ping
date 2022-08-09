import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Dialog } from "grindery-ui";
import useAppContext from "../../hooks/useAppContext";
import TopBar from "../shared/TopBar";
import useBrowserName from "../../hooks/useBrowserName";

const DialogTrigger = styled.span`
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    text-decoration: none;
  }
`;

const DialogContent = styled.div`
  position: relative;
`;

const DialogCloseButton = styled.button`
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0px;
  margin: 0;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
`;

const ImageWrapper = styled.div`
  img {
    width: 100%;
    max-width: 100%;
    display: block;
    height: auto;
    margin: 0 auto;
  }
`;

type Props = {};

const NotificationsDisabledBar = (props: Props) => {
  const { token } = useAppContext();
  const [dialogOpened, setDialogOpened] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const { browser } = useBrowserName();

  const handleLearnHowClick = () => {
    setDialogOpened(true);
  };

  const handleDialogClose = () => {
    setDialogOpened(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setShowBar(true);
    }, 2000);
  }, []);

  return !token && showBar ? (
    <>
      <TopBar>
        <p>
          Enable your browser notifications.{" "}
          <DialogTrigger onClick={handleLearnHowClick}>Learn how</DialogTrigger>
          !
        </p>
      </TopBar>
      <Dialog
        maxWidth="664px"
        open={dialogOpened}
        onClose={() => {
          setDialogOpened(false);
        }}
      >
        <DialogContent>
          <DialogCloseButton onClick={handleDialogClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1208 12L17.9998 8.117C18.2517 7.83076 18.3851 7.45936 18.3729 7.0783C18.3607 6.69723 18.2039 6.33509 17.9343 6.0655C17.6647 5.79591 17.3026 5.63909 16.9215 5.62693C16.5405 5.61476 16.1691 5.74816 15.8828 6L11.9998 9.879L8.10983 5.988C7.9705 5.84867 7.80509 5.73815 7.62304 5.66274C7.441 5.58733 7.24588 5.54852 7.04883 5.54852C6.85179 5.54852 6.65667 5.58733 6.47462 5.66274C6.29258 5.73815 6.12717 5.84867 5.98783 5.988C5.8485 6.12734 5.73798 6.29275 5.66257 6.47479C5.58716 6.65684 5.54835 6.85196 5.54835 7.049C5.54835 7.24605 5.58716 7.44117 5.66257 7.62321C5.73798 7.80526 5.8485 7.97067 5.98783 8.11L9.87883 12L5.99983 15.882C5.84771 16.018 5.72492 16.1836 5.639 16.3687C5.55307 16.5537 5.50581 16.7544 5.5001 16.9584C5.49439 17.1623 5.53036 17.3653 5.6058 17.5549C5.68124 17.7445 5.79457 17.9167 5.93885 18.061C6.08314 18.2053 6.25534 18.3186 6.44493 18.394C6.63452 18.4695 6.83751 18.5054 7.04147 18.4997C7.24544 18.494 7.4461 18.4468 7.63117 18.3608C7.81625 18.2749 7.98184 18.1521 8.11783 18L11.9998 14.121L15.8778 18C16.1592 18.2814 16.5409 18.4395 16.9388 18.4395C17.3368 18.4395 17.7184 18.2814 17.9998 18C18.2812 17.7186 18.4393 17.337 18.4393 16.939C18.4393 16.5411 18.2812 16.1594 17.9998 15.878L14.1208 12Z"
                fill="#0B0D17"
              />
            </svg>
          </DialogCloseButton>
          <ImageWrapper>
            <img
              src={
                browser === "firefox"
                  ? "/images/enable-notifications-firefox.png"
                  : "/images/enable-notifications-chrome.png"
              }
              alt="how to enable browser notifications"
            />
          </ImageWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : null;
};

export default NotificationsDisabledBar;
