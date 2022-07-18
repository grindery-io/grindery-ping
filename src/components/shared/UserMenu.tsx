import React, { useState } from "react";
import styled from "styled-components";
import Foco from "react-foco";
import { ICONS } from "../../constants";
import useAppContext from "../../hooks/useAppContext";

const UserContainer = styled.div`
  position: relative;
`;

const UserWrapper = styled.div`
  border: 1px solid #d3deec;
  border-radius: 34px;
  padding: 7px 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 6px;
  cursor: pointer;
`;

const UserStatus = styled.div`
  background: #00b674;
  width: 16px;
  height: 16px;
  border-radius: 8px;
`;

const UserId = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 150%;
  margin: 0;
  padding: 0;
`;

const UserDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  padding-top: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
  transform: translateY(-10px);

  &.opened {
    opacity: 1;
    visibility: visible;
    transform: translateY(0px);
  }
`;

const UserDropdownContent = styled.div`
  background: #ffffff;
  border: 1px solid #dcdcdc;
  box-shadow: 2px 2px 24px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  padding: 10px;

  & button {
    background: transparent;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: nowrap;
    border-radius: 5px;
    border: none;
    gap: 10px;
    cursor: pointer;
    padding: 5px;

    &:hover {
      background: #fdfbff;
    }

    & span {
      font-weight: 400;
      font-size: 14px;
      line-height: 160%;
      color: #141416;
      white-space: nowrap;
    }
  }
`;

type Props = {};

const UserMenu = (props: Props) => {
  const { user, disconnect } = useAppContext();
  const [menuOpened, setMenuOpened] = useState(false);
  return user ? (
    <UserContainer>
      <Foco
        onClickOutside={() => {
          setMenuOpened(false);
        }}
        onFocusOutside={() => {
          setMenuOpened(false);
        }}
      >
        <UserWrapper
          onClick={() => {
            setMenuOpened(!menuOpened);
          }}
        >
          <UserStatus />
          <UserId>
            {user.substring(0, 5) + "..." + user.substring(user.length - 4)}
          </UserId>
        </UserWrapper>

        <UserDropdown className={menuOpened ? "opened" : ""}>
          <UserDropdownContent>
            <button
              onClick={() => {
                disconnect();
              }}
            >
              <img src={ICONS.DISCONNECT} alt="Disconnect icon" />
              <span>Disconnect</span>
            </button>
          </UserDropdownContent>
        </UserDropdown>
      </Foco>
    </UserContainer>
  ) : null;
};

export default UserMenu;
