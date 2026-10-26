import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatINR, truncateAddress } from '../utils/qr';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenTransfer: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onSelectTransaction,
  onOpenTransfer,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'send' && !tx.type.startsWith('send')) return false;
    if (filterType === 'receive' && !tx.type.startsWith('receive')) return false;
    if (filterType === 'pay' && !tx.type.includes('pay')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAddr = tx.recipientAddress?.toLowerCase().includes(q);
      const matchPayId = tx.recipientPayId?.toLowerCase().includes(q);
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchNote = tx.note?.toLowerCase().includes(q);
      const matchTitle = tx.title.toLowerCase().includes(q);
      return matchAddr || matchPayId || matchHash || matchNote || matchTitle;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = 'ID,Type,Asset,Amount_USDT,Amount_INR,Fee,Recipient,Network,TxHash,Timestamp,Status\n';
    const rows = filtered
      .map(
        (t) =>
          `"${t.id}","${t.type}","${t.asset}",${t.amount},${(t.amount * 89.85).toFixed(2)},${t.fee},"${
            t.recipientAddress || t.recipientPayId || ''
          }","${t.network || ''}","${t.txHash}","${t.timestamp}","${t.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bybit_Transaction_History_Rahul_Chaudhary.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Transaction & Payment History</h3>
          <p className="text-xs text-gray-500">
            Real-time ledger of blockchain deposits, crypto withdrawals, and direct settlements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search address, TxID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#F7A600] focus:bg-white w-48 sm:w-56"
            />
          </div>

          {/* Export button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-gray-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {[
          { id: 'all', label: 'All Records' },
          { id: 'send', label: 'Withdrawals / Sent' },
          { id: 'receive', label: 'Deposits / Received' },
          { id: 'pay', label: 'Direct Pay' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterType === f.id
                ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <p className="text-sm">No transactions found matching your criteria.</p>
            <button
              onClick={onOpenTransfer}
              className="px-4 py-2 bg-[#F7A600] text-gray-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Initiate Transfer
            </button>
          </div>
        ) : (
          filtered.map((tx) => {
            const isDeposit = tx.type.startsWith('receive');
            const inrAmount = formatINR(tx.amount);
            const dateStr = new Date(tx.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-4 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-amber-50/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDeposit
                        ? 'bg-emerald-50 text-[#0ECB81]'
                        : 'bg-amber-50 text-[#D48800]'
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  {/* Title & Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{tx.title}</span>
                      {tx.network && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                          {tx.network}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 truncate">
                      <span>{dateStr}</span>
                      <span>•</span>
                      {tx.recipientAddress && (
                        <span className="font-mono truncate">
                          To: {truncateAddress(tx.recipientAddress, 6, 4)}
                        </span>
                      )}
                      {tx.recipientPayId && (
                        <span className="font-mono">Pay ID: {tx.recipientPayId}</span>
                      )}
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="text-gray-400 italic">"{tx.note}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount with USDT and INR */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-black font-mono ${
                        isDeposit ? 'text-[#0ECB81]' : 'text-gray-900'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}
                      {formatCurrency(tx.amount)} USDT
                    </div>
                    <div className="text-xs text-gray-500 font-mono font-medium">
                      ≈ ₹{inrAmount}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">
          Showing {filtered.length} transaction records • Select any entry to view official transfer receipt
        </span>
      </div>
    </div>
  );
};
