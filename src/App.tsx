import React from "react";
import { ThemeProvider } from "grindery-ui";
import GrinderyNexusContextProvider from "use-grindery-nexus";
import AppContextProvider from "./context/AppContext";
import HomePage from "./components/pages/HomePage";
import EarlyAccessModal from "./components/shared/EarlyAccessModal";

function App() {
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
