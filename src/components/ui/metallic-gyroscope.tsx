"use client";

import React from "react";

interface MetallicGyroscopeProps {
  className?: string;
}

/**
 * 3D Metallic Gyroscope Component (1:1 Grey Reference Architecture)
 * 
 * Features:
 * - True 3D Depth-Layered Rendering: Back rings -> Central Coin -> Front rings (100% glitch-free, zero Safari z-fighting)
 * - Heavy volumetric chrome gimbal rings with realistic specular bevel highlights and dark chrome reflections
 * - Tilted 3D bullion medallion with embossed chrome "A" and signature glowing ruby jewel dot "."
 * - Fine orbital wire tracks with gleaming satellite spheres
 * - Smooth, hypnotic gyroscopic precession and sweeping specular gleams
 * - Perfectly scaled to fit mobile screens with zero scrolling
 */
export function MetallicGyroscope({ className = "" }: MetallicGyroscopeProps) {
  return (
    <div className={`relative w-full h-[180px] sm:h-[195px] flex items-center justify-center select-none overflow-visible ${className}`}>
      {/* Keyframe Animations */}
      <style>{`
        @keyframes gyro-precess-wobble {
          0% {
            transform: rotate(-3deg) scale(1);
          }
          50% {
            transform: rotate(3deg) scale(1.02);
          }
          100% {
            transform: rotate(-3deg) scale(1);
          }
        }

        @keyframes coin-specular-sweep {
          0%, 30% {
            transform: translateX(-140px) rotate(35deg);
            opacity: 0;
          }
          45% {
            opacity: 0.85;
          }
          60%, 100% {
            transform: translateX(140px) rotate(35deg);
            opacity: 0;
          }
        }

        @keyframes satellite-orbit-1 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes satellite-orbit-2 {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes ring-shimmer {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        .gyro-container {
          animation: gyro-precess-wobble 7s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        .orbit-track-1 {
          animation: satellite-orbit-1 12s linear infinite;
          transform-origin: 130px 130px;
        }

        .orbit-track-2 {
          animation: satellite-orbit-2 16s linear infinite;
          transform-origin: 130px 130px;
        }
      `}</style>

      {/* Atmospheric Ambient Glow behind Gyro (Subtle Acuity Crimson + Silver Halo) */}
      <div
        className="absolute w-[210px] h-[210px] rounded-full pointer-events-none blur-[50px] opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(222,49,33,0.3) 0%, rgba(152,197,185,0.15) 50%, transparent 75%)",
        }}
      />

      {/* Floor Contact Shadow */}
      <div
        className="absolute bottom-2 w-44 h-5 rounded-full pointer-events-none blur-sm"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)",
        }}
      />

      {/* Main Vector 3D Gyroscope Assembly */}
      <div className="relative w-[240px] h-[200px] flex items-center justify-center gyro-container">
        <svg
          viewBox="0 0 260 260"
          className="w-full h-full drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)] overflow-visible"
        >
          <defs>
            {/* Heavy Liquid Chrome Linear Gradient */}
            <linearGradient id="chromeBandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="12%" stopColor="#f1f5f9" />
              <stop offset="26%" stopColor="#cbd5e1" />
              <stop offset="42%" stopColor="#475569" />
              <stop offset="55%" stopColor="#0f172a" />
              <stop offset="68%" stopColor="#94a3b8" />
              <stop offset="84%" stopColor="#ffffff" />
              <stop offset="94%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Specular Rim Gleam */}
            <linearGradient id="chromeRimGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#94a3b8" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
            </linearGradient>

            {/* Vertical Ring Chrome Gradient */}
            <linearGradient id="chromeVertGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#e2e8f0" />
              <stop offset="40%" stopColor="#475569" />
              <stop offset="55%" stopColor="#0f172a" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="88%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Coin Face Brushed Radial Gradient */}
            <radialGradient id="coinFaceGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#f1f5f9" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="75%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>

            {/* Embossed Acuity Chrome A Gradient */}
            <linearGradient id="acuityEmbossA" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="88%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Acuity Signature Glowing Ruby Red Dot */}
            <radialGradient id="acuityRubyDot" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff7b72" />
              <stop offset="55%" stopColor="#DE3121" />
              <stop offset="95%" stopColor="#7f1d1d" />
            </radialGradient>

            {/* Ruby Dot Glow Filter */}
            <filter id="rubyGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#DE3121" floodOpacity="0.95" />
            </filter>

            {/* Coin Mask for Specular Beam */}
            <clipPath id="coinClip">
              <ellipse cx="130" cy="130" rx="36" ry="36" />
            </clipPath>
          </defs>

          {/* ============================================================== */}
          {/* LAYER 1: BACK HALF OF GIMBAL RINGS & ORBITS (Behind the Coin)  */}
          {/* ============================================================== */}
          <g id="gyro-back-layer">
            {/* Back half of Horizontal Ring (Upper Arch) */}
            <path
              d="M 34,130 A 96,46 0 0,1 226,130"
              fill="none"
              stroke="#0f172a"
              strokeWidth="19"
              strokeLinecap="round"
            />
            <path
              d="M 34,130 A 96,46 0 0,1 226,130"
              fill="none"
              stroke="url(#chromeBandGrad)"
              strokeWidth="17"
              strokeLinecap="round"
            />
            <path
              d="M 34,130 A 104.5,50 0 0,1 226,130"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1.2"
            />
            <path
              d="M 34,130 A 87.5,42 0 0,1 226,130"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1.2"
            />

            {/* Back half of Vertical Ring (Left Arch) */}
            <path
              d="M 130,42 A 42,88 0 0,0 130,218"
              fill="none"
              stroke="#0f172a"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 130,42 A 42,88 0 0,0 130,218"
              fill="none"
              stroke="url(#chromeVertGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 130,42 A 49,95 0 0,0 130,218"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1"
            />
            <path
              d="M 130,42 A 35,81 0 0,0 130,218"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1"
            />

            {/* Back half of Thin Orbital Wire #1 */}
            <path
              d="M 52,86 A 90,65 40 0,1 208,174"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.2"
            />

            {/* Back half of Thin Orbital Wire #2 */}
            <path
              d="M 68,184 A 88,58 -35 0,1 192,76"
              fill="none"
              stroke="rgba(203,213,225,0.2)"
              strokeWidth="1"
            />
          </g>

          {/* ============================================================== */}
          {/* LAYER 2: CENTRAL 3D BULLION MEDALLION (Suspended in Center)    */}
          {/* ============================================================== */}
          <g id="gyro-central-coin">
            {/* 3D Extruded Coin Edge Shadow (Thickness) */}
            <ellipse
              cx="132"
              cy="133"
              rx="37"
              ry="37"
              fill="#0f172a"
              filter="drop-shadow(0 10px 22px rgba(0,0,0,0.85))"
            />

            {/* Outer Coin Milled Rim */}
            <circle
              cx="130"
              cy="130"
              r="36"
              fill="url(#coinFaceGrad)"
              stroke="#ffffff"
              strokeWidth="1.8"
            />

            {/* Inner Minted Groove Ring */}
            <circle
              cx="130"
              cy="130"
              r="32.5"
              fill="none"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="1"
            />
            <circle
              cx="130"
              cy="130"
              r="31.5"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.8"
            />

            {/* Brushed Light Sheen Texture */}
            <circle
              cx="130"
              cy="130"
              r="30"
              fill="url(#coinFaceGrad)"
              opacity="0.95"
            />

            {/* Sweeping Specular Light Gleam */}
            <g clipPath="url(#coinClip)">
              <rect
                x="80"
                y="80"
                width="28"
                height="100"
                fill="linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)"
                style={{
                  animation: "coin-specular-sweep 4.5s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                }}
              />
            </g>

            {/* ========================================================== */}
            {/* OFFICIAL EMBOSSED ACUITY "A." MONOGRAM (Zero-Glitch SVG)    */}
            {/* ========================================================== */}
            <g transform="translate(108, 107) scale(0.44)">
              {/* Embossed Drop Shadow under A */}
              <path
                d="M 22,82 L 42,18 L 58,18 L 78,82 L 64,82 L 58,62 L 42,62 L 36,82 Z M 50,33 L 55,50 L 45,50 Z"
                fill="#0f172a"
                transform="translate(0, 2)"
                opacity="0.85"
              />

              {/* Polished Chrome Surface A */}
              <path
                d="M 22,82 L 42,18 L 58,18 L 78,82 L 64,82 L 58,62 L 42,62 L 36,82 Z M 50,33 L 55,50 L 45,50 Z"
                fill="url(#acuityEmbossA)"
                stroke="#ffffff"
                strokeWidth="1"
              />

              {/* Acuity Signature Ruby Red Jewel Dot "." */}
              <circle
                cx="89"
                cy="76"
                r="7"
                fill="url(#acuityRubyDot)"
                filter="url(#rubyGlowFilter)"
              />

              {/* Specular Glint on Jewel Dot */}
              <circle cx="87.5" cy="74" r="2" fill="#ffffff" opacity="0.9" />
            </g>
          </g>

          {/* ============================================================== */}
          {/* LAYER 3: FRONT HALF OF GIMBAL RINGS & ORBITS (Loops Over Coin) */}
          {/* ============================================================== */}
          <g id="gyro-front-layer">
            {/* Front half of Vertical Ring (Right Arch - Loops over top) */}
            <path
              d="M 130,42 A 42,88 0 0,1 130,218"
              fill="none"
              stroke="#0f172a"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 130,42 A 42,88 0 0,1 130,218"
              fill="none"
              stroke="url(#chromeVertGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 130,42 A 49,95 0 0,1 130,218"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1.2"
            />
            <path
              d="M 130,42 A 35,81 0 0,1 130,218"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1.2"
            />

            {/* Front half of Horizontal Ring (Lower Arch - Loops in front of coin) */}
            <path
              d="M 34,130 A 96,46 0 0,0 226,130"
              fill="none"
              stroke="#0f172a"
              strokeWidth="19"
              strokeLinecap="round"
            />
            <path
              d="M 34,130 A 96,46 0 0,0 226,130"
              fill="none"
              stroke="url(#chromeBandGrad)"
              strokeWidth="17"
              strokeLinecap="round"
            />
            <path
              d="M 34,130 A 104.5,50 0 0,0 226,130"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1.4"
            />
            <path
              d="M 34,130 A 87.5,42 0 0,0 226,130"
              fill="none"
              stroke="url(#chromeRimGrad)"
              strokeWidth="1.4"
            />

            {/* Front half of Thin Orbital Wire #1 with Satellite Spheres */}
            <path
              d="M 208,174 A 90,65 40 0,1 52,86"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.2"
            />

            {/* Orbiting Satellite Node 1 (Top-Right) */}
            <g className="orbit-track-1">
              <circle
                cx="195"
                cy="95"
                r="4.5"
                fill="radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)"
                stroke="#ffffff"
                strokeWidth="0.8"
                filter="drop-shadow(0 0 6px rgba(255,255,255,0.9))"
              />
              <circle cx="193.5" cy="93.5" r="1.5" fill="#ffffff" />
            </g>

            {/* Front half of Thin Orbital Wire #2 with Satellite Sphere */}
            <path
              d="M 192,76 A 88,58 -35 0,1 68,184"
              fill="none"
              stroke="rgba(203,213,225,0.3)"
              strokeWidth="1"
            />

            {/* Orbiting Satellite Node 2 (Bottom-Left) */}
            <g className="orbit-track-2">
              <circle
                cx="85"
                cy="175"
                r="3.5"
                fill="radial-gradient(circle at 32% 32%, #ffffff 0%, #e2e8f0 45%, #475569 90%)"
                stroke="#ffffff"
                strokeWidth="0.6"
                filter="drop-shadow(0 0 5px rgba(255,255,255,0.8))"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
