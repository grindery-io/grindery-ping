import React from "react";
import { Provider } from "@self.id/framework";
import AppContextProvider from "./context/AppContext";
import WelcomePage from "./components/pages/WelcomePage";
import AppHeader from "./components/shared/AppHeader";

function App() {
  return (
    <Provider client={{ ceramic: "testnet-clay" }}>
      <AppContextProvider>
        <AppHeader />
        <WelcomePage />
      </AppContextProvider>
    </Provider>
  );
}

export default App;
