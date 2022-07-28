import React, { useState, useEffect, createContext, useContext } from "react";
// @ts-ignore
import Web3Modal from "web3modal";
// @ts-ignore
import { providers } from "ethers";
// @ts-ignore
//import WalletConnectProvider from '@walletconnect/web3-provider'

export type GrinderyNexusContextProps = {
  /** Connect user wallet */
  connect: () => void;

  /** Disconnect user wallet */
  disconnect: () => void;

  /** User ID. Reference: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md */
  user: string | null;

  /** Set User ID  */
  setUser: React.Dispatch<React.SetStateAction<string | null>>;

  /** User wallet address  */
  address: string | null;

  /** Set user wallet address  */
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;

  /** User chain id  */
  chain: number | null;

  /** Set user chain id  */
  setChain: React.Dispatch<React.SetStateAction<number | null>>;
};

export type GrinderyNexusContextProviderProps = {
  children: React.ReactNode;

  /** Automatically authenticate user */
  cacheProvider?: boolean;
};

/** Grindery Nexus Context */
export const GrinderyNexusContext = createContext<GrinderyNexusContextProps>({
  connect: () => {},
  disconnect: () => {},
  user: null,
  setUser: () => {},
  address: null,
  setAddress: () => {},
  chain: null,
  setChain: () => {},
});

/** Grindery Nexus Context Provider */
export const GrinderyNexusContextProvider = (
  props: GrinderyNexusContextProviderProps
) => {
  const children = props.children;
  const cacheProvider =
    typeof props.cacheProvider !== "undefined" ? props.cacheProvider : true;

  // Web3Modal instance
  const [web3Modal, setWeb3Modal] = useState<any>(null);

  // User wallet
  const [user, setUser] = useState<string | null>(null);

  // User wallet
  const [address, setAddress] = useState<string | null>(null);

  // User wallet
  const [chain, setChain] = useState<number | null>(null);

  const addListeners = async (web3ModalProvider: any) => {
    // Subscribe to account change
    web3ModalProvider.on("accountsChanged", () => {
      window.location.reload();
    });

    // Subscribe to chainId change
    web3ModalProvider.on("chainChanged", () => {
      window.location.reload();
    });
  };

  const connect = async () => {
    const provider = await web3Modal.connect();
    addListeners(provider);
    const ethersProvider = new providers.Web3Provider(provider);
    const userAddress = await ethersProvider.getSigner().getAddress();
    const userChain = await ethersProvider.getSigner().getChainId();
    setAddress(userAddress);
    setChain(userChain);
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    setUser(null);
    setAddress(null);
    setChain(null);
  };

  useEffect(() => {
    const providerOptions = {
      /*walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "d62d1198328e4e08bb95c134a141717a",
        }
      },*/
    };

    const newWeb3Modal = new Web3Modal({
      cacheProvider: cacheProvider,
      network: "mainnet",
      providerOptions,
    });

    setWeb3Modal(newWeb3Modal);
  }, []);

  useEffect(() => {
    // connect automatically and without a popup if user is already connected
    if (web3Modal && web3Modal.cachedProvider) {
      connect();
    }
  }, [web3Modal]);

  useEffect(() => {
    if (address && chain) {
      setUser(`eip155:${chain}:${address}`);
    } else {
      setUser(null);
    }
  }, [address, chain]);

  return (
    <GrinderyNexusContext.Provider
      value={{
        connect,
        disconnect,
        user,
        setUser,
        address,
        setAddress,
        chain,
        setChain,
      }}
    >
      {children}
    </GrinderyNexusContext.Provider>
  );
};

/** Grindery Nexus Hook */
export const useGrinderyNexus = () => useContext(GrinderyNexusContext);

export default GrinderyNexusContextProvider;
