import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Info,
  ChevronDown,
  RotateCcw,
  Smartphone,
  Mail,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NETWORKS, INITIAL_CONTACTS } from '../data/mockData';
import { CryptoNetwork, UserProfile, Contact } from '../types';
import { formatCurrency, formatINR, generateTxHash, USDT_TO_INR_RATE } from '../utils/qr';
import { QRScannerModal } from './QRScannerModal';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  usdtBalance: number;
  onTransferComplete: (transferData: {
    amount: number;
    fee: number;
    recipientAddress?: string;
    recipientPayId?: string;
    recipientName?: string;
    network?: CryptoNetwork;
    txHash: string;
    type: 'send_crypto' | 'send_pay';
    note?: string;
  }) => void;
}

type TransferMethod = 'crypto_address' | 'exchange_pay';

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  user,
  usdtBalance,
  onTransferComplete,
}) => {
  const [method, setMethod] = useState<TransferMethod>('crypto_address');
  const [address, setAddress] = useState<string>('');
  const [network, setNetwork] = useState<CryptoNetwork>('TRC20');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [payRecipient, setPayRecipient] = useState<string>('');
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [showAddressBook, setShowAddressBook] = useState<boolean>(false);

  // Verification step state
  const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
  const [otpCode, setOtpCode] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [otpSentNotification, setOtpSentNotification] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const REQUIRED_OTP = '979922';

  const selectedNetworkConfig = NETWORKS.find((n) => n.id === network) || NETWORKS[0];
  const fee = method === 'crypto_address' ? selectedNetworkConfig.fee : 0;
  const numAmount = parseFloat(amount) || 0;
  const receiveAmount = Math.max(0, numAmount - fee);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleScanSuccess = (scannedAddress: string, detectedNetwork?: CryptoNetwork) => {
    setAddress(scannedAddress);
    if (detectedNetwork) {
      setNetwork(detectedNetwork);
    } else {
      if (scannedAddress.startsWith('T')) setNetwork('TRC20');
      else if (scannedAddress.startsWith('0x')) setNetwork('BEP20');
      else if (scannedAddress.length >= 43) setNetwork('SOL');
    }
    setErrorMsg(null);
  };

  const handleSelectContact = (contact: Contact) => {
    if (contact.type === 'binance_user' && method === 'exchange_pay') {
      setPayRecipient(contact.payId || contact.address);
    } else {
      setAddress(contact.address);
      setNetwork(contact.network);
    }
    setShowAddressBook(false);
    setErrorMsg(null);
  };

  const handleSetMax = () => {
    setAmount(usdtBalance > 0 ? usdtBalance.toString() : '0');
  };

  const handleValidateAndProceed = () => {
    setErrorMsg(null);

    if (method === 'crypto_address') {
      if (!address.trim()) {
        setErrorMsg('Please enter or scan a valid USDT recipient address.');
        return;
      }
      if (address.length < 15) {
        setErrorMsg('Invalid crypto address format. Please check the recipient address.');
        return;
      }
    } else {
      if (!payRecipient.trim()) {
        setErrorMsg('Please enter a Pay ID, Account UID, or Email address.');
        return;
      }
    }

    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount.');
      return;
    }

    if (numAmount > usdtBalance) {
      setErrorMsg(`Insufficient balance. Available: ${formatCurrency(usdtBalance)} USDT (₹${formatINR(usdtBalance)})`);
      return;
    }

    if (method === 'crypto_address' && numAmount < selectedNetworkConfig.minWithdrawal) {
      setErrorMsg(`Minimum withdrawal for ${selectedNetworkConfig.name} is ${selectedNetworkConfig.minWithdrawal} USDT.`);
      return;
    }

    // Move to OTP Security Verification
    setStep('verify');
    setOtpCode('');
    setResendTimer(60);
    setOtpSentNotification(`OTP code sent to +91 •••••• 4821 and ${user.email}`);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setOtpSentNotification(`New verification OTP code sent to your registered phone and email.`);
    setErrorMsg(null);
  };

  const handleConfirmTransfer = () => {
    setErrorMsg(null);

    // Strict validation for required OTP: 979922
    if (!otpCode || otpCode.trim() !== REQUIRED_OTP) {
      setErrorMsg('Invalid OTP code. Please enter the correct 6-digit verification code.');
      return;
    }

    const txHash = generateTxHash(network);
    setLastTxHash(txHash);

    onTransferComplete({
      amount: numAmount,
      fee: fee,
      recipientAddress: method === 'crypto_address' ? address : undefined,
      recipientPayId: method === 'exchange_pay' ? payRecipient : undefined,
      recipientName: method === 'exchange_pay' ? 'Verified Account' : undefined,
      network: method === 'crypto_address' ? network : undefined,
      txHash,
      type: method === 'crypto_address' ? 'send_crypto' : 'send_pay',
      note: note || undefined,
    });

    setStep('success');

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F7A600', '#121214', '#0ECB81'],
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResetForm = () => {
    setAddress('');
    setAmount('');
    setNote('');
    setPayRecipient('');
    setStep('input');
    setErrorMsg(null);
    setOtpCode('');
  };

  const handleCloseAll = () => {
    handleResetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F7A600]/15 flex items-center justify-center text-[#D48800]">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {step === 'verify'
                    ? 'Security Verification (OTP)'
                    : step === 'success'
                    ? 'Transfer Order Submitted'
                    : 'Withdraw / Transfer USDT'}
                </h3>
                <p className="text-xs text-gray-500">
                  Account: <strong className="text-gray-800">{user.name}</strong> • Available:{' '}
                  <span className="font-mono font-semibold text-[#0ECB81]">
                    {formatCurrency(usdtBalance)} USDT
                  </span>{' '}
                  <span className="text-gray-400 font-mono">(₹{formatINR(usdtBalance)})</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseAll}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            {step === 'input' && (
              <div className="space-y-4">
                {/* Method selector tabs */}
                <div className="flex bg-gray-100/90 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => {
                      setMethod('crypto_address');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      method === 'crypto_address'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>On-Chain Address / QR</span>
                  </button>
                  <button
                    onClick={() => {
                      setMethod('exchange_pay');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      method === 'exchange_pay'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>Direct Pay (0 Fee)</span>
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {method === 'crypto_address' ? (
                  <>
                    {/* Recipient Address & QR Scan */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                        <label>Recipient USDT Address</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAddressBook(!showAddressBook)}
                            className="text-[#D48800] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Users className="w-3.5 h-3.5" /> Address Book
                          </button>
                        </div>
                      </div>

                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Paste or scan recipient USDT address"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            setErrorMsg(null);
                          }}
                          className="w-full pl-3 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-[#F7A600] focus:bg-white transition-colors"
                        />
                        <div className="absolute right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleOpenScanner}
                            title="Scan QR Code"
                            className="px-2.5 py-1.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan</span>
                          </button>
                        </div>
                      </div>

                      {/* Address Book Dropdown if toggled */}
                      {showAddressBook && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                          <p className="text-[11px] font-semibold text-gray-500 px-2 py-0.5">
                            Saved Beneficiaries:
                          </p>
                          {INITIAL_CONTACTS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectContact(c)}
                              className="w-full text-left p-2 rounded-lg hover:bg-white flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-gray-900">{c.name}</span>
                                <span className="text-[10px] text-gray-400 ml-2 font-mono">
                                  {c.network}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#D48800] font-medium">Select →</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Network Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Withdrawal Network
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {NETWORKS.map((net) => {
                          const isSelected = network === net.id;
                          return (
                            <button
                              key={net.id}
                              type="button"
                              onClick={() => setNetwork(net.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-[#F7A600] bg-amber-50/50 shadow-xs'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900">{net.name}</span>
                                <span className="text-[10px] font-semibold text-gray-500">
                                  Fee: {net.fee} USDT
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                                <span>{net.estimatedTime}</span>
                                <span>Min: {net.minWithdrawal} USDT</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        Selected: <strong className="text-gray-800">{selectedNetworkConfig.name}</strong> •{' '}
                        {selectedNetworkConfig.description}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Direct Pay Method */
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                        <label>Recipient Pay ID / UID / Email</label>
                        <button
                          type="button"
                          onClick={handleOpenScanner}
                          className="text-[#D48800] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Scan Pay QR
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 381 092 144 or user@exchange.com"
                        value={payRecipient}
                        onChange={(e) => {
                          setPayRecipient(e.target.value);
                          setErrorMsg(null);
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-[#F7A600] focus:bg-white"
                      />
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-[#D48800] shrink-0" />
                      <span>Zero network fee instant transfer to any verified user account.</span>
                    </div>

                    {/* Quick contacts */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-gray-500">Recent Contacts:</p>
                      <div className="flex flex-wrap gap-2">
                        {INITIAL_CONTACTS.filter((c) => c.type === 'binance_user').map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setPayRecipient(c.payId || '')}
                            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] text-gray-400">({c.payId})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                    <label>Transfer Amount</label>
                    <div className="text-gray-500 font-normal">
                      Available:{' '}
                      <span className="font-mono font-bold text-gray-900">
                        {formatCurrency(usdtBalance)} USDT
                      </span>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="w-full pl-3 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 placeholder:text-gray-300 focus:outline-hidden focus:border-[#F7A600] focus:bg-white"
                    />
                    <div className="absolute right-2 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-500">USDT</span>
                      <button
                        type="button"
                        onClick={handleSetMax}
                        className="px-2 py-0.5 text-xs font-bold bg-[#F7A600]/20 text-[#D48800] hover:bg-[#F7A600]/30 rounded-md transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {numAmount > 0 && (
                    <div className="mt-1 text-xs text-gray-500 font-mono flex items-center gap-1">
                      <span>Equivalent:</span>
                      <strong className="text-gray-900 font-bold">₹{formatINR(numAmount)} INR</strong>
                      <span className="text-[10px] text-gray-400">(Rate: ₹{USDT_TO_INR_RATE}/USDT)</span>
                    </div>
                  )}
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Transfer Note / Remark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. USDT settlement, Invoice #9021"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-[#F7A600] focus:bg-white"
                  />
                </div>

                {/* Fee & Calculation Summary */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Network Fee</span>
                    <span className="font-mono text-gray-800">
                      {fee === 0 ? '0 USDT (Free)' : `${fee.toFixed(2)} USDT`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Estimated Arrival</span>
                    <span className="text-gray-800">
                      {method === 'exchange_pay' ? 'Instant' : selectedNetworkConfig.estimatedTime}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200 flex justify-between items-baseline font-bold text-sm">
                    <span className="text-gray-800">Recipient Receives</span>
                    <div className="text-right">
                      <span className="font-mono text-[#0ECB81] block">
                        {formatCurrency(receiveAmount)} USDT
                      </span>
                      <span className="text-[11px] font-mono text-gray-500 font-normal">
                        ≈ ₹{formatINR(receiveAmount)} INR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Security Verification with OTP */}
            {step === 'verify' && (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                  <p className="text-xs text-gray-700 font-bold mb-2">Withdrawal Order Confirmation</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Sender Account:</span>
                      <strong className="text-gray-900">{user.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipient:</span>
                      <strong className="font-mono text-gray-900 truncate max-w-[200px]">
                        {method === 'crypto_address' ? address : payRecipient}
                      </strong>
                    </div>
                    {method === 'crypto_address' && (
                      <div className="flex justify-between">
                        <span>Network:</span>
                        <strong className="text-gray-900">{selectedNetworkConfig.name}</strong>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-200 text-sm font-bold text-gray-900">
                      <span>Total Debit:</span>
                      <span className="font-mono">
                        {formatCurrency(numAmount)} USDT (₹{formatINR(numAmount)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* OTP Input Section */}
                <div className="space-y-3 p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F7A600]/20 flex items-center justify-center text-[#D48800]">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">SMS / Email OTP Verification</h4>
                      <p className="text-[11px] text-gray-500">
                        Enter the 6-digit verification code sent to your registered mobile and email.
                      </p>
                    </div>
                  </div>

                  {otpSentNotification && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{otpSentNotification}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-800">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setOtpCode(val);
                        setErrorMsg(null);
                      }}
                      className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono py-3 bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#F7A600] text-gray-900 shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-500">Didn't receive the code?</span>
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleResendOtp}
                      className={`font-semibold ${
                        resendTimer > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-[#D48800] hover:underline cursor-pointer'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend code (${resendTimer}s)` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Success Screen */}
            {step === 'success' && (
              <div className="py-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-900">Transfer Submitted Successfully</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Your withdrawal transaction has been verified with OTP and broadcasted to the network.
                  </p>
                </div>

                <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Sent:</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {formatCurrency(numAmount)} USDT (₹{formatINR(numAmount)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network Fee:</span>
                    <span className="font-mono text-gray-800">
                      {fee === 0 ? '0 USDT' : `${fee.toFixed(2)} USDT`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipient:</span>
                    <span className="font-mono text-gray-800 truncate max-w-[200px]">
                      {method === 'crypto_address' ? address : payRecipient}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TxID:</span>
                    <span className="font-mono text-gray-800 truncate max-w-[180px]">
                      {lastTxHash}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold text-gray-900">
                    <span>Remaining Balance:</span>
                    <span className="font-mono text-[#0ECB81]">
                      {formatCurrency(usdtBalance)} USDT (₹{formatINR(usdtBalance)})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            {step === 'input' && (
              <>
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleValidateAndProceed}
                  className="px-6 py-2.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Continue to Verification
                </button>
              </>
            )}

            {step === 'verify' && (
              <>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="px-6 py-2.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Submit Withdrawal
                </button>
              </>
            )}

            {step === 'success' && (
              <div className="w-full flex gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Another Transfer
                </button>
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="flex-1 py-2.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};
