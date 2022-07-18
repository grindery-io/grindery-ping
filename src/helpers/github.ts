import axios from "axios";
import { WEB2_CONNECTORS_PATH, WEB3_CONNECTORS_PATH } from "../constants";

export const getCDSFiles = async () => {
  const responses = [];
  const web2Connectors = await axios.get(WEB2_CONNECTORS_PATH);
  for (let i = 0; i < web2Connectors.data.length; i++) {
    const url = web2Connectors.data[i].download_url;
    if (url) {
      responses.push(
        await axios.get(
          `${url}${/\?/.test(url) ? "&" : "?"}v=${encodeURIComponent(
            "2022.07.05v1"
          )}`
        )
      );
    }
  }
  const web3Connectors = await axios.get(WEB3_CONNECTORS_PATH);
  for (let i = 0; i < web3Connectors.data.length; i++) {
    const url = web3Connectors.data[i].download_url;
    if (url) {
      responses.push(
        await axios.get(
          `${url}${/\?/.test(url) ? "&" : "?"}v=${encodeURIComponent(
            "2022.07.05v1"
          )}`
        )
      );
    }
  }

  return responses;
};
