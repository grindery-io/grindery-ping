import React, { useEffect } from "react";
import { ThemeProvider } from "grindery-ui";
import GrinderyLoginProvider from "use-grindery-login";
import AppContextProvider from "./context/AppContext";
import HomePage from "./components/pages/HomePage";
import { sendTwitterConversion } from "./utils/twitterTracking";

function App() {
  useEffect(() => {
    sendTwitterConversion("tw-ofep3-ofep4");
  }, []);
  return (
    <ThemeProvider>
      <GrinderyLoginProvider>
        <AppContextProvider>
          <HomePage />
        </AppContextProvider>
      </GrinderyLoginProvider>
    </ThemeProvider>
  );
}

export default App;
