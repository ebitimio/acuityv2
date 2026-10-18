"use client";

import { GlassSurface } from "./glass-surface";
import { ChevronRight } from "lucide-react";

interface AccountCardProps {
  name: string;
  institution: string;
  balance: number;
  currency?: string;
  lastImported: string;
  color: string; // For the sparkline and icon
  icon: string;  // Emoji for now
}

export function AccountCard({ 
  name, 
  institution, 
  balance, 
  currency = "₦", 
  lastImported,
  color,
  icon 
}: AccountCardProps) {
  return (
    <GlassSurface 
      tier="thin" 
      radius={20} 
      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center gap-4">
        {/* Institution Icon */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-[20px] border border-white/10"
          style={{ backgroundColor: `${color}20` }} // 20% opacity of the color
        >
          {icon}
        </div>
        
        {/* Account Details */}
        <div>
          <p className="text-[15px] font-medium text-white">{name}</p>
          <p className="text-[12px] text-white/50">{institution}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Balance & Sparkline */}
        <div className="text-right flex flex-col items-end">
          <p className="text-[15px] font-semibold text-white tabular">
            {currency}{balance.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
             {/* Mini Sparkline SVG */}
             <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M0 10 Q 10 2, 20 8 T 40 4" 
                  stroke={color} 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  fill="none"
                />
             </svg>
             <span className="text-[10px] text-white/40">Imported {lastImported}</span>
          </div>
        </div>
        
        <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
      </div>
    </GlassSurface>
  );
}