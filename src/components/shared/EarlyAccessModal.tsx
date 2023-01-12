import React, { useState } from "react";
import { TextInput } from "grindery-ui";
import styled from "styled-components";
import { ICONS } from "../../constants";
import useAppContext from "../../hooks/useAppContext";
import Button from "./Button";
import CheckBox from "./CheckBox";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100vh;
  left: 0;
  background: rgba(23, 11, 16, 0.4);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  flex-wrap: nowrap;
  z-index: 9999;
`;

const FormWrapper = styled.div`
  padding: 60px 30px;
  background: #ffffff;
  overflow: auto;

  & iframe:nth-child(2) {
    display: none !important;
  }
`;

const FormContent = styled.div`
  max-width: 604px;
  margin: 0 auto;
  color: #000000;
`;

const FormTitle = styled.h2`
  font-weight: 700;
  font-size: 40px;
  line-height: 130%;
  text-align: center;
  color: #000000;
  margin: 0 0 10px;
  padding: 0;
`;

const FormDesc = styled.p`
  font-weight: 400;
  font-size: 20px;
  line-height: 130%;
  text-align: center;
  color: #000000;
  margin: 0 0 20px;
  padding: 0;
`;

const SubtitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  margin: 10px 0 20px;
`;

const Subtitle = styled.p`
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: #0b0d17;
  margin: 0;
  padding: 0 10px;
`;

const Line = styled.div`
  height: 1px;
  flex: 1;
  background: #b1c3c9;
`;

const Socials = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 20px;

  & img {
    width: 40px;
    height: 40px;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 15px;
  margin-bottom: 10px;
`;

const CheckboxLabel = styled.label`
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  color: #0b0d17;
`;

const ErrorWrapper = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  color: #ff5858;
  margin: 20px 0 10px;
  padding: 0;
  text-align: center;
`;

const SuccessMessage = styled.div`
  font-weight: 400;
  font-size: 20px;
  line-height: 130%;
  text-align: center;
  color: #000000;
  margin: 10px 0 20px;
  padding: 0;
  white-space: pre-wrap;
`;

type Props = {};

const EarlyAccessModal = (props: Props) => {
  const {
    user,
    accessAllowed,
    verifying,
    client,
    setIsOptedIn,
    isOptedIn,
    chekingOptIn,
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!consent) {
      setError("Please, agree with our Terms of Service and Privacy Policy");
      return;
    }
    requestEarlyAccess();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value || "");
  };

  const requestEarlyAccess = async () => {
    setLoading(true);
    setError("");
    const res = await client
      ?.requestEarlyAccess(email, "ping.grindery.org", "Requested to Ping")
      .catch((err) => {
        console.error(
          "or_requestEarlyAccess error",
          err.response.data.error.message
        );
        setError(
          err.response.data.error.message || "Server error, please, try again"
        );

        setLoading(false);
      });
    if (res) {
      setSuccess(
        "We just sent you a confirmation email. Please check your email and confirm to activate your account."
      );
      //"Your request will be manually reviewed. We'll notify you by email as soon as we have an available opening."
    }

    setLoading(false);
  };

  return user && !accessAllowed && !verifying && !chekingOptIn && !isOptedIn ? (
    <Wrapper>
      <FormWrapper>
        <FormContent>
          {success ? (
            <>
              <img
                src="/images/thank-you.png"
                alt="thank you"
                style={{
                  marginBottom: "10px",
                  width: "604px",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
              <FormTitle>Thank you!</FormTitle>
              <SuccessMessage>{success}</SuccessMessage>
              <Button
                value="Continue"
                onClick={() => {
                  setIsOptedIn(true);
                }}
                loading={loading}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <FormTitle>Seems like you are new to Grindery.</FormTitle>
              <FormDesc>
                Please provide your email address so we can activate your
                account.
              </FormDesc>
              <TextInput
                label="Email *"
                placeholder=""
                value={email}
                onChange={handleEmailChange}
                size="small"
              />
              <CheckboxWrapper>
                <CheckBox
                  checked={consent}
                  onChange={(val) => {
                    setConsent(val);
                  }}
                  style={{ marginTop: "4px" }}
                />
                <CheckboxLabel>
                  To communicate with you we need you to provide us with
                  information. To learn more, see our{" "}
                  <a
                    href="https://docs.google.com/document/u/1/d/e/2PACX-1vROgga4q_jago0wilXMB28BxXoymaaegLv5pwCSVZMi8QRCp7oXmfxIhMEXeVC8Hrg3eBBGooMMa641/pub"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://www.grindery.io/privacy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </a>
                </CheckboxLabel>
              </CheckboxWrapper>
              {error && <ErrorWrapper>{error}</ErrorWrapper>}
              <Button
                value="Continue"
                onClick={() => {
                  validate();
                }}
                loading={loading}
                disabled={loading}
              />
            </>
          )}
          <SubtitleWrapper>
            <Line />
            <Subtitle>Or stay tuned via</Subtitle>
            <Line />
          </SubtitleWrapper>
          <Socials>
            <a
              href="https://discord.gg/PCMTWg3KzE"
              target="_blank"
              rel="noreferrer"
            >
              <img src={ICONS.SOCIAL_DISCORD} alt="Discord" />
            </a>
            <a href="https://t.me/grinderyio" target="_blank" rel="noreferrer">
              <img src={ICONS.SOCIAL_TG} alt="Telegram" />
            </a>
            <a
              href="https://twitter.com/grindery_io"
              target="_blank"
              rel="noreferrer"
            >
              <img src={ICONS.SOCIAL_TWITTER} alt="Twitter" />
            </a>
          </Socials>
        </FormContent>
      </FormWrapper>
    </Wrapper>
  ) : null;
};

export default EarlyAccessModal;
