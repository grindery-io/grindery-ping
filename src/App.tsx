import React from "react";
import GrinderyNexusContextProvider from "use-grindery-nexus";
import AppContextProvider from "./context/AppContext";
import WelcomePage from "./components/pages/WelcomePage";

function App() {
  return (
    <GrinderyNexusContextProvider>
      <AppContextProvider>
        <WelcomePage />
      </AppContextProvider>
    </GrinderyNexusContextProvider>
  );
}

export default App;
