import React, { useState } from 'react';
import { X, ArrowRightLeft, Repeat, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatINR } from '../utils/qr';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdtBalance: number;
  onConvertSuccess: (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number) => void;
}

const RATES: Record<string, number> = {
  BTC: 93420.50,
  ETH: 3380.25,
  BNB: 684.10,
  SOL: 194.80,
};

export const ConvertModal: React.FC<ConvertModalProps> = ({
  isOpen,
  onClose,
  usdtBalance,
  onConvertSuccess,
}) => {
  const [fromAsset, setFromAsset] = useState<'USDT' | 'BTC' | 'ETH' | 'BNB'>('USDT');
  const [toAsset, setToAsset] = useState<'USDT' | 'BTC' | 'ETH' | 'BNB'>('BTC');
  const [amount, setAmount] = useState<string>('500');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const targetRate = RATES[toAsset] || RATES.BTC;

  let convertedAmount = 0;
  if (fromAsset === 'USDT') {
    convertedAmount = numAmount / targetRate;
  } else {
    const fromRate = RATES[fromAsset] || 1;
    convertedAmount = numAmount * fromRate;
  }

  const handleSwapAssets = () => {
    const prevFrom = fromAsset;
    setFromAsset(toAsset);
    setToAsset(prevFrom);
    setAmount('1');
  };

  const handleSetMax = () => {
    if (fromAsset === 'USDT') {
      setAmount(usdtBalance.toString());
    } else {
      setAmount('1');
    }
  };

  const handleExecuteConvert = () => {
    setErrorMsg(null);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid conversion amount.');
      return;
    }
    if (fromAsset === 'USDT' && numAmount > usdtBalance) {
      setErrorMsg(`Insufficient USDT. Available: ${formatCurrency(usdtBalance)} USDT (₹${formatINR(usdtBalance)})`);
      return;
    }

    onConvertSuccess(fromAsset, toAsset, numAmount, convertedAmount);
    setIsSuccess(true);
    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#F7A600', '#0ECB81'],
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F7A600]/15 flex items-center justify-center text-[#D48800]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Instant Convert</h3>
              <p className="text-xs text-gray-500">Zero fees • Guaranteed quote</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Conversion Completed</h4>
              <p className="text-xs text-gray-500">
                You swapped <strong className="text-gray-800">{formatCurrency(numAmount)} {fromAsset}</strong> for{' '}
                <strong className="text-[#0ECB81] font-mono">
                  {convertedAmount.toFixed(toAsset === 'USDT' ? 2 : 6)} {toAsset}
                </strong>
              </p>
              <button
                onClick={handleClose}
                className="w-full mt-4 py-2.5 bg-[#F7A600] hover:bg-[#E09600] rounded-xl text-xs font-bold text-gray-950 transition-colors cursor-pointer"
              >
                Return to Assets
              </button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* From Box */}
              <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>From</span>
                  <span>
                    Balance: <strong className="text-gray-800 font-mono">{formatCurrency(usdtBalance)} USDT</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-lg font-bold font-mono text-gray-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSetMax}
                    className="px-2 py-1 text-[11px] font-bold text-[#D48800] hover:bg-amber-100 rounded-md cursor-pointer"
                  >
                    MAX
                  </button>
                  <select
                    value={fromAsset}
                    onChange={(e) => setFromAsset(e.target.value as any)}
                    className="bg-white border border-gray-200 font-bold text-xs py-1.5 px-2.5 rounded-xl text-gray-900 focus:outline-hidden"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                  </select>
                </div>
                {fromAsset === 'USDT' && numAmount > 0 && (
                  <p className="text-[11px] text-gray-400 font-mono mt-1">
                    ≈ ₹{formatINR(numAmount)} INR
                  </p>
                )}
              </div>

              {/* Invert Button */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwapAssets}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-600 hover:text-[#D48800] hover:border-[#F7A600] transition-colors cursor-pointer"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* To Box */}
              <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>To (Estimated)</span>
                  <span className="text-[#0ECB81] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 0% Fee
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-lg font-bold font-mono text-gray-900 truncate">
                    {convertedAmount.toFixed(toAsset === 'USDT' ? 2 : 6)}
                  </span>
                  <select
                    value={toAsset}
                    onChange={(e) => setToAsset(e.target.value as any)}
                    className="bg-white border border-gray-200 font-bold text-xs py-1.5 px-2.5 rounded-xl text-gray-900 focus:outline-hidden"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                    <option value="SOL">SOL</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              {/* Conversion Rate Quote */}
              <div className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <span>Indicative Rate</span>
                <span className="font-mono font-semibold">
                  1 {toAsset} ≈ {formatCurrency(targetRate)} USDT
                </span>
              </div>

              <button
                onClick={handleExecuteConvert}
                className="w-full py-3 bg-[#F7A600] hover:bg-[#E09600] rounded-xl text-sm font-black text-gray-950 transition-colors shadow-2xs cursor-pointer"
              >
                Convert Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
