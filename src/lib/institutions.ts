// Nigerian Banks and Financial Institutions list & fuzzy search
export interface InstitutionInfo {
  name: string;
  shortName?: string;
  category: "bank" | "fintech" | "microfinance" | "crypto" | "cash";
  aliases?: string[];
}

export const NIGERIAN_INSTITUTIONS: InstitutionInfo[] = [
  // Commercial Banks
  { name: "Access Bank", shortName: "Access", category: "bank", aliases: ["access", "diamond", "access bank plc"] },
  { name: "Citibank Nigeria", shortName: "Citibank", category: "bank", aliases: ["citi", "citibank"] },
  { name: "Ecobank Nigeria", shortName: "Ecobank", category: "bank", aliases: ["eco", "ecobank plc"] },
  { name: "Fidelity Bank", shortName: "Fidelity", category: "bank", aliases: ["fidelity"] },
  { name: "First Bank of Nigeria", shortName: "First Bank", category: "bank", aliases: ["fbn", "firstbank", "first"] },
  { name: "First City Monument Bank", shortName: "FCMB", category: "bank", aliases: ["fcmb", "monument"] },
  { name: "Globus Bank", shortName: "Globus", category: "bank", aliases: ["globus"] },
  { name: "Guaranty Trust Bank (GTBank)", shortName: "GTBank", category: "bank", aliases: ["gtb", "gtbank", "gtco", "guaranty"] },
  { name: "Heritage Bank", shortName: "Heritage", category: "bank", aliases: ["heritage", "hb"] },
  { name: "Keystone Bank", shortName: "Keystone", category: "bank", aliases: ["keystone"] },
  { name: "Optimus Bank", shortName: "Optimus", category: "bank", aliases: ["optimus"] },
  { name: "Parallex Bank", shortName: "Parallex", category: "bank", aliases: ["parallex"] },
  { name: "Polaris Bank", shortName: "Polaris", category: "bank", aliases: ["polaris", "skye"] },
  { name: "PremiumTrust Bank", shortName: "PremiumTrust", category: "bank", aliases: ["premium trust", "premiumtrust"] },
  { name: "Providus Bank", shortName: "Providus", category: "bank", aliases: ["providus"] },
  { name: "Stanbic IBTC Bank", shortName: "Stanbic IBTC", category: "bank", aliases: ["stanbic", "ibtc"] },
  { name: "Standard Chartered Bank", shortName: "Standard Chartered", category: "bank", aliases: ["sc", "standard chartered"] },
  { name: "Sterling Bank", shortName: "Sterling", category: "bank", aliases: ["sterling"] },
  { name: "SunTrust Bank", shortName: "SunTrust", category: "bank", aliases: ["suntrust"] },
  { name: "Titan Trust Bank", shortName: "Titan Trust", category: "bank", aliases: ["titan"] },
  { name: "Union Bank of Nigeria", shortName: "Union Bank", category: "bank", aliases: ["union", "ubn"] },
  { name: "United Bank for Africa (UBA)", shortName: "UBA", category: "bank", aliases: ["uba", "united bank for africa"] },
  { name: "Unity Bank", shortName: "Unity", category: "bank", aliases: ["unity"] },
  { name: "Wema Bank", shortName: "Wema", category: "bank", aliases: ["wema"] },
  { name: "Zenith Bank", shortName: "Zenith", category: "bank", aliases: ["zenith"] },

  // Fintechs & Digital Banks / MFBs
  { name: "OPay", shortName: "OPay", category: "fintech", aliases: ["opay", "paycom"] },
  { name: "PalmPay", shortName: "PalmPay", category: "fintech", aliases: ["palmpay"] },
  { name: "Moniepoint", shortName: "Moniepoint", category: "fintech", aliases: ["moniepoint", "teamapt"] },
  { name: "Kuda Bank", shortName: "Kuda", category: "fintech", aliases: ["kuda", "kuda mfb"] },
  { name: "ALAT by Wema", shortName: "ALAT", category: "fintech", aliases: ["alat"] },
  { name: "PiggyVest", shortName: "PiggyVest", category: "fintech", aliases: ["piggyvest", "piggybank"] },
  { name: "FairMoney", shortName: "FairMoney", category: "fintech", aliases: ["fairmoney"] },
  { name: "Carbon", shortName: "Carbon", category: "fintech", aliases: ["carbon", "paylater"] },
  { name: "Cowrywise", shortName: "Cowrywise", category: "fintech", aliases: ["cowrywise"] },
  { name: "VFD Microfinance Bank (VBank)", shortName: "VBank", category: "microfinance", aliases: ["vbank", "vfd"] },
  { name: "Chipper Cash", shortName: "Chipper", category: "fintech", aliases: ["chipper"] },
  { name: "Rubies Bank", shortName: "Rubies", category: "fintech", aliases: ["rubies"] },
  { name: "Gomoney", shortName: "Gomoney", category: "fintech", aliases: ["gomoney"] },
  { name: "Mintyn Bank", shortName: "Mintyn", category: "fintech", aliases: ["mintyn", "mint"] },
  { name: "Dotts Bank", shortName: "Dotts", category: "fintech", aliases: ["dotts"] },

  // Crypto / Cash
  { name: "Binance", shortName: "Binance", category: "crypto", aliases: ["binance"] },
  { name: "Bybit", shortName: "Bybit", category: "crypto", aliases: ["bybit"] },
  { name: "Luno", shortName: "Luno", category: "crypto", aliases: ["luno"] },
  { name: "Quidax", shortName: "Quidax", category: "crypto", aliases: ["quidax"] },
  { name: "Roqqu", shortName: "Roqqu", category: "crypto", aliases: ["roqqu"] },
  { name: "Physical Cash / Wallet", shortName: "Cash", category: "cash", aliases: ["cash", "wallet", "pocket"] },
];

export const POPULAR_BANKS: string[] = [
  "GTBank",
  "Access Bank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Kuda Bank",
  "OPay",
  "PalmPay",
  "Moniepoint",
  "FCMB",
  "Stanbic IBTC",
];

export function searchInstitutions(query: string, limit = 5): InstitutionInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return NIGERIAN_INSTITUTIONS.slice(0, limit);
  }

  // Exact starts-with first, then alias starts-with, then contains
  const exactStarts: InstitutionInfo[] = [];
  const aliasStarts: InstitutionInfo[] = [];
  const contains: InstitutionInfo[] = [];

  for (const inst of NIGERIAN_INSTITUTIONS) {
    const nameLower = inst.name.toLowerCase();
    const shortLower = inst.shortName?.toLowerCase() ?? "";

    if (nameLower.startsWith(q) || shortLower.startsWith(q)) {
      exactStarts.push(inst);
    } else if (inst.aliases?.some((a) => a.startsWith(q))) {
      aliasStarts.push(inst);
    } else if (
      nameLower.includes(q) ||
      shortLower.includes(q) ||
      inst.aliases?.some((a) => a.includes(q))
    ) {
      contains.push(inst);
    }
  }

  return [...exactStarts, ...aliasStarts, ...contains].slice(0, limit);
}
