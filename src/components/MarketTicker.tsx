import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, Sparkles, Search } from 'lucide-react';
import { INITIAL_MARKETS } from '../data/mockData';
import { MarketItem } from '../types';
import { formatCurrency } from '../utils/qr';

interface MarketTickerProps {
  onOpenConvert: () => void;
  onOpenTransfer: () => void;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  onOpenConvert,
  onOpenTransfer,
}) => {
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);
  const [search, setSearch] = useState('');

  // Small live tick simulation for genuine crypto exchange vibe
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((item) => {
          // slight random fluctuation
          const delta = (Math.random() - 0.49) * 0.003 * item.price;
          const newPrice = Math.max(0.01, item.price + delta);
          return {
            ...item,
            price: Number(newPrice.toFixed(item.price > 10 ? 2 : 4)),
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const filtered = markets.filter(
    (m) =>
      m.symbol.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">Markets Overview</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Spot
            </span>
          </div>
          <p className="text-xs text-gray-500">Real-time cryptocurrency quotes against USDT</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#F0B90B] focus:bg-white w-44"
            />
          </div>
          <button
            onClick={onOpenConvert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7A600] hover:bg-[#E09600] text-gray-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Instant Convert</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Pair</th>
              <th className="px-6 py-3">Last Price (USDT)</th>
              <th className="px-6 py-3">24h Change</th>
              <th className="px-6 py-3 hidden md:table-cell">24h High</th>
              <th className="px-6 py-3 hidden md:table-cell">24h Low</th>
              <th className="px-6 py-3 hidden sm:table-cell">24h Volume</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const isPositive = item.change24h >= 0;
              return (
                <tr key={item.symbol} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-800 text-xs">
                        {item.symbol.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{item.pair}</span>
                        <p className="text-[11px] text-gray-400">{item.name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-sm text-gray-900">
                    ${formatCurrency(item.price, item.price > 10 ? 2 : 4)}
                  </td>

                  <td className="px-6 py-4 font-mono">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                        isPositive
                          ? 'bg-emerald-50 text-[#0ECB81]'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}
                      {item.change24h.toFixed(2)}%
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-gray-600 hidden md:table-cell">
                    ${formatCurrency(item.high24h)}
                  </td>

                  <td className="px-6 py-4 font-mono text-gray-600 hidden md:table-cell">
                    ${formatCurrency(item.low24h)}
                  </td>

                  <td className="px-6 py-4 font-mono text-gray-500 hidden sm:table-cell">
                    {item.volume24h}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={onOpenConvert}
                      className="px-3 py-1 bg-gray-100 hover:bg-[#F0B90B] hover:text-gray-950 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
