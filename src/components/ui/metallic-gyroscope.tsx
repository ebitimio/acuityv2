"use client";

import React from "react";
import { motion } from "framer-motion";

interface MetallicGyroscopeProps {
  className?: string;
}

/**
 * 3D Metallic Gyroscope Component
 * 
 * Features:
 * - Concentric metallic gimbal rings rotating in 3D perspective
 * - Thin orbital wire tracks with gleaming celestial satellite beads
 * - Suspended central bullion medallion with embossed chrome "A." and glowing ruby red dot
 * - Anisotropic brushed metal finish and animated specular light sweeps
 * - Deep Acuity atmospheric backlighting and soft contact shadow
 */
export function MetallicGyroscope({ className = "" }: MetallicGyroscopeProps) {
  return (
    <div className={`relative w-full h-[270px] sm:h-[300px] flex items-center justify-center select-none overflow-visible ${className}`}>
      {/* Scoped CSS 3D Keyframe Animations */}
      <style>{`
        @keyframes gyro-outer-spin {
          0% {
            transform: rotateX(62deg) rotateY(18deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(62deg) rotateY(18deg) rotateZ(360deg);
          }
        }

        @keyframes gyro-inner-spin {
          0% {
            transform: rotateX(24deg) rotateY(68deg) rotateZ(360deg);
          }
          100% {
            transform: rotateX(24deg) rotateY(68deg) rotateZ(0deg);
          }
        }

        @keyframes gyro-wire-spin {
          0% {
            transform: rotateX(46deg) rotateY(-36deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(46deg) rotateY(-36deg) rotateZ(360deg);
          }
        }

        @keyframes gyro-wire2-spin {
          0% {
            transform: rotateX(74deg) rotateY(-14deg) rotateZ(360deg);
          }
          100% {
            transform: rotateX(74deg) rotateY(-14deg) rotateZ(0deg);
          }
        }

        @keyframes coin-hover-wobble {
          0%, 100% {
            transform: translateZ(8px) rotateX(10deg) rotateY(-14deg);
          }
          50% {
            transform: translateZ(-8px) rotateX(-8deg) rotateY(12deg);
          }
        }

        @keyframes coin-gleam-sweep {
          0%, 20% {
            transform: translateX(-150%) rotate(25deg);
            opacity: 0;
          }
          35% {
            opacity: 0.85;
          }
          50%, 100% {
            transform: translateX(250%) rotate(25deg);
            opacity: 0;
          }
        }

        @keyframes ambient-pulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.06);
          }
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>

      {/* Atmospheric Ambient Glows */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full pointer-events-none blur-[65px] transition-all"
        style={{
          background: "radial-gradient(circle, rgba(222,49,33,0.18) 0%, rgba(148,163,184,0.12) 45%, transparent 75%)",
          animation: "ambient-pulse 5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[160px] h-[160px] rounded-full pointer-events-none blur-[40px]"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Soft Contact Floor Shadow */}
      <div
        className="absolute bottom-4 w-48 h-6 rounded-full pointer-events-none blur-md"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)",
        }}
      />

      {/* 3D Perspective Stage */}
      <div
        className="relative w-[260px] h-[260px] flex items-center justify-center preserve-3d"
        style={{
          perspective: 1000,
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* ============================================================== */}
        {/* 1. OUTER HEAVY GIMBAL RING (Tilted ~62deg, continuous spin)     */}
        {/* ============================================================== */}
        <div
          className="absolute w-[230px] h-[230px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-outer-spin 16s linear infinite",
          }}
        >
          <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
            <defs>
              {/* Metallic Multi-stop Linear Gradient */}
              <linearGradient id="outerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="12%" stopColor="#e2e8f0" />
                <stop offset="30%" stopColor="#94a3b8" />
                <stop offset="48%" stopColor="#334155" />
                <stop offset="65%" stopColor="#cbd5e1" />
                <stop offset="82%" stopColor="#1e293b" />
                <stop offset="94%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Specular Rim Light Gradient */}
              <linearGradient id="rimLightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#94a3b8" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#000000" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
              </linearGradient>

              {/* Inner Cavity Shadow */}
              <radialGradient id="ringShadowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
              </radialGradient>
            </defs>

            {/* Main Metallic Torus Body */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="url(#outerRingGrad)"
              strokeWidth="15"
            />

            {/* Outer Specular Rim Highlight */}
            <circle
              cx="120"
              cy="120"
              r="107.5"
              fill="none"
              stroke="url(#rimLightGrad)"
              strokeWidth="1.2"
            />

            {/* Inner Chamfer Bevel Highlight */}
            <circle
              cx="120"
              cy="120"
              r="92.5"
              fill="none"
              stroke="url(#rimLightGrad)"
              strokeWidth="1.2"
            />

            {/* Radial Metallic Ambient Tint */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="url(#ringShadowGrad)"
              strokeWidth="15"
            />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 2. INNER GIMBAL RING (Orthogonal inclination, counter spin)    */}
        {/* ============================================================== */}
        <div
          className="absolute w-[184px] h-[184px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-inner-spin 12s linear infinite",
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]">
            <defs>
              <linearGradient id="innerRingGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="18%" stopColor="#cbd5e1" />
                <stop offset="38%" stopColor="#475569" />
                <stop offset="55%" stopColor="#e2e8f0" />
                <stop offset="72%" stopColor="#1e293b" />
                <stop offset="88%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              <linearGradient id="innerRimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#64748b" stopOpacity="0.2" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Ring Body */}
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#innerRingGrad)"
              strokeWidth="12"
            />

            {/* Outer Rim */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#innerRimGrad)"
              strokeWidth="1"
            />

            {/* Inner Rim */}
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="url(#innerRimGrad)"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 3. THIN CELESTIAL ORBITAL WIRE #1 WITH SATELLITE BEADS         */}
        {/* ============================================================== */}
        <div
          className="absolute w-[205px] h-[205px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-wire-spin 8.5s linear infinite",
          }}
        >
          {/* Wire Track */}
          <div className="absolute inset-0 rounded-full border border-slate-300/40 shadow-[0_0_8px_rgba(255,255,255,0.25)]" />

          {/* Satellite Bead A */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.6)]"
            style={{
              background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #1e293b 100%)",
            }}
          >
            {/* Specular Glint */}
            <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white blur-[0.4px]" />
          </div>

          {/* Satellite Bead B */}
          <div
            className="absolute bottom-2 right-6 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            style={{
              background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 40%, #64748b 90%)",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 4. THIN CELESTIAL ORBITAL WIRE #2 WITH POLAR BEAD              */}
        {/* ============================================================== */}
        <div
          className="absolute w-[228px] h-[228px] flex items-center justify-center pointer-events-none preserve-3d"
          style={{
            animation: "gyro-wire2-spin 14s linear infinite",
          }}
        >
          <div className="absolute inset-0 rounded-full border border-slate-400/25 shadow-[0_0_6px_rgba(255,255,255,0.15)]" />
          
          {/* Orbiting Satellite Node */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #94a3b8 60%, #334155 100%)",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 5. CENTRAL SUSPENDED METALLIC BULLION COIN WITH "A." MONOGRAM  */}
        {/* ============================================================== */}
        <div
          className="relative z-20 flex items-center justify-center preserve-3d cursor-pointer"
          style={{
            animation: "coin-hover-wobble 5.5s ease-in-out infinite",
          }}
        >
          {/* Heavy Coin Body */}
          <div
            className="relative w-[78px] h-[78px] sm:w-[84px] sm:h-[84px] rounded-full flex items-center justify-center overflow-hidden border border-white/40"
            style={{
              background: "radial-gradient(circle at 34% 30%, #ffffff 0%, #e2e8f0 25%, #94a3b8 55%, #475569 82%, #1e293b 100%)",
              boxShadow: `
                0 14px 34px rgba(0, 0, 0, 0.75),
                0 0 20px rgba(255, 255, 255, 0.18),
                inset 0 2.5px 3.5px rgba(255, 255, 255, 0.95),
                inset 0 -3px 5px rgba(0, 0, 0, 0.75)
              `,
            }}
          >
            {/* Outer Milled Rim Bevel Ring */}
            <div className="absolute inset-[3px] rounded-full border border-white/60 pointer-events-none opacity-80" />

            {/* Inner Minted Groove Ring */}
            <div
              className="absolute inset-[7px] rounded-full border border-black/25 pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.45), 0 1px 1px rgba(255, 255, 255, 0.6)",
              }}
            />

            {/* Anisotropic Brushed Radial Texture Sheen */}
            <div
              className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
              style={{
                background: "conic-gradient(from 45deg at 50% 50%, #ffffff 0deg, transparent 60deg, #ffffff 120deg, transparent 180deg, #ffffff 240deg, transparent 300deg, #ffffff 360deg)",
              }}
            />

            {/* Sweeping Specular Light Gleam */}
            <div
              className="absolute inset-y-0 w-8 pointer-events-none blur-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                animation: "coin-gleam-sweep 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
              }}
            />

            {/* Signature Acuity "A." Monogram Emblem */}
            <div className="relative z-10 flex items-baseline tracking-tighter select-none pl-0.5">
              {/* Embossed Metallic Letter "A" */}
              <span
                className="text-[30px] sm:text-[32px] font-black tracking-tight leading-none"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 25%, #cbd5e1 55%, #64748b 85%, #334155 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `
                    drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8))
                    drop-shadow(0 -0.8px 0.4px rgba(255, 255, 255, 0.9))
                  `,
                }}
              >
                A
              </span>

              {/* Glowing Ruby Red Dot "." */}
              <span
                className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ml-0.5 mb-1"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #ff7b72 0%, #DE3121 55%, #7f1d1d 95%)",
                  boxShadow: `
                    0 0 10px rgba(222, 49, 33, 0.95),
                    0 0 4px rgba(255, 107, 96, 0.8),
                    inset 0 1px 1.5px rgba(255, 255, 255, 0.8),
                    inset 0 -1px 2px rgba(0, 0, 0, 0.6)
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
