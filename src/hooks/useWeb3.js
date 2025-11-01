"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Declare window.ethereum type
if (typeof window !== 'undefined') {
  window.ethereum = window.ethereum || undefined;
}

/**
 * Custom hook for MetaMask/Web3 wallet integration
 * Manages wallet connection, account, balance, and network state
 */
export function useWeb3() {
  const [web3State, setWeb3State] = useState({
    account: null,
    isConnected: false,
    chainId: null,
    balance: null,
    isLoading: false,
    error: null,
  });

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  /**
   * Check if user is already connected
   */
  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      const accounts = await browserProvider.send('eth_accounts', []);
      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner();
        setSigner(signer);

        const address = await signer.getAddress();
        const balance = await browserProvider.getBalance(address);
        const network = await browserProvider.getNetwork();

        setWeb3State({
          isConnected: true,
          account: address,
          balance: ethers.formatEther(balance),
          chainId: Number(network.chainId),
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setWeb3State(prev => ({
        ...prev,
        error: 'Failed to check connection',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Connect to MetaMask wallet
   */
  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      setWeb3State(prev => ({
        ...prev,
        error: 'MetaMask not installed. Please install MetaMask extension.',
        isLoading: false,
      }));
      return;
    }

    setWeb3State(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      // Request account access
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner();
        setSigner(signer);

        const address = await signer.getAddress();
        const balance = await browserProvider.getBalance(address);
        const network = await browserProvider.getNetwork();

        setWeb3State({
          isConnected: true,
          account: address,
          balance: ethers.formatEther(balance),
          chainId: Number(network.chainId),
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setWeb3State({
        account: null,
        isConnected: false,
        chainId: null,
        balance: null,
        isLoading: false,
        error: error.message || 'Failed to connect to wallet',
      });
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setWeb3State({
      account: null,
      isConnected: false,
      chainId: null,
      balance: null,
      isLoading: false,
      error: null,
    });
    setSigner(null);
    setProvider(null);
  }, []);

  /**
   * Switch to a specific network (e.g., Ethereum Mainnet, Sepolia testnet)
   * @param {number|string} chainIdOrCurrency - Chain ID or currency symbol (ETH, SEPETH)
   */
  const switchNetwork = useCallback(async (chainIdOrCurrency) => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    let chainId;
    
    // If it's a currency symbol, get the chain ID
    if (typeof chainIdOrCurrency === 'string' && isNaN(chainIdOrCurrency)) {
      const { getNetworkByCurrency, getNetworkParams } = await import('@/lib/web3');
      const network = getNetworkByCurrency(chainIdOrCurrency);
      chainId = network.chainId;
    } else {
      chainId = typeof chainIdOrCurrency === 'string' ? parseInt(chainIdOrCurrency, 16) : chainIdOrCurrency;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      // Refresh connection after switching
      await checkConnection();
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        // Try to add the network
        try {
          const { getNetworkByCurrency, getNetworkParams } = await import('@/lib/web3');
          const currency = typeof chainIdOrCurrency === 'string' && isNaN(chainIdOrCurrency) 
            ? chainIdOrCurrency 
            : Object.values((await import('@/lib/web3')).NETWORKS).find(n => n.chainId === chainId)?.currency || 'ETH';
          const networkParams = getNetworkParams(currency);
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          });
          // Refresh connection after adding
          await checkConnection();
        } catch (addError) {
          throw new Error(`Failed to add network. Please add ${chainIdOrCurrency} network manually in MetaMask.`);
        }
      } else {
        throw switchError;
      }
    }
  }, [checkConnection]);

  // Check connection on mount and listen for account/chain changes
  useEffect(() => {
    checkConnection();

    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, disconnect]);

  return {
    ...web3State,
    connect,
    disconnect,
    switchNetwork,
    provider,
    signer,
    isMetaMaskInstalled: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
  };
}
