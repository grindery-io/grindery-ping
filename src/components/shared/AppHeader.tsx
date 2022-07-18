import React from "react";
import styled from "styled-components";
import useAppContext from "../../hooks/useAppContext";
import Logo from "./Logo";
import { SCREEN } from "../../constants";
import UserMenu from "./UserMenu";

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
  margin-left: auto;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
  }
`;

const LogoWrapper = styled.div`
  @media (min-width: ${SCREEN.TABLET}) {
    order: 2;
  }
`;

const CompanyNameWrapper = styled.div`
  display: none;
  @media (min-width: ${SCREEN.TABLET}) {
    display: block;
    order: 3;
    font-weight: 700;
    font-size: 16px;
    line-height: 110%;
    color: #0b0d17;
    cursor: pointer;
  }
`;

type Props = {};

const AppHeader = (props: Props) => {
  const { user } = useAppContext();

  return (
    <Wrapper>
      <LogoWrapper>
        <Logo variant="square" />
      </LogoWrapper>
      <CompanyNameWrapper>Grindery Ping</CompanyNameWrapper>
      {user && (
        <UserWrapper>
          <UserMenu />
        </UserWrapper>
      )}
    </Wrapper>
  );
};

export default AppHeader;
