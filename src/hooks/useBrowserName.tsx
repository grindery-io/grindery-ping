import { useEffect, useState } from "react";

const useBrowserName = () => {
  const [browser, setBrowser] = useState("Not detected");

  useEffect(() => {
    let userAgent = navigator.userAgent;
    let browserName;

    if (userAgent.match(/opr\//i)) {
      browserName = "opera";
    } else if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
    } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
    } else {
      browserName = "No browser detection";
    }
    setBrowser(browserName);
  }, []);

  return { browser };
};

export default useBrowserName;
