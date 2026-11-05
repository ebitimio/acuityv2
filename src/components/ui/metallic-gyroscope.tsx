"use client";

import React from "react";

interface MetallicGyroscopeProps {
  className?: string;
}

/**
 * 3D Metallic Gyroscope Component
 * 
 * Accurately replicates the heavy metallic armillary / gyro visual from the reference:
 * - Thick, volumetric chrome gimbal rings with high-contrast specular reflections
 * - Orthogonal intersecting vertical & horizontal rings with realistic physical depth
 * - Dual celestial orbital wire tracks with gleaming chrome satellite spheres
 * - Suspended 3D bullion medallion tilted in perspective, embossed with Acuity's signature "A." monogram and glowing ruby red dot
 * - Continuous, smooth 60fps GPU-accelerated gyroscopic precession
 */
export function MetallicGyroscope({ className = "" }: MetallicGyroscopeProps) {
  return (
    <div className={`relative w-full h-[280px] sm:h-[310px] flex items-center justify-center select-none overflow-visible ${className}`}>
      {/* Scoped CSS 3D Gyroscopic Precession Animations */}
      <style>{`
        @keyframes gyro-horizontal-precession {
          0% {
            transform: rotateX(68deg) rotateY(16deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(68deg) rotateY(16deg) rotateZ(360deg);
          }
        }

        @keyframes gyro-vertical-precession {
          0% {
            transform: rotateX(18deg) rotateY(74deg) rotateZ(360deg);
          }
          100% {
            transform: rotateX(18deg) rotateY(74deg) rotateZ(0deg);
          }
        }

        @keyframes gyro-orbital-wire-1 {
          0% {
            transform: rotateX(48deg) rotateY(-38deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(48deg) rotateY(-38deg) rotateZ(360deg);
          }
        }

        @keyframes gyro-orbital-wire-2 {
          0% {
            transform: rotateX(76deg) rotateY(-18deg) rotateZ(360deg);
          }
          100% {
            transform: rotateX(76deg) rotateY(-18deg) rotateZ(0deg);
          }
        }

        @keyframes medallion-3d-float {
          0%, 100% {
            transform: translateZ(10px) rotateX(14deg) rotateY(-18deg);
          }
          50% {
            transform: translateZ(-8px) rotateX(-10deg) rotateY(16deg);
          }
        }

        @keyframes chrome-specular-gleam {
          0%, 25% {
            transform: translateX(-160%) rotate(30deg);
            opacity: 0;
          }
          40% {
            opacity: 0.9;
          }
          55%, 100% {
            transform: translateX(260%) rotate(30deg);
            opacity: 0;
          }
        }

        @keyframes atmospheric-breathe {
          0%, 100% {
            opacity: 0.55;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }

        .gyro-3d-stage {
          transform-style: preserve-3d;
          perspective: 1100px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>

      {/* Atmospheric Backlight Halos (Acuity Red + Platinum Sheen) */}
      <div
        className="absolute w-[260px] h-[260px] rounded-full pointer-events-none blur-[70px]"
        style={{
          background: "radial-gradient(circle, rgba(222,49,33,0.2) 0%, rgba(148,163,184,0.12) 45%, transparent 75%)",
          animation: "atmospheric-breathe 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[180px] h-[180px] rounded-full pointer-events-none blur-[45px]"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Soft Contact Floor Shadow */}
      <div
        className="absolute bottom-3 w-52 h-7 rounded-full pointer-events-none blur-md"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 75%)",
        }}
      />

      {/* 3D Perspective Container */}
      <div className="relative w-[270px] h-[270px] flex items-center justify-center gyro-3d-stage">

        {/* ============================================================== */}
        {/* 1. THICK VOLUMETRIC HORIZONTAL GIMBAL RING                      */}
        {/* ============================================================== */}
        <div
          className="absolute w-[240px] h-[240px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-horizontal-precession 18s linear infinite",
          }}
        >
          <svg viewBox="0 0 260 260" className="w-full h-full drop-shadow-[0_12px_26px_rgba(0,0,0,0.7)]">
            <defs>
              {/* Heavy Chrome Multi-stop Linear Gradient */}
              <linearGradient id="heavyChromeH" x1="0%" y1="0%" x2="100%" y2="100%">
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

              {/* Specular Rim Gleam */}
              <linearGradient id="rimGleamH" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#0f172a" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
              </linearGradient>

              {/* Bevel Shadow */}
              <linearGradient id="bevelShadowH" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
                <stop offset="50%" stopColor="transparent" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Outer Drop Shadow Ring */}
            <circle cx="130" cy="130" r="105" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="20" />

            {/* Outer Physical Extrusion Band (Gives physical ring thickness) */}
            <circle cx="130" cy="132" r="105" fill="none" stroke="#1e293b" strokeWidth="20" />

            {/* Main Volumetric Chrome Torus */}
            <circle cx="130" cy="130" r="105" fill="none" stroke="url(#heavyChromeH)" strokeWidth="18" />

            {/* Outer Specular Rim Highlight */}
            <circle cx="130" cy="130" r="114" fill="none" stroke="url(#rimGleamH)" strokeWidth="1.8" />

            {/* Inner Chamfer Bevel Highlight */}
            <circle cx="130" cy="130" r="96" fill="none" stroke="url(#rimGleamH)" strokeWidth="1.8" />

            {/* Front Bevel Lighting Contour */}
            <circle cx="130" cy="130" r="105" fill="none" stroke="url(#bevelShadowH)" strokeWidth="18" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 2. THICK VOLUMETRIC VERTICAL GIMBAL RING                        */}
        {/* ============================================================== */}
        <div
          className="absolute w-[200px] h-[200px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-vertical-precession 14s linear infinite",
          }}
        >
          <svg viewBox="0 0 220 220" className="w-full h-full drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]">
            <defs>
              <linearGradient id="heavyChromeV" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="16%" stopColor="#e2e8f0" />
                <stop offset="34%" stopColor="#475569" />
                <stop offset="48%" stopColor="#0f172a" />
                <stop offset="62%" stopColor="#cbd5e1" />
                <stop offset="80%" stopColor="#ffffff" />
                <stop offset="94%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>

              <linearGradient id="rimGleamV" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#334155" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Extrusion thickness band */}
            <circle cx="110" cy="111.5" r="88" fill="none" stroke="#0f172a" strokeWidth="16" />

            {/* Ring Body */}
            <circle cx="110" cy="110" r="88" fill="none" stroke="url(#heavyChromeV)" strokeWidth="15" />

            {/* Outer Rim */}
            <circle cx="110" cy="110" r="95.5" fill="none" stroke="url(#rimGleamV)" strokeWidth="1.5" />

            {/* Inner Rim */}
            <circle cx="110" cy="110" r="80.5" fill="none" stroke="url(#rimGleamV)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 3. CELESTIAL ORBITAL WIRE TRACK #1 WITH SATELLITE SPHERES      */}
        {/* ============================================================== */}
        <div
          className="absolute w-[218px] h-[218px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-orbital-wire-1 9s linear infinite",
          }}
        >
          {/* Delicate Luminous Silver Wire Track */}
          <div className="absolute inset-0 rounded-full border-[1.2px] border-slate-300/40 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />

          {/* Chrome Satellite Sphere A (Top) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9),0_3px_6px_rgba(0,0,0,0.7)]"
            style={{
              background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 40%, #475569 80%, #0f172a 100%)",
            }}
          >
            <div className="absolute top-0.5 left-0.5 w-1.2 h-1.2 rounded-full bg-white blur-[0.3px]" />
          </div>

          {/* Chrome Satellite Sphere B (Bottom-Right) */}
          <div
            className="absolute bottom-3 right-6 w-3 h-3 rounded-full shadow-[0_0_9px_rgba(255,255,255,0.8)]"
            style={{
              background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #e2e8f0 45%, #64748b 90%)",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 4. CELESTIAL ORBITAL WIRE TRACK #2 WITH POLAR SATELLITE        */}
        {/* ============================================================== */}
        <div
          className="absolute w-[236px] h-[236px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-orbital-wire-2 15s linear infinite",
          }}
        >
          <div className="absolute inset-0 rounded-full border-[1px] border-slate-400/25 shadow-[0_0_6px_rgba(255,255,255,0.18)]" />

          {/* Orbiting Satellite Node */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.85)]"
            style={{
              background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 50%, #334155 100%)",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 5. SUSPENDED 3D BULLION MEDALLION WITH EMBOSSED "A." MONOGRAM  */}
        {/* ============================================================== */}
        <div
          className="relative z-20 flex items-center justify-center preserve-3d cursor-pointer"
          style={{
            animation: "medallion-3d-float 6s ease-in-out infinite",
          }}
        >
          {/* Physical 3D Extruded Coin Edge (Gives the medallion physical thickness) */}
          <div
            className="absolute w-[86px] h-[86px] sm:w-[92px] sm:h-[92px] rounded-full"
            style={{
              transform: "translateZ(-4px) translateY(4px)",
              background: "linear-gradient(135deg, #334155 0%, #0f172a 40%, #1e293b 80%, #475569 100%)",
              boxShadow: "0 18px 36px rgba(0, 0, 0, 0.85)",
            }}
          />

          {/* Heavy Coin Main Disc */}
          <div
            className="relative w-[86px] h-[86px] sm:w-[92px] sm:h-[92px] rounded-full flex items-center justify-center overflow-hidden border border-white/50"
            style={{
              background: "radial-gradient(circle at 32% 28%, #ffffff 0%, #f1f5f9 20%, #cbd5e1 45%, #64748b 78%, #1e293b 100%)",
              boxShadow: `
                0 16px 36px rgba(0, 0, 0, 0.8),
                0 0 24px rgba(255, 255, 255, 0.22),
                inset 0 3px 4px rgba(255, 255, 255, 0.95),
                inset 0 -3.5px 5px rgba(0, 0, 0, 0.75)
              `,
            }}
          >
            {/* Outer Milled Rim Bevel Ring */}
            <div className="absolute inset-[3px] rounded-full border border-white/70 pointer-events-none opacity-85" />

            {/* Inner Minted Groove Ring */}
            <div
              className="absolute inset-[8px] rounded-full border border-black/30 pointer-events-none"
              style={{
                boxShadow: "inset 0 1.5px 2.5px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(255, 255, 255, 0.7)",
              }}
            />

            {/* Anisotropic Brushed Radial Light Sheen */}
            <div
              className="absolute inset-0 rounded-full opacity-45 pointer-events-none"
              style={{
                background: "conic-gradient(from 30deg at 50% 50%, #ffffff 0deg, transparent 55deg, #ffffff 115deg, transparent 180deg, #ffffff 235deg, transparent 300deg, #ffffff 360deg)",
              }}
            />

            {/* Sweeping Specular Light Gleam */}
            <div
              className="absolute inset-y-0 w-10 pointer-events-none blur-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
                animation: "chrome-specular-gleam 4.5s cubic-bezier(0.16, 1, 0.3, 1) infinite",
              }}
            />

            {/* Official Acuity Monogram: Solid Embossed Chrome "A" + Signature Ruby Red Dot "." */}
            <div className="relative z-10 flex items-baseline tracking-tighter select-none pl-1">
              {/* Embossed Metallic Letter "A" */}
              <span
                className="text-[34px] sm:text-[38px] font-black tracking-tight leading-none"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 25%, #cbd5e1 55%, #64748b 85%, #1e293b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `
                    drop-shadow(0 2.5px 3.5px rgba(0, 0, 0, 0.85))
                    drop-shadow(0 -1px 0.5px rgba(255, 255, 255, 0.95))
                  `,
                }}
              >
                A
              </span>

              {/* Signature Acuity Jewel Red Dot "." */}
              <span
                className="inline-block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ml-0.5 mb-1"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #ff7b72 0%, #DE3121 55%, #7f1d1d 95%)",
                  boxShadow: `
                    0 0 12px rgba(222, 49, 33, 1),
                    0 0 5px rgba(255, 107, 96, 0.85),
                    inset 0 1.2px 1.8px rgba(255, 255, 255, 0.85),
                    inset 0 -1.2px 2px rgba(0, 0, 0, 0.7)
                  `,
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
