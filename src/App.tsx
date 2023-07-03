import React, { useEffect } from "react";
import { ThemeProvider } from "grindery-ui";
import GrinderyNexusContextProvider from "use-grindery-nexus";
import AppContextProvider from "./context/AppContext";
import HomePage from "./components/pages/HomePage";
import EarlyAccessModal from "./components/shared/EarlyAccessModal";
import { sendTwitterConversion } from "./utils/twitterTracking";

function App() {
  useEffect(() => {
    sendTwitterConversion("tw-ofep3-ofep4");
  }, []);
  return (
    <ThemeProvider>
      <GrinderyNexusContextProvider>
        <AppContextProvider>
          <EarlyAccessModal />
          <HomePage />
        </AppContextProvider>
      </GrinderyNexusContextProvider>
    </ThemeProvider>
  );
}

export default App;
