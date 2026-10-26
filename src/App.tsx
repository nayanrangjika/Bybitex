import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  TrendingUp,
  History,
  ShieldCheck,
  ArrowRightLeft,
} from 'lucide-react';
import { INITIAL_USER, INITIAL_USDT_BALANCE, INITIAL_TRANSACTIONS } from './data/mockData';
import { UserProfile, Transaction, CryptoNetwork } from './types';
import { formatCurrency, formatINR, generateTxHash } from './utils/qr';
import { Navbar } from './components/Navbar';
import { WalletOverview } from './components/WalletOverview';
import { TransferModal } from './components/TransferModal';
import { ReceiveModal } from './components/ReceiveModal';
import { QRScannerModal } from './components/QRScannerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { TransactionHistory } from './components/TransactionHistory';
import { MarketTicker } from './components/MarketTicker';
import { ConvertModal } from './components/ConvertModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // USDT balance: starting with 13,099.00 USDT
  const [usdtBalance, setUsdtBalance] = useState<number>(() => {
    const saved = localStorage.getItem('bybit_usdt_balance');
    return saved !== null ? parseFloat(saved) : INITIAL_USDT_BALANCE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bybit_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [user] = useState<UserProfile>(INITIAL_USER);
  const [currentTab, setCurrentTab] = useState<string>('wallet');

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bybit_usdt_balance', usdtBalance.toString());
  }, [usdtBalance]);

  useEffect(() => {
    localStorage.setItem('bybit_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Process outbound transfer after OTP 979922 verification
  const handleTransferComplete = (data: {
    amount: number;
    fee: number;
    recipientAddress?: string;
    recipientPayId?: string;
    recipientName?: string;
    network?: CryptoNetwork;
    txHash: string;
    type: 'send_crypto' | 'send_pay';
    note?: string;
  }) => {
    const totalDeduction = data.amount;
    const newBalance = Math.max(0, usdtBalance - totalDeduction);
    setUsdtBalance(newBalance);

    const newTx: Transaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: data.type,
      title: data.type === 'send_crypto' ? 'Withdrawal USDT' : 'Direct Pay Sent',
      asset: 'USDT',
      amount: data.amount,
      fee: data.fee,
      recipientAddress: data.recipientAddress,
      recipientPayId: data.recipientPayId,
      recipientName: data.recipientName,
      network: data.network,
      txHash: data.txHash,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      'success',
      'Withdrawal Processed',
      `Transferred ${formatCurrency(data.amount)} USDT (≈ ₹${formatINR(data.amount)}) to ${
        data.recipientAddress ? data.recipientAddress.slice(0, 10) + '...' : data.recipientPayId
      }`
    );
  };

  // Process instant convert
  const handleConvertSuccess = (
    fromAsset: string,
    toAsset: string,
    fromAmount: number,
    toAmount: number
  ) => {
    if (fromAsset === 'USDT') {
      setUsdtBalance((prev) => Math.max(0, prev - fromAmount));
    } else if (toAsset === 'USDT') {
      setUsdtBalance((prev) => prev + toAmount);
    }

    const newTx: Transaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'convert',
      title: `Converted ${fromAsset} to ${toAsset}`,
      asset: toAsset,
      amount: toAmount,
      fee: 0,
      txHash: `CONV-${Math.floor(10000000 + Math.random() * 90000000)}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `Converted ${fromAmount} ${fromAsset} for ${toAmount.toFixed(4)} ${toAsset}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      'success',
      'Conversion Completed',
      `Swapped ${fromAmount} ${fromAsset} for ${toAmount.toFixed(4)} ${toAsset}`
    );
  };

  const handleUniversalScan = (address: string) => {
    setScannerModalOpen(false);
    setTransferModalOpen(true);
    addToast('info', 'Address Detected', `Scanned address: ${address.slice(0, 12)}...`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121214] flex flex-col font-sans selection:bg-[#F7A600]/30">
      {/* Top Navbar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenTransfer={() => setTransferModalOpen(true)}
        onOpenReceive={() => setReceiveModalOpen(true)}
        onOpenScanner={() => setScannerModalOpen(true)}
        usdtBalance={usdtBalance}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-12">
        {currentTab === 'wallet' && (
          <WalletOverview
            user={user}
            usdtBalance={usdtBalance}
            onOpenTransfer={() => setTransferModalOpen(true)}
            onOpenReceive={() => setReceiveModalOpen(true)}
            onOpenConvert={() => setConvertModalOpen(true)}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'transfer' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xs">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">USDT Transfer & Withdrawal Hub</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Send Tether (USDT) on TRC20, BEP20, ERC20 or Direct Pay with OTP authorization.
                </p>
                <p className="text-xs font-mono text-gray-600 font-semibold mt-1">
                  Available: {formatCurrency(usdtBalance)} USDT ≈ ₹{formatINR(usdtBalance)} INR
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="px-5 py-2.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 font-black text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" /> Start New Transfer
                </button>
                <button
                  onClick={() => setScannerModalOpen(true)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" /> Scan QR
                </button>
              </div>
            </div>

            {/* Quick launch cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setTransferModalOpen(true)}
                className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-[#F7A600] transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F7A600]/15 text-[#D48800] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Withdraw to Crypto Address / QR</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Transfer USDT on Tron (TRC20), BNB Chain (BEP20), Ethereum (ERC20), Solana, or Polygon with real-time address validation.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-[#D48800] group-hover:underline">
                  Initiate Address Transfer →
                </span>
              </div>

              <div
                onClick={() => setTransferModalOpen(true)}
                className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-[#0ECB81] transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0ECB81] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Direct Account Pay (0 Fee)</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Send USDT instantly to another account using Pay ID, UID, or registered email with 0 gas fees.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-[#0ECB81] group-hover:underline">
                  Send via Pay ID →
                </span>
              </div>
            </div>

            {/* History of Transfers */}
            <TransactionHistory
              transactions={transactions}
              onSelectTransaction={setSelectedReceipt}
              onOpenTransfer={() => setTransferModalOpen(true)}
            />
          </div>
        )}

        {currentTab === 'markets' && (
          <MarketTicker
            onOpenConvert={() => setConvertModalOpen(true)}
            onOpenTransfer={() => setTransferModalOpen(true)}
          />
        )}

        {currentTab === 'trade' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Instant Convert Hub</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Exchange USDT for BTC, ETH, SOL and BNB with zero fee execution.
                </p>
              </div>
              <button
                onClick={() => setConvertModalOpen(true)}
                className="px-5 py-2.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 font-black text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" /> Open Convert
              </button>
            </div>

            <MarketTicker
              onOpenConvert={() => setConvertModalOpen(true)}
              onOpenTransfer={() => setTransferModalOpen(true)}
            />
          </div>
        )}

        {currentTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            onSelectTransaction={setSelectedReceipt}
            onOpenTransfer={() => setTransferModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-3 flex items-center justify-around text-[10px] font-semibold text-gray-500">
        <button
          onClick={() => setCurrentTab('wallet')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            currentTab === 'wallet' ? 'text-gray-950 font-bold' : ''
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Assets</span>
        </button>

        <button
          onClick={() => setCurrentTab('transfer')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            currentTab === 'transfer' ? 'text-[#D48800] font-bold' : ''
          }`}
        >
          <ArrowUpRight className="w-5 h-5" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => setScannerModalOpen(true)}
          className="-mt-5 w-11 h-11 rounded-full bg-[#F7A600] text-gray-950 shadow-md flex items-center justify-center border-2 border-white cursor-pointer"
        >
          <QrCode className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentTab('markets')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            currentTab === 'markets' ? 'text-gray-950 font-bold' : ''
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Markets</span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            currentTab === 'history' ? 'text-gray-950 font-bold' : ''
          }`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
            <span>Bybit Global Node Gateway • Secure SSL v3</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Account: <strong>Rahul Chaudhary</strong> • Verified Holder • Balance: {formatCurrency(usdtBalance)} USDT (₹{formatINR(usdtBalance)})
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        user={user}
        usdtBalance={usdtBalance}
        onTransferComplete={handleTransferComplete}
      />

      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        user={user}
      />

      <QRScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        onScanSuccess={handleUniversalScan}
      />

      <ReceiptModal
        isOpen={!!selectedReceipt}
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <ConvertModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        usdtBalance={usdtBalance}
        onConvertSuccess={handleConvertSuccess}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
