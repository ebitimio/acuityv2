"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button, Field } from "./form";
import { addAsset } from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { useToast } from "./toast";
import { Loader2 } from "lucide-react";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "bg-orange-500" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "bg-blue-500" },
  { id: "tether", symbol: "USDT", name: "Tether", color: "bg-green-500" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "bg-purple-500" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", color: "bg-yellow-500" },
];

export function CryptoSheet({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { fmt } = useCurrency();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCoin.id}&vs_currencies=usd`)
      .then(r => r.json())
      .then(d => {
        setPrice(d[selectedCoin.id]?.usd || 0);
        setIsLoading(false);
      })
      .catch(() => {
        toast("Could not fetch live price", "err");
        setIsLoading(false);
      });
  }, [selectedCoin, isOpen]);

  const usdValue = price ? parseFloat(amount || "0") * price : 0;
  const ngnValue = usdValue * 1500;

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast("Enter an amount", "err");
    setIsSaving(true);
    try {
      await addAsset(selectedCoin.name, "asset", ngnValue, { 
        coin: selectedCoin.symbol, 
        amount: parseFloat(amount), 
        priceUSD: price 
      });
      toast("Crypto added");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast(e.message || "Failed", "err");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Add Crypto">
      <div className="space-y-4 pb-4">
        <div>
          <p className="text-[13px] font-medium text-[var(--text-3)] mb-2">Select Coin</p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {COINS.map(coin => (
              <button
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                className={`flex items-center gap-2 rounded-full px-3 py-2 border transition-colors ${
                  selectedCoin.id === coin.id ? "bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]" : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--text-2)]"
                }`}
              >
                <div className={`h-6 w-6 rounded-full ${coin.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                  {coin.symbol[0]}
                </div>
                <span className="text-[13px] font-semibold">{coin.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        <Field 
          label={`Amount in ${selectedCoin.symbol}`} 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="0.00" 
        />

        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--text-3)]">Live Price</span>
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <span className="font-semibold text-[var(--text-1)]">${price?.toLocaleString()}</span>}
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[var(--text-3)]">Value in USD</span>
            <span className="font-semibold text-[var(--text-1)]">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-[15px] pt-2 border-t border-[var(--line)]">
            <span className="font-medium text-[var(--text-1)]">Value in Naira</span>
            <span className="font-bold text-[var(--text-1)]">{fmt(ngnValue)}</span>
          </div>
        </div>

        <Button onClick={handleSave} loading={isSaving} disabled={!amount || isLoading} className="w-full h-12">
          Save Crypto
        </Button>
      </div>
    </Modal>
  );
}