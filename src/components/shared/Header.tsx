import React from "react";
import styled from "styled-components";
import { IMAGES } from "../../constants";
import useAppContext from "../../hooks/useAppContext";

const Img = styled.img`
  margin: 0 auto 20px;
  width: 100%;
  max-width: 100%;
  height: auto;
`;

const Title = styled.h1`
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  font-size: 30px;
  line-height: 130%;
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
  padding: 0;
  margin: 0 0 10px;
`;

const Desc = styled.p`
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: #6d6f78;
  padding: 0;
  margin: 0 0 20px;
`;

type Props = {};

const Header = (props: Props) => {
  const { user } = useAppContext();

  return (
    <>
      <Img
        src={IMAGES.WELCOME}
        alt="Example notification with blockchain icons"
      />
      <Title>{!user ? "Welcome to Ping" : "Get a Ping!"}</Title>
      <Desc>
        Ping allows you to receive a browser notification when a token is
        deposited on any of your wallets on any blockchain.
      </Desc>
    </>
  );
};

export default Header;
