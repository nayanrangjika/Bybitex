import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, AlertTriangle, ArrowDownLeft, ShieldCheck, DollarSign } from 'lucide-react';
import { NETWORKS, MY_DEPOSIT_ADDRESSES } from '../data/mockData';
import { CryptoNetwork, UserProfile } from '../types';
import { generateQrCode, copyToClipboard, formatINR } from '../utils/qr';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('TRC20');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showAmountInput, setShowAmountInput] = useState<boolean>(false);
  const [receiveTab, setReceiveTab] = useState<'crypto' | 'pay'>('crypto');

  const currentAddress = MY_DEPOSIT_ADDRESSES[selectedNetwork] || MY_DEPOSIT_ADDRESSES.TRC20;
  const currentNetworkConfig = NETWORKS.find((n) => n.id === selectedNetwork) || NETWORKS[0];

  useEffect(() => {
    if (!isOpen) return;
    let qrPayload = '';
    if (receiveTab === 'crypto') {
      qrPayload = customAmount
        ? `ethereum:${currentAddress}?amount=${customAmount}&network=${selectedNetwork}`
        : currentAddress;
    } else {
      qrPayload = `bybitpay:uid=${user.uid}&payid=${user.payId}&name=${encodeURIComponent(user.name)}${customAmount ? `&amount=${customAmount}` : ''}`;
    }

    generateQrCode(qrPayload, 280).then((url) => {
      setQrDataUrl(url);
    });
  }, [isOpen, selectedNetwork, customAmount, receiveTab, currentAddress, user]);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0ECB81]/15 flex items-center justify-center text-[#0ECB81]">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Deposit USDT</h3>
              <p className="text-xs text-gray-500">Account: {user.name} (UID: {user.uid})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: On-chain vs Direct Pay */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 mx-6 mt-4 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setReceiveTab('crypto')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              receiveTab === 'crypto'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Blockchain Deposit (USDT Address)
          </button>
          <button
            onClick={() => setReceiveTab('pay')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              receiveTab === 'pay'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Direct Pay ID (0 Fee)
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {receiveTab === 'crypto' ? (
            <>
              {/* Network Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Deposit Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => setSelectedNetwork(net.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedNetwork === net.id
                          ? 'border-[#F7A600] bg-amber-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{net.id}</span>
                        {selectedNetwork === net.id && (
                          <div className="w-2 h-2 rounded-full bg-[#F7A600]" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{net.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code and Address Box */}
              <div className="flex flex-col items-center bg-gray-50/80 border border-gray-200 rounded-2xl p-4">
                <div className="relative bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="USDT Deposit QR"
                      className="w-48 h-48 rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                      Generating QR...
                    </div>
                  )}
                  {/* Center emblem */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md border border-amber-300">
                    <div className="w-7 h-7 rounded-full bg-[#121214] text-[#F7A600] flex items-center justify-center font-extrabold text-[11px]">
                      ₮
                    </div>
                  </div>
                </div>

                {customAmount && (
                  <div className="mt-2 text-xs font-semibold text-gray-800 bg-amber-100/70 px-3 py-1 rounded-full font-mono">
                    Requested: {customAmount} USDT (≈ ₹{formatINR(parseFloat(customAmount) || 0)})
                  </div>
                )}

                {/* Address Box */}
                <div className="w-full mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Deposit Address ({currentNetworkConfig.name})</span>
                    <span className="text-[11px] text-[#0ECB81] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-xl">
                    <span className="font-mono text-xs text-gray-800 truncate flex-1 select-all">
                      {currentAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(currentAddress)}
                      className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        copied
                          ? 'bg-[#0ECB81] text-white'
                          : 'bg-[#F7A600] hover:bg-[#E09600] text-gray-950'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount Toggle */}
                <div className="w-full mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAmountInput(!showAmountInput)}
                      className="text-[#D48800] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      {showAmountInput ? 'Hide Amount Field' : 'Specify Amount in QR Code'}
                    </button>
                    {qrDataUrl && (
                      <a
                        href={qrDataUrl}
                        download={`USDT_${selectedNetwork}_Deposit_QR.png`}
                        className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Save QR Image
                      </a>
                    )}
                  </div>

                  {showAmountInput && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#F7A600]"
                      />
                      <span className="text-xs font-bold text-gray-600">USDT</span>
                      {customAmount && (
                        <button
                          onClick={() => setCustomAmount('')}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning reminder */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Deposit Advisory</p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    Send only USDT to this deposit address. Ensure the sender selects the{' '}
                    <strong className="underline">{currentNetworkConfig.name}</strong> network.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Direct Pay Tab */
            <div className="space-y-4">
              <div className="flex flex-col items-center bg-gray-50/80 border border-gray-200 rounded-2xl p-5 text-center">
                <div className="relative bg-white p-3 rounded-xl shadow-xs border border-gray-100 mb-3">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Direct Pay QR"
                      className="w-48 h-48 rounded-lg"
                    />
                  )}
                </div>

                <h4 className="font-bold text-gray-900 text-sm">{user.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">Verified Account Holder</p>

                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl">
                    <div className="text-left">
                      <span className="text-[10px] text-gray-400 block uppercase">Pay ID</span>
                      <span className="font-mono text-xs font-bold text-gray-900">{user.payId}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(user.payId)}
                      className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl">
                    <div className="text-left">
                      <span className="text-[10px] text-gray-400 block uppercase">Account UID</span>
                      <span className="font-mono text-xs font-bold text-gray-900">{user.uid}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(user.uid)}
                      className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Internal Pay transfers feature zero network fees and instant settlement.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
