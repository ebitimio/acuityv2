"use client";

import React from "react";

interface MetallicGyroscopeProps {
  className?: string;
}

/**
 * 3D Metallic Gyroscope Component (Glitch-Free Vector Edition)
 * 
 * Features:
 * - 100% Pure SVG Vector Geometry for the Acuity "A." Monogram (eliminates Safari 3D text-clip bugs)
 * - Volumetric heavy chrome gimbal rings with realistic specular lighting
 * - Dual tilted orbital wire tracks with gleaming silver photon satellite nodes
 * - Suspended 3D minted titanium coin with embossed chrome "A" and signature glowing ruby dot "."
 * - Compact, proportional dimensions designed to fit mobile viewports without scrolling
 */
export function MetallicGyroscope({ className = "" }: MetallicGyroscopeProps) {
  return (
    <div className={`relative w-full h-[180px] sm:h-[195px] flex items-center justify-center select-none overflow-visible ${className}`}>
      {/* Scoped GPU-Accelerated 3D Precession Keyframes */}
      <style>{`
        @keyframes gyro-h-precess {
          0% {
            transform: rotateX(66deg) rotateY(16deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(66deg) rotateY(16deg) rotateZ(360deg);
          }
        }

        @keyframes gyro-v-precess {
          0% {
            transform: rotateX(18deg) rotateY(72deg) rotateZ(360deg);
          }
          100% {
            transform: rotateX(18deg) rotateY(72deg) rotateZ(0deg);
          }
        }

        @keyframes gyro-orbit-wire1 {
          0% {
            transform: rotateX(46deg) rotateY(-36deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(46deg) rotateY(-36deg) rotateZ(360deg);
          }
        }

        @keyframes gyro-orbit-wire2 {
          0% {
            transform: rotateX(74deg) rotateY(-16deg) rotateZ(360deg);
          }
          100% {
            transform: rotateX(74deg) rotateY(-16deg) rotateZ(0deg);
          }
        }

        @keyframes coin-hover-sway {
          0%, 100% {
            transform: translateZ(8px) rotateX(12deg) rotateY(-15deg);
          }
          50% {
            transform: translateZ(-6px) rotateX(-8deg) rotateY(14deg);
          }
        }

        @keyframes chrome-beam-sweep {
          0%, 25% {
            transform: translateX(-150%) rotate(30deg);
            opacity: 0;
          }
          40% {
            opacity: 0.85;
          }
          55%, 100% {
            transform: translateX(250%) rotate(30deg);
            opacity: 0;
          }
        }

        .gyro-stage {
          transform-style: preserve-3d;
          perspective: 1000px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .preserve-3d-node {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>

      {/* Atmospheric Ambient Glows */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full pointer-events-none blur-[55px]"
        style={{
          background: "radial-gradient(circle, rgba(222,49,33,0.22) 0%, rgba(152,197,185,0.1) 45%, transparent 75%)",
        }}
      />

      {/* Floor Contact Shadow */}
      <div
        className="absolute bottom-1 w-44 h-5 rounded-full pointer-events-none blur-sm"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)",
        }}
      />

      {/* 3D Perspective Stage */}
      <div className="relative w-[190px] h-[190px] flex items-center justify-center gyro-stage">

        {/* ============================================================== */}
        {/* 1. THICK HORIZONTAL VOLUMETRIC CHROME RING                     */}
        {/* ============================================================== */}
        <div
          className="absolute w-[174px] h-[174px] flex items-center justify-center pointer-events-none preserve-3d-node"
          style={{
            animation: "gyro-h-precess 18s linear infinite",
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]">
            <defs>
              <linearGradient id="heavyChromeH2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="14%" stopColor="#f1f5f9" />
                <stop offset="28%" stopColor="#94a3b8" />
                <stop offset="42%" stopColor="#334155" />
                <stop offset="56%" stopColor="#0f172a" />
                <stop offset="68%" stopColor="#cbd5e1" />
                <stop offset="82%" stopColor="#ffffff" />
                <stop offset="92%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              <linearGradient id="rimGleamH2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#94a3b8" stopOpacity="0.25" />
                <stop offset="65%" stopColor="#0f172a" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Extrusion edge */}
            <circle cx="100" cy="101.5" r="82" fill="none" stroke="#0f172a" strokeWidth="15" />

            {/* Ring body */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="url(#heavyChromeH2)" strokeWidth="14" />

            {/* Outer Rim Highlight */}
            <circle cx="100" cy="100" r="89" fill="none" stroke="url(#rimGleamH2)" strokeWidth="1.2" />

            {/* Inner Rim Highlight */}
            <circle cx="100" cy="100" r="75" fill="none" stroke="url(#rimGleamH2)" strokeWidth="1.2" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 2. THICK VERTICAL VOLUMETRIC CHROME RING                       */}
        {/* ============================================================== */}
        <div
          className="absolute w-[146px] h-[146px] flex items-center justify-center pointer-events-none preserve-3d-node"
          style={{
            animation: "gyro-v-precess 14s linear infinite",
          }}
        >
          <svg viewBox="0 0 170 170" className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="heavyChromeV2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="18%" stopColor="#e2e8f0" />
                <stop offset="36%" stopColor="#475569" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="64%" stopColor="#cbd5e1" />
                <stop offset="82%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              <linearGradient id="rimGleamV2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#334155" stopOpacity="0.2" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.65" />
              </linearGradient>
            </defs>

            {/* Extrusion edge */}
            <circle cx="85" cy="86" r="69" fill="none" stroke="#0f172a" strokeWidth="13" />

            {/* Ring body */}
            <circle cx="85" cy="85" r="69" fill="none" stroke="url(#heavyChromeV2)" strokeWidth="12" />

            {/* Outer Rim */}
            <circle cx="85" cy="85" r="75" fill="none" stroke="url(#rimGleamV2)" strokeWidth="1" />

            {/* Inner Rim */}
            <circle cx="85" cy="85" r="63" fill="none" stroke="url(#rimGleamV2)" strokeWidth="1" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 3. CELESTIAL ORBITAL WIRE TRACK #1 WITH SATELLITE SPHERES      */}
        {/* ============================================================== */}
        <div
          className="absolute w-[160px] h-[160px] flex items-center justify-center pointer-events-none preserve-3d-node"
          style={{
            animation: "gyro-orbit-wire1 9s linear infinite",
          }}
        >
          <div className="absolute inset-0 rounded-full border border-slate-300/40 shadow-[0_0_6px_rgba(255,255,255,0.25)]" />

          {/* Satellite Sphere A */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.85)]"
            style={{
              background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
            }}
          />

          {/* Satellite Sphere B */}
          <div
            className="absolute bottom-2 right-4 w-2.5 h-2.5 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            style={{
              background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #e2e8f0 45%, #64748b 90%)",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 4. CELESTIAL ORBITAL WIRE TRACK #2 WITH POLAR NODE             */}
        {/* ============================================================== */}
        <div
          className="absolute w-[172px] h-[172px] flex items-center justify-center pointer-events-none preserve-3d-node"
          style={{
            animation: "gyro-orbit-wire2 15s linear infinite",
          }}
        >
          <div className="absolute inset-0 rounded-full border border-slate-400/25" />

          {/* Orbiting Satellite Node */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_7px_rgba(255,255,255,0.8)]"
            style={{
              background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 50%, #334155 100%)",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 5. SUSPENDED PURE-SVG 3D COIN (ZERO GLITCH / NO TEXT CLIPPING) */}
        {/* ============================================================== */}
        <div
          className="relative z-20 flex items-center justify-center preserve-3d-node"
          style={{
            animation: "coin-hover-sway 5.5s ease-in-out infinite",
          }}
        >
          {/* 3D Extruded Coin Edge */}
          <div
            className="absolute w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full"
            style={{
              transform: "translateZ(-3px) translateY(3px)",
              background: "linear-gradient(135deg, #334155 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.85)",
            }}
          />

          {/* Heavy Coin Face Container */}
          <div
            className="relative w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center overflow-hidden border border-white/60"
            style={{
              background: "radial-gradient(circle at 32% 28%, #ffffff 0%, #f1f5f9 20%, #cbd5e1 45%, #64748b 78%, #1e293b 100%)",
              boxShadow: `
                0 12px 28px rgba(0, 0, 0, 0.75),
                0 0 18px rgba(255, 255, 255, 0.2),
                inset 0 2.5px 3.5px rgba(255, 255, 255, 0.95),
                inset 0 -3px 4px rgba(0, 0, 0, 0.75)
              `,
            }}
          >
            {/* Outer Milled Rim */}
            <div className="absolute inset-[2.5px] rounded-full border border-white/70 pointer-events-none opacity-85" />

            {/* Inner Minted Groove */}
            <div
              className="absolute inset-[6px] rounded-full border border-black/30 pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.45), 0 1px 1px rgba(255, 255, 255, 0.65)",
              }}
            />

            {/* Anisotropic Light Sheen */}
            <div
              className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
              style={{
                background: "conic-gradient(from 30deg at 50% 50%, #ffffff 0deg, transparent 55deg, #ffffff 115deg, transparent 180deg, #ffffff 235deg, transparent 300deg, #ffffff 360deg)",
              }}
            />

            {/* Sweeping Specular Light Gleam */}
            <div
              className="absolute inset-y-0 w-8 pointer-events-none blur-[0.8px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                animation: "chrome-beam-sweep 4.2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
              }}
            />

            {/* 100% PURE SVG VECTOR ACUITY "A." MONOGRAM (Zero Safari 3D Glitch) */}
            <svg
              viewBox="0 0 100 100"
              className="relative z-10 w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
            >
              <defs>
                {/* Embossed Chrome A Gradient */}
                <linearGradient id="vectorAChrome" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#f8fafc" />
                  <stop offset="55%" stopColor="#cbd5e1" />
                  <stop offset="85%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Acuity Signature Ruby Red Jewel Dot */}
                <radialGradient id="vectorRubyDot" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ff7b72" />
                  <stop offset="55%" stopColor="#DE3121" />
                  <stop offset="95%" stopColor="#7f1d1d" />
                </radialGradient>

                {/* Ruby Glow Filter */}
                <filter id="rubyDotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#DE3121" floodOpacity="0.9" />
                </filter>
              </defs>

              <g transform="translate(6, 6) scale(0.88)">
                {/* 3D Depth Shadow under A */}
                <path
                  d="M 22,82 L 42,18 L 58,18 L 78,82 L 64,82 L 58,62 L 42,62 L 36,82 Z M 50,33 L 55,50 L 45,50 Z"
                  fill="#0f172a"
                  transform="translate(0, 1.8)"
                  opacity="0.8"
                />

                {/* Chrome Bevel Surface A */}
                <path
                  d="M 22,82 L 42,18 L 58,18 L 78,82 L 64,82 L 58,62 L 42,62 L 36,82 Z M 50,33 L 55,50 L 45,50 Z"
                  fill="url(#vectorAChrome)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />

                {/* Acuity Signature Ruby Dot "." */}
                <circle
                  cx="89"
                  cy="76"
                  r="6.5"
                  fill="url(#vectorRubyDot)"
                  filter="url(#rubyDotGlow)"
                />

                {/* Specular Jewel Highlight */}
                <circle cx="87.5" cy="74.5" r="1.8" fill="#ffffff" opacity="0.9" />
              </g>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
