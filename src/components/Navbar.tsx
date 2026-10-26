import React, { useState } from 'react';
import {
  Bell,
  QrCode,
  ShieldCheck,
  ChevronDown,
  CheckCircle,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { ExchangeLogo } from './ExchangeLogo';
import { UserProfile } from '../types';
import { copyToClipboard, formatCurrency, formatINR } from '../utils/qr';

interface NavbarProps {
  user: UserProfile;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenTransfer: () => void;
  onOpenReceive: () => void;
  onOpenScanner: () => void;
  usdtBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  onTabChange,
  onOpenTransfer,
  onOpenReceive,
  onOpenScanner,
  usdtBalance,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = async () => {
    if (await copyToClipboard(user.uid)) {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const navLinks = [
    { id: 'wallet', label: 'Assets & Overview' },
    { id: 'transfer', label: 'Withdraw / Send' },
    { id: 'markets', label: 'Markets' },
    { id: 'trade', label: 'Convert' },
    { id: 'history', label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Navigation Links */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => onTabChange('wallet')}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <ExchangeLogo size="md" showText={true} />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'text-gray-900 bg-gray-100 font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal QR Scanner button */}
          <button
            onClick={onOpenScanner}
            title="Scan QR Code"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative cursor-pointer"
          >
            <QrCode className="w-5 h-5" />
          </button>

          {/* Quick Send Button */}
          <button
            onClick={onOpenTransfer}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 text-xs font-black rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Send USDT</span>
          </button>

          {/* Quick Deposit Button */}
          <button
            onClick={onOpenReceive}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0ECB81]" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <span className="font-bold text-xs text-gray-900">Notifications</span>
                  <span className="text-[10px] text-[#0ECB81] font-semibold">Active</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <p className="font-bold text-gray-900">Account Verified</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      KYC Verified under Rahul Chaudhary. OTP security protection enabled.
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <p className="font-bold text-gray-900">Asset Balance</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Available: {formatCurrency(usdtBalance)} USDT (₹{formatINR(usdtBalance)}).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account Profile Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2 sm:pr-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#121214] text-[#F7A600] font-black text-xs flex items-center justify-center shadow-xs">
                RC
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1">
                  {user.name}
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0ECB81]" />
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  VIP {user.vipLevel} • UID: {user.uid}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-[#121214] text-[#F7A600] font-black text-base flex items-center justify-center">
                    RC
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate flex items-center gap-1">
                      {user.name}
                      <span className="text-[10px] bg-[#F7A600]/20 text-[#D48800] px-1.5 py-0.5 rounded font-black">
                        VIP 1
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="py-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Account UID</span>
                    <button
                      onClick={handleCopyUid}
                      className="flex items-center gap-1 font-mono font-bold text-gray-900 hover:text-[#D48800] cursor-pointer"
                    >
                      {user.uid}
                      {copiedUid ? <CheckCircle className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Pay ID</span>
                    <span className="font-mono font-bold text-gray-900">{user.payId}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Verification</span>
                    <span className="text-[#0ECB81] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Identity Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-gray-100">
                    <span>Total Holdings</span>
                    <span className="font-mono font-bold text-gray-900">
                      ₹{formatINR(usdtBalance)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
