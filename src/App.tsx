import React from "react";
import GrinderyNexusContextProvider from "./hooks/useGrinderyNexus";
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
