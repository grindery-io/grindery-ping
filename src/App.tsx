import React from "react";
import GrinderyNexusContextProvider from "use-grindery-nexus";
import AppContextProvider from "./context/AppContext";
import HomePage from "./components/pages/HomePage";

function App() {
  return (
    <GrinderyNexusContextProvider>
      <AppContextProvider>
        <HomePage />
      </AppContextProvider>
    </GrinderyNexusContextProvider>
  );
}

export default App;
