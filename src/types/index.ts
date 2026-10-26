export type CryptoNetwork = 'TRC20' | 'BEP20' | 'ERC20' | 'SOL' | 'POLYGON' | 'ARBITRUM';

export interface NetworkConfig {
  id: CryptoNetwork;
  name: string;
  fullName: string;
  fee: number; // in USDT
  estimatedTime: string;
  minWithdrawal: number;
  prefixPattern?: string;
  iconBg: string;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  uid: string;
  vipLevel: number;
  isVerified: boolean;
  payId: string;
  avatarUrl?: string;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  usdPrice: number;
  change24h: number;
  available: number;
  inOrders: number;
}

export type TransactionType = 'send_crypto' | 'send_pay' | 'receive_crypto' | 'receive_pay' | 'convert';

export type TransactionStatus = 'completed' | 'processing' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  asset: string;
  amount: number;
  fee: number;
  recipientAddress?: string;
  recipientPayId?: string;
  recipientName?: string;
  network?: CryptoNetwork;
  txHash: string;
  timestamp: string; // ISO string
  status: TransactionStatus;
  note?: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  network: CryptoNetwork;
  memo?: string;
  type: 'external' | 'binance_user';
  payId?: string;
}

export interface MarketItem {
  symbol: string;
  pair: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  sparkline: number[];
}
