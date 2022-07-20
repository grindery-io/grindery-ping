import { EthereumAuthProvider } from "@self.id/framework";

// Declare `ethereum` property for `window` object
declare global {
  interface Window {
    ethereum: any;
  }
}

// Create auth provider for SelfID authentication
export const createAuthProvider = async () => {
  const addresses = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return new EthereumAuthProvider(window.ethereum, addresses[0]);
};

// Get user's wallet address
export const getAddress = async (callback: (a: string) => void) => {
  if (window.ethereum) {
    const addresses = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    callback((addresses && addresses[0]) || "");
  } else {
    callback("");
  }
};
