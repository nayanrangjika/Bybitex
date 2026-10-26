import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Repeat,
  Send,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { UserProfile, CryptoAsset } from '../types';
import { formatCurrency, formatINR, USDT_TO_INR_RATE } from '../utils/qr';

interface WalletOverviewProps {
  user: UserProfile;
  usdtBalance: number;
  onOpenTransfer: () => void;
  onOpenReceive: () => void;
  onOpenConvert: () => void;
  onSelectTab: (tab: string) => void;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  user,
  usdtBalance,
  onOpenTransfer,
  onOpenReceive,
  onOpenConvert,
  onSelectTab,
}) => {
  const [hideBalance, setHideBalance] = useState(false);

  const spotRatio = 0.88;
  const spotUsdt = usdtBalance * spotRatio;
  const fundingUsdt = usdtBalance * (1 - spotRatio);

  const assets: CryptoAsset[] = [
    {
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '₮',
      balance: usdtBalance,
      usdPrice: 1.0,
      change24h: 0.01,
      available: usdtBalance,
      inOrders: 0,
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      balance: 0.045,
      usdPrice: 93420.5,
      change24h: 3.42,
      available: 0.045,
      inOrders: 0,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'Ξ',
      balance: 0.85,
      usdPrice: 3380.25,
      change24h: 2.18,
      available: 0.85,
      inOrders: 0,
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: '◎',
      balance: 4.5,
      usdPrice: 194.8,
      change24h: -0.92,
      available: 4.5,
      inOrders: 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Account Verification Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 rounded-3xl border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#121214] text-[#F7A600] flex items-center justify-center font-black text-lg shadow-sm border border-amber-400/30">
            RC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                {user.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                KYC Level 2 Verified
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#F7A600] text-gray-950">
                VIP 1
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              UID: {user.uid} • Pay ID: {user.payId} • {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 font-mono bg-white/80 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-400">1 USDT =</span>
          <strong className="text-gray-900 font-bold">₹{USDT_TO_INR_RATE} INR</strong>
        </div>
      </div>

      {/* Main Balance Card with USDT and INR display */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#F7A600]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Balance info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>Total Estimated Assets</span>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                title={hideBalance ? 'Show balance' : 'Hide balance'}
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Primary USDT Balance */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 font-mono tracking-tight">
                {hideBalance ? '••••••••' : formatCurrency(usdtBalance)}
              </span>
              <span className="text-lg font-bold text-gray-500 font-mono">USDT</span>
            </div>

            {/* Indian Rupee (INR) Value Conversion */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200/80">
                <span className="text-xs text-gray-500 font-medium">INR Valuation:</span>
                <span className="text-base sm:text-lg font-extrabold text-gray-950 font-mono">
                  {hideBalance ? '••••••••' : `₹${formatINR(usdtBalance)} INR`}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                ≈ {hideBalance ? '••••••' : `$${formatCurrency(usdtBalance)} USD`}
              </span>
            </div>

            {/* Today's PnL */}
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="text-gray-500">Today's PnL:</span>
              <span className="font-semibold text-[#0ECB81] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                +₹25,562.30 (+2.21%)
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-gray-500 hidden sm:inline">
                Primary Account Asset: <strong className="text-gray-800">USDT (Tether)</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenTransfer}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 font-black text-sm rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>Withdraw / Send</span>
            </button>

            <button
              onClick={onOpenReceive}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-5 h-5 text-[#0ECB81]" />
              <span>Deposit / QR</span>
            </button>

            <button
              onClick={onOpenConvert}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <Repeat className="w-4 h-4 text-gray-600" />
              <span>Convert</span>
            </button>
          </div>
        </div>

        {/* Sub-wallet Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-gray-100 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Wallet className="w-3.5 h-3.5 text-gray-400" /> Unified Trading Account
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Spot & Margin</span>
            </div>
            <p className="text-sm font-bold font-mono text-gray-900">
              {hideBalance ? '••••' : formatCurrency(spotUsdt)} USDT
            </p>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              ≈ ₹{formatINR(spotUsdt)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Send className="w-3.5 h-3.5 text-gray-400" /> Funding & Pay Account
              </span>
              <span className="text-[10px] text-gray-400 font-mono">P2P & Direct</span>
            </div>
            <p className="text-sm font-bold font-mono text-gray-900">
              {hideBalance ? '••••' : formatCurrency(fundingUsdt)} USDT
            </p>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              ≈ ₹{formatINR(fundingUsdt)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0ECB81]" /> Supported Networks
              </span>
              <span className="text-[10px] text-[#0ECB81] font-semibold">Active</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <span>TRC20</span> • <span>BEP20</span> • <span>ERC20</span> • <span>SOL</span> • <span>POL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Transfer Banner */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 p-5 rounded-3xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F7A600] flex items-center justify-center text-gray-950 font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">
              Crypto Transfer via Address & QR Code
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Transfer USDT securely across Tron, BNB Chain, Ethereum or send directly with 0 fees to verified user IDs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenTransfer}
            className="flex-1 md:flex-none px-4 py-2 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" /> Send USDT
          </button>
          <button
            onClick={onOpenReceive}
            className="flex-1 md:flex-none px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4" /> Deposit QR
          </button>
        </div>
      </div>

      {/* Asset Balances Table with INR values */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Asset Balances</h3>
            <p className="text-xs text-gray-500">
              Holdings for <span className="font-semibold text-gray-800">{user.name}</span>
            </p>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-semibold text-[#D48800] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Total Balance</th>
                <th className="px-6 py-3">Price (USDT)</th>
                <th className="px-6 py-3">24h Change</th>
                <th className="px-6 py-3">INR Valuation</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => {
                const totalValueUsd = asset.balance * asset.usdPrice;
                const totalValueInr = totalValueUsd * USDT_TO_INR_RATE;
                const isUsdt = asset.symbol === 'USDT';

                return (
                  <tr
                    key={asset.symbol}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      isUsdt ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isUsdt
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {asset.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm">{asset.symbol}</span>
                            {isUsdt && (
                              <span className="text-[10px] font-bold bg-[#F7A600] text-gray-950 px-1.5 py-0.2 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 text-[11px]">{asset.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <span className="font-bold text-gray-900 text-sm">
                        {hideBalance ? '••••' : formatCurrency(asset.balance, isUsdt ? 2 : 4)}
                      </span>
                      <span className="text-gray-400 ml-1 font-normal">{asset.symbol}</span>
                    </td>

                    <td className="px-6 py-4 font-mono text-gray-700">
                      ${formatCurrency(asset.usdPrice)}
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <span
                        className={`font-semibold ${
                          asset.change24h >= 0 ? 'text-[#0ECB81]' : 'text-red-500'
                        }`}
                      >
                        {asset.change24h >= 0 ? '+' : ''}
                        {asset.change24h.toFixed(2)}%
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <div className="font-bold text-gray-900">
                        {hideBalance ? '••••' : `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(totalValueInr)}`}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        ≈ ${formatCurrency(totalValueUsd)} USD
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUsdt ? (
                          <>
                            <button
                              onClick={onOpenTransfer}
                              className="px-3 py-1 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={onOpenReceive}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Deposit
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={onOpenConvert}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Trade
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
