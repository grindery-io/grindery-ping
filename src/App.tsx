import React, { useEffect } from "react";
import { ThemeProvider, CircularProgress } from "grindery-ui";
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
      <GrinderyLoginProvider
        loader={
          <div style={{ textAlign: "center", margin: "80px auto" }}>
            <CircularProgress />
          </div>
        }
      >
        <AppContextProvider>
          <HomePage />
        </AppContextProvider>
      </GrinderyLoginProvider>
    </ThemeProvider>
  );
}

export default App;
