export type BrandKind = "bank" | "app";

export interface Brand {
  id: string;
  name: string;
  kind: BrandKind;
  aliases: string[]; // how it shows up in statements, Mono names, user typing
  logo: string; // /logos/...
  bg?: string; // tile background; default white
}

export const BRANDS: Brand[] = [
  // =====================
  // NIGERIAN BANKS & FINTECHS
  // =====================
  {
    id: "kuda",
    name: "Kuda Bank",
    kind: "bank",
    aliases: ["kuda", "kuda mfb", "kudabank", "kuda microfinance"],
    logo: "/logos/banks/kuda.svg",
    bg: "#FFFFFF",
  },
  {
    id: "gtbank",
    name: "GTBank",
    kind: "bank",
    aliases: ["gtb", "gtbank", "gtco", "guaranty trust", "guaranty trust bank", "gt bank"],
    logo: "/logos/banks/gtbank.svg",
    bg: "#FFFFFF",
  },
  {
    id: "zenith",
    name: "Zenith Bank",
    kind: "bank",
    aliases: ["zenith", "zenith bank", "zenithbank", "zenith mobile"],
    logo: "/logos/banks/zenith.svg",
    bg: "#FFFFFF",
  },
  {
    id: "access",
    name: "Access Bank",
    kind: "bank",
    aliases: ["access", "access bank", "accessbank", "diamond bank", "access diamond"],
    logo: "/logos/banks/access.svg",
    bg: "#FFFFFF",
  },
  {
    id: "opay",
    name: "OPay",
    kind: "bank",
    aliases: ["opay", "opay digital", "paycom", "paycom opay"],
    logo: "/logos/banks/opay.svg",
    bg: "#FFFFFF",
  },
  {
    id: "palmpay",
    name: "PalmPay",
    kind: "bank",
    aliases: ["palmpay", "palm pay", "palmpay limited"],
    logo: "/logos/banks/palmpay.svg",
    bg: "#FFFFFF",
  },
  {
    id: "firstbank",
    name: "First Bank",
    kind: "bank",
    aliases: ["first bank", "firstbank", "fbn", "first bank of nigeria", "first bank plc"],
    logo: "/logos/banks/firstbank.svg",
    bg: "#FFFFFF",
  },
  {
    id: "uba",
    name: "UBA",
    kind: "bank",
    aliases: ["uba", "united bank for africa", "ubagroup"],
    logo: "/logos/banks/uba.svg",
    bg: "#FFFFFF",
  },
  {
    id: "moniepoint",
    name: "Moniepoint",
    kind: "bank",
    aliases: ["moniepoint", "teamapt", "moniepoint mfb"],
    logo: "/logos/banks/moniepoint.svg",
    bg: "#FFFFFF",
  },
  {
    id: "stanbic",
    name: "Stanbic IBTC",
    kind: "bank",
    aliases: ["stanbic", "stanbic ibtc", "stanbic bank", "ibtc"],
    logo: "/logos/banks/stanbic.svg",
    bg: "#FFFFFF",
  },
  {
    id: "fcmb",
    name: "FCMB",
    kind: "bank",
    aliases: ["fcmb", "first city monument bank", "monument bank"],
    logo: "/logos/banks/fcmb.svg",
    bg: "#FFFFFF",
  },
  {
    id: "sterling",
    name: "Sterling Bank",
    kind: "bank",
    aliases: ["sterling", "sterling bank", "sterling alternative", "onebank"],
    logo: "/logos/banks/sterling.svg",
    bg: "#FFFFFF",
  },
  {
    id: "wema",
    name: "Wema Bank",
    kind: "bank",
    aliases: ["wema", "wema bank", "alat", "alat by wema"],
    logo: "/logos/banks/wema.svg",
    bg: "#FFFFFF",
  },
  {
    id: "fidelity",
    name: "Fidelity Bank",
    kind: "bank",
    aliases: ["fidelity", "fidelity bank", "fidelity plc"],
    logo: "/logos/banks/fidelity.svg",
    bg: "#FFFFFF",
  },
  {
    id: "union",
    name: "Union Bank",
    kind: "bank",
    aliases: ["union bank", "union", "ubn", "union bank of nigeria"],
    logo: "/logos/banks/union.svg",
    bg: "#FFFFFF",
  },
  {
    id: "polaris",
    name: "Polaris Bank",
    kind: "bank",
    aliases: ["polaris", "polaris bank", "skye bank"],
    logo: "/logos/banks/polaris.svg",
    bg: "#FFFFFF",
  },
  {
    id: "providus",
    name: "Providus Bank",
    kind: "bank",
    aliases: ["providus", "providus bank", "providusbank"],
    logo: "/logos/banks/providus.svg",
    bg: "#FFFFFF",
  },
  {
    id: "ecobank",
    name: "Ecobank",
    kind: "bank",
    aliases: ["ecobank", "ecobank nigeria", "eco bank"],
    logo: "/logos/banks/ecobank.svg",
    bg: "#FFFFFF",
  },
  {
    id: "vfd",
    name: "VBank",
    kind: "bank",
    aliases: ["vbank", "vfd", "vfd mfb", "vfd microfinance bank"],
    logo: "/logos/banks/vfd.svg",
    bg: "#FFFFFF",
  },
  {
    id: "carbon",
    name: "Carbon",
    kind: "bank",
    aliases: ["carbon", "paylater", "carbon finance"],
    logo: "/logos/banks/carbon.svg",
    bg: "#FFFFFF",
  },
  {
    id: "fairmoney",
    name: "FairMoney",
    kind: "bank",
    aliases: ["fairmoney", "fair money", "fairmoney mfb"],
    logo: "/logos/banks/fairmoney.svg",
    bg: "#FFFFFF",
  },
  {
    id: "piggyvest",
    name: "PiggyVest",
    kind: "bank",
    aliases: ["piggyvest", "piggy vest", "piggybank"],
    logo: "/logos/banks/piggyvest.svg",
    bg: "#FFFFFF",
  },
  {
    id: "cowrywise",
    name: "Cowrywise",
    kind: "bank",
    aliases: ["cowrywise", "cowry wise"],
    logo: "/logos/banks/cowrywise.svg",
    bg: "#FFFFFF",
  },

  // =====================
  // APPS, SUBSCRIPTIONS & SERVICES
  // =====================
  {
    id: "netflix",
    name: "Netflix",
    kind: "app",
    aliases: ["netflix", "nflx", "netflix com"],
    logo: "/logos/apps/netflix.svg",
    bg: "#FFFFFF",
  },
  {
    id: "spotify",
    name: "Spotify",
    kind: "app",
    aliases: ["spotify", "spotify music", "spotify ab"],
    logo: "/logos/apps/spotify.svg",
    bg: "#FFFFFF",
  },
  {
    id: "disney",
    name: "Disney+",
    kind: "app",
    aliases: ["disney plus", "disneyplus", "disney", "walt disney"],
    logo: "/logos/apps/disney.svg",
    bg: "#FFFFFF",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    kind: "app",
    aliases: ["chatgpt", "openai", "chat gpt", "openai chatgpt"],
    logo: "/logos/apps/chatgpt.svg",
    bg: "#FFFFFF",
  },
  {
    id: "apple",
    name: "Apple",
    kind: "app",
    aliases: ["apple", "apple com", "apple music", "itunes", "icloud", "app store"],
    logo: "/logos/apps/apple.svg",
    bg: "#FFFFFF",
  },
  {
    id: "youtube",
    name: "YouTube",
    kind: "app",
    aliases: ["youtube", "youtube premium", "yt premium", "google youtube"],
    logo: "/logos/apps/youtube.svg",
    bg: "#FFFFFF",
  },
  {
    id: "prime",
    name: "Amazon Prime",
    kind: "app",
    aliases: ["amazon prime", "prime video", "amazon", "prime"],
    logo: "/logos/apps/prime.svg",
    bg: "#FFFFFF",
  },
  {
    id: "canva",
    name: "Canva",
    kind: "app",
    aliases: ["canva", "canva pro"],
    logo: "/logos/apps/canva.svg",
    bg: "#FFFFFF",
  },
  {
    id: "google",
    name: "Google",
    kind: "app",
    aliases: ["google", "google one", "google play", "google storage"],
    logo: "/logos/apps/google.svg",
    bg: "#FFFFFF",
  },
  {
    id: "playstation",
    name: "PlayStation",
    kind: "app",
    aliases: ["playstation", "psn", "sony playstation", "playstation plus"],
    logo: "/logos/apps/playstation.svg",
    bg: "#FFFFFF",
  },
  {
    id: "steam",
    name: "Steam",
    kind: "app",
    aliases: ["steam", "valvesoftware", "valve steam"],
    logo: "/logos/apps/steam.svg",
    bg: "#FFFFFF",
  },
  {
    id: "github",
    name: "GitHub",
    kind: "app",
    aliases: ["github", "github inc", "github copilot"],
    logo: "/logos/apps/github.svg",
    bg: "#FFFFFF",
  },
  {
    id: "figma",
    name: "Figma",
    kind: "app",
    aliases: ["figma", "figma pro"],
    logo: "/logos/apps/figma.svg",
    bg: "#FFFFFF",
  },
  {
    id: "showmax",
    name: "Showmax",
    kind: "app",
    aliases: ["showmax", "show max"],
    logo: "/logos/apps/showmax.svg",
    bg: "#FFFFFF",
  },
  {
    id: "bolt",
    name: "Bolt",
    kind: "app",
    aliases: ["bolt", "bolt eu", "taxify"],
    logo: "/logos/apps/bolt.svg",
    bg: "#FFFFFF",
  },
  {
    id: "uber",
    name: "Uber",
    kind: "app",
    aliases: ["uber", "uber bv", "uber trip", "uber eats"],
    logo: "/logos/apps/uber.svg",
    bg: "#FFFFFF",
  },
  {
    id: "chowdeck",
    name: "Chowdeck",
    kind: "app",
    aliases: ["chowdeck", "chow deck"],
    logo: "/logos/apps/chowdeck.svg",
    bg: "#FFFFFF",
  },
  {
    id: "glovo",
    name: "Glovo",
    kind: "app",
    aliases: ["glovo", "glovoapp"],
    logo: "/logos/apps/glovo.svg",
    bg: "#FFFFFF",
  },

  // =====================
  // NIGERIAN UTILITIES & TELCOS
  // =====================
  {
    id: "mtn",
    name: "MTN",
    kind: "app",
    aliases: ["mtn", "mtn nigeria", "mtn airtime", "mtn data"],
    logo: "/logos/apps/mtn.svg",
    bg: "#FFFFFF",
  },
  {
    id: "airtel",
    name: "Airtel",
    kind: "app",
    aliases: ["airtel", "airtel nigeria", "airtel airtime", "airtel data"],
    logo: "/logos/apps/airtel.svg",
    bg: "#FFFFFF",
  },
  {
    id: "glo",
    name: "Glo",
    kind: "app",
    aliases: ["glo", "globacom", "glo mobile", "glo airtime"],
    logo: "/logos/apps/glo.svg",
    bg: "#FFFFFF",
  },
  {
    id: "9mobile",
    name: "9mobile",
    kind: "app",
    aliases: ["9mobile", "etisalat", "nine mobile"],
    logo: "/logos/apps/9mobile.svg",
    bg: "#FFFFFF",
  },
  {
    id: "dstv",
    name: "DStv",
    kind: "app",
    aliases: ["dstv", "multichoice dstv", "multichoice"],
    logo: "/logos/apps/dstv.svg",
    bg: "#FFFFFF",
  },
  {
    id: "gotv",
    name: "GOtv",
    kind: "app",
    aliases: ["gotv", "multichoice gotv"],
    logo: "/logos/apps/gotv.svg",
    bg: "#FFFFFF",
  },
  {
    id: "startimes",
    name: "StarTimes",
    kind: "app",
    aliases: ["startimes", "star times"],
    logo: "/logos/apps/startimes.svg",
    bg: "#FFFFFF",
  },
  {
    id: "ikedc",
    name: "Ikeja Electric",
    kind: "app",
    aliases: ["ikedc", "ikeja electric", "ikeja electricity"],
    logo: "/logos/apps/ikedc.svg",
    bg: "#FFFFFF",
  },
  {
    id: "ekedc",
    name: "Eko Electricity",
    kind: "app",
    aliases: ["ekedc", "eko electric", "eko electricity"],
    logo: "/logos/apps/ekedc.svg",
    bg: "#FFFFFF",
  },
  {
    id: "aedc",
    name: "Abuja Electricity",
    kind: "app",
    aliases: ["aedc", "abuja electric", "abuja electricity"],
    logo: "/logos/apps/aedc.svg",
    bg: "#FFFFFF",
  },
];

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Longest alias first so "disney plus" wins over "disney"
const INDEX = BRANDS.flatMap((b) =>
  [b.name, ...b.aliases].map((a) => ({ key: norm(a), brand: b }))
).sort((a, b) => b.key.length - a.key.length);

export function findBrand(text?: string | null, kind?: BrandKind): Brand | null {
  if (!text) return null;
  const t = ` ${norm(text)} `;
  const hit = INDEX.find(
    (e) => (!kind || e.brand.kind === kind) && t.includes(` ${e.key} `)
  );
  return hit?.brand ?? null;
}
