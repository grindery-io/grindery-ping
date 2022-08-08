import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin: 40px 0 0;
`;

const Title = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  text-align: center;
  color: #5b617d;
  margin: 0 0 20px;
  padding: 0;
`;

const Logos = styled.img`
  width: 100%;
  max-width: 100%;
  height: auto;
`;

type Props = {};

const FundedBy = (props: Props) => {
  return (
    <Wrapper>
      <Title>Funded by</Title>
      <Logos src="/images/funded-logos.png" alt="" />
    </Wrapper>
  );
};

export default FundedBy;
