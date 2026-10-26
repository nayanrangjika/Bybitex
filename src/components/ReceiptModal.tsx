import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Check, Printer, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatINR, copyToClipboard, truncateAddress } from '../utils/qr';
import { ExchangeLogo } from './ExchangeLogo';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen || !transaction) return null;

  const isDeposit = transaction.type.startsWith('receive');
  const inrValue = formatINR(transaction.amount);
  const dateFormatted = new Date(transaction.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleCopyTx = async () => {
    if (await copyToClipboard(transaction.txHash)) {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const handleCopyAddress = async (addr?: string) => {
    if (!addr) return;
    if (await copyToClipboard(addr)) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Receipt Header */}
        <div className="bg-gradient-to-b from-[#F7A600]/10 to-transparent p-6 text-center border-b border-gray-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <ExchangeLogo size="sm" showText={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transfer Confirmed</span>
          </div>

          <h2
            className={`text-3xl font-black tracking-tight font-mono ${
              isDeposit ? 'text-[#0ECB81]' : 'text-gray-900'
            }`}
          >
            {isDeposit ? '+' : '-'}
            {formatCurrency(transaction.amount)} USDT
          </h2>
          <p className="text-xs font-semibold text-gray-500 font-mono mt-1">
            ≈ ₹{inrValue} INR
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{transaction.title}</p>
        </div>

        {/* Receipt Details List */}
        <div className="p-6 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Operation Type</span>
            <span className="font-semibold text-gray-900 capitalize">
              {transaction.type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">INR Valuation</span>
            <span className="font-mono font-bold text-gray-900">
              ₹{inrValue}
            </span>
          </div>

          {transaction.network && (
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Network</span>
              <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                {transaction.network}
              </span>
            </div>
          )}

          {transaction.recipientAddress && (
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Destination Address</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-gray-800">
                  {truncateAddress(transaction.recipientAddress, 8, 6)}
                </span>
                <button
                  onClick={() => handleCopyAddress(transaction.recipientAddress)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {transaction.recipientPayId && (
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Recipient Pay ID</span>
              <span className="font-mono font-semibold text-gray-900">
                {transaction.recipientPayId}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Network Fee</span>
            <span className="font-mono text-gray-800">
              {transaction.fee > 0 ? `${transaction.fee.toFixed(2)} USDT` : '0 USDT (Free)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Timestamp</span>
            <span className="text-gray-800 font-mono">{dateFormatted}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Transaction ID (TxHash)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-gray-800">
                {truncateAddress(transaction.txHash, 6, 6)}
              </span>
              <button
                onClick={handleCopyTx}
                className="text-gray-400 hover:text-gray-700"
              >
                {copiedTx ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Confirmations</span>
            <span className="text-[#0ECB81] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 32 / 32 Validated
            </span>
          </div>

          {transaction.note && (
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Remark</span>
              <p className="text-gray-700 text-xs mt-0.5">{transaction.note}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-[#F7A600] hover:bg-[#E09600] rounded-xl text-xs font-bold text-gray-950 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
