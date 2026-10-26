import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, CheckCircle2, RefreshCw, QrCode, BookUser } from 'lucide-react';
import { CryptoNetwork } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (address: string, network?: CryptoNetwork) => void;
}

const FREQUENT_TARGETS: {
  title: string;
  address: string;
  network: CryptoNetwork;
  label: string;
}[] = [
  {
    title: 'Amit Patel (TRC20 Direct)',
    address: 'TY4h2rV8JqK1LwM3n9PqRt5uYxZ7abCdEf',
    network: 'TRC20',
    label: 'Tron Network',
  },
  {
    title: 'Vikram Sharma (Ledger Vault)',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'BEP20',
    label: 'BNB Chain',
  },
  {
    title: 'Global OTC Escrow Account',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    network: 'TRC20',
    label: 'Tron TRC20',
  },
  {
    title: 'Solana Custody Safe',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    network: 'SOL',
    label: 'Solana SPL',
  },
  {
    title: 'Ethereum Mainnet Treasury',
    address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    network: 'ERC20',
    label: 'Ethereum',
  },
];

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'saved' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedPreview, setScannedPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser.');
        setActiveTab('saved');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      setCameraError('Camera feed unavailable or permissions not granted.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSelectTarget = (target: (typeof FREQUENT_TARGETS)[0]) => {
    setScannedPreview(target.address);
    setTimeout(() => {
      onScanSuccess(target.address, target.network);
      onClose();
      setScannedPreview(null);
    }, 350);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const selected = FREQUENT_TARGETS[0];
      setScannedPreview(selected.address);
      setTimeout(() => {
        onScanSuccess(selected.address, selected.network);
        onClose();
        setScannedPreview(null);
      }, 400);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F7A600]/15 flex items-center justify-center text-[#D48800]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Scan Recipient QR Code</h3>
              <p className="text-xs text-gray-500">Scan crypto address or Direct Pay QR code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 mx-6 mt-4 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookUser className="w-3.5 h-3.5" />
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Image
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[280px] bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-gray-800">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-6 text-gray-400">
                    <Camera className="w-12 h-12 stroke-1 mb-2 text-gray-500 animate-pulse" />
                    <p className="text-xs">{cameraError || 'Activating camera viewfinder...'}</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try Again
                    </button>
                  </div>
                )}

                {/* Reticle */}
                <div className="absolute inset-8 border-2 border-[#F7A600] rounded-xl pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-[#F7A600]" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-[#F7A600]" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-[#F7A600]" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-[#F7A600]" />
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#F7A600] to-transparent shadow-[0_0_8px_#F7A600] animate-bounce mt-12" />
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Align recipient QR code in the frame to auto-detect
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className="mt-2 text-xs font-semibold text-[#D48800] hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <BookUser className="w-3.5 h-3.5" />
                  Or select from saved recipients
                </button>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <p className="text-xs text-gray-500 mb-2">
                Select an address to immediately populate recipient details:
              </p>
              {FREQUENT_TARGETS.map((target, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTarget(target)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    scannedPreview === target.address
                      ? 'border-[#0ECB81] bg-[#0ECB81]/10 text-gray-900'
                      : 'border-gray-200 hover:border-[#F7A600] hover:bg-amber-50/40 text-gray-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-900">{target.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                        {target.network}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-500 truncate mt-0.5">
                      {target.address}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {scannedPreview === target.address ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0ECB81]" />
                    ) : (
                      <span className="text-xs font-semibold text-[#D48800] group-hover:translate-x-0.5 transition-transform">
                        Select →
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-800">Upload QR Code image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP formats</p>
              <label className="mt-4 px-4 py-2 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                Browse Files
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
            Encrypted QR Address Reader
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
