import React from "react";
import styled from "styled-components";
import { AppsMenu } from "grindery-ui";
import useAppContext from "../../hooks/useAppContext";
import Logo from "./Logo";
import { GRINDERY_APPS, SCREEN } from "../../constants";
import UserMenu from "./UserMenu";
import { useGrinderyLogin } from "use-grindery-login";

const Wrapper = styled.div`
  border-bottom: 1px solid #dcdcdc;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
  position: fixed;
  left: 0;
  top: 0;
  background: #ffffff;
  width: 435px;
  max-width: 100vw;
  box-sizing: border-box;
  z-index: 2;
  @media (min-width: ${SCREEN.TABLET}) {
    width: 100%;
    top: 0;
    max-width: 100%;
  }
`;

const UserWrapper = styled.div`
  margin-left: 0;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
  }
`;

const AppsMenuWrapper = styled.div`
  order: 3;
  margin-left: auto;
`;

const LogoWrapper = styled.div`
  @media (min-width: ${SCREEN.TABLET}) {
    order: 2;
  }
`;

const CompanyNameWrapper = styled.div`
  display: block;
  order: 3;
  font-weight: 700;
  font-size: 16px;
  line-height: 110%;
  color: #0b0d17;
  cursor: pointer;
`;

const ConnectWrapper = styled.div`
  display: none;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
    display: block;

    & button {
      background: #0b0d17;
      border-radius: 5px;
      box-shadow: none;
      font-weight: 700;
      font-size: 16px;
      line-height: 150%;
      color: #ffffff;
      padding: 8px 24px;
      cursor: pointer;
      border: none;

      &:hover {
        box-shadow: 0px 4px 8px rgba(106, 71, 147, 0.1);
      }
    }
  }
`;

type Props = {};

const AppHeader = (props: Props) => {
  const { user } = useAppContext();
  const { connect } = useGrinderyLogin();

  return (
    <Wrapper>
      <LogoWrapper>
        <Logo variant="square" />
      </LogoWrapper>
      <CompanyNameWrapper>Ping</CompanyNameWrapper>
      <AppsMenuWrapper>
        <AppsMenu apps={GRINDERY_APPS} />
      </AppsMenuWrapper>
      {!user && "ethereum" in window && (
        <ConnectWrapper>
          <button
            onClick={() => {
              connect();
            }}
          >
            Connect wallet
          </button>
        </ConnectWrapper>
      )}
      {user && (
        <UserWrapper>
          <UserMenu />
        </UserWrapper>
      )}
    </Wrapper>
  );
};

export default AppHeader;
