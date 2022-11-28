import React from "react";
import { ThemeProvider } from "grindery-ui";
import GrinderyNexusContextProvider from "use-grindery-nexus";
import AppContextProvider from "./context/AppContext";
import HomePage from "./components/pages/HomePage";

function App() {
  return (
    <ThemeProvider>
      <GrinderyNexusContextProvider>
        <AppContextProvider>
          <HomePage />
        </AppContextProvider>
      </GrinderyNexusContextProvider>
    </ThemeProvider>
  );
}

export default App;
