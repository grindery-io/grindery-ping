import React from "react";
import { Provider } from "@self.id/framework";
import AppContextProvider from "./context/AppContext";
import WelcomePage from "./components/pages/WelcomePage";

function App() {
  return (
    <Provider client={{ ceramic: "testnet-clay" }}>
      <AppContextProvider>
        <WelcomePage />
      </AppContextProvider>
    </Provider>
  );
}

export default App;
