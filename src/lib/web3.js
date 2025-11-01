import { ethers } from 'ethers';

/**
 * Web3 utility functions for payment processing with multi-cryptocurrency support
 */

// Supported networks and their configurations
export const NETWORKS = {
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    currencyName: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    currency: 'SEPETH',
    currencyName: 'Sepolia ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'SEPETH',
      decimals: 18,
    },
  },
  // Add more networks as needed (Polygon, BSC, etc.)
};

/**
 * Get the network configuration by chain ID
 */
export function getNetworkConfig(chainId) {
  return Object.values(NETWORKS).find(network => network.chainId === chainId) || NETWORKS.MAINNET;
}

/**
 * Get network by currency symbol
 */
export function getNetworkByCurrency(currency) {
  return Object.values(NETWORKS).find(network => network.currency === currency) || NETWORKS.MAINNET;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies() {
  return Object.values(NETWORKS).map(network => ({
    currency: network.currency,
    name: network.currencyName,
    chainId: network.chainId,
    network: network.name,
  }));
}

/**
 * Format wallet address for display (shortened version)
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Convert USD amount to cryptocurrency (ETH, SEPETH, etc.)
 * Note: In production, you should use a price oracle API
 */
export async function usdToCrypto(usdAmount, currency = 'ETH', priceInUsd = null) {
  // For development, SEPETH uses the same price as ETH (both are testnet/mainnet versions)
  // In production, fetch actual prices from CoinGecko API or similar
  
  let cryptoPrice;
  if (priceInUsd) {
    cryptoPrice = priceInUsd;
  } else {
    // Placeholder prices - in production, fetch from API
    const prices = {
      ETH: 2000, // $2000 per ETH
      SEPETH: 2000, // Same as ETH for now (testnet uses same value)
    };
    cryptoPrice = prices[currency] || 2000;
  }
  
  return usdAmount / cryptoPrice;
}

/**
 * Convert cryptocurrency amount to USD
 */
export function cryptoToUsd(cryptoAmount, currency = 'ETH', priceInUsd = null) {
  let cryptoPrice;
  if (priceInUsd) {
    cryptoPrice = priceInUsd;
  } else {
    const prices = {
      ETH: 2000,
      SEPETH: 2000,
    };
    cryptoPrice = prices[currency] || 2000;
  }
  
  return cryptoAmount * cryptoPrice;
}

/**
 * Get subscription price in cryptocurrency based on tier and currency
 */
export async function getSubscriptionPriceInCrypto(tier, currency = 'ETH') {
  const prices = {
    Basic: 9.99,
    Pro: 19.99,
  };

  const usdPrice = prices[tier] || 0;
  return await usdToCrypto(usdPrice, currency);
}

/**
 * Legacy function for backward compatibility
 */
export async function getSubscriptionPriceInEth(tier) {
  return await getSubscriptionPriceInCrypto(tier, 'ETH');
}

/**
 * Format cryptocurrency amount for display
 */
export function formatCryptoAmount(amount, currency = 'ETH', decimals = 6) {
  if (!amount || isNaN(amount)) return '0';
  return parseFloat(amount).toFixed(decimals);
}

/**
 * Get network configuration for MetaMask
 */
export function getNetworkParams(currency) {
  const network = getNetworkByCurrency(currency);
  
  return {
    chainId: `0x${network.chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: [network.explorerUrl],
  };
}

/**
 * Check if a chain ID matches a currency
 */
export function isChainIdForCurrency(chainId, currency) {
  const network = getNetworkByCurrency(currency);
  return network.chainId === chainId;
}