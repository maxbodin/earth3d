'use client'
import React from 'react'
import { useLoadingProgress } from '@/app/hooks/useLoadingProgress'

/** Orbit radius and dimensions for the spinning Earth ring. */
const RING_SIZE = 192
const RING_R = 78
const RING_STROKE = 1
const ARC_FRACTION = 0.3

/** Sun ray geometry: 8 rays, cardinal (H/V) long, diagonal short. */
const SUN_RAYS = 8
const SUN_CENTER = RING_SIZE / 2
const SUN_CORE_R = 12
const SUN_INNER = 16

/** Ray outer lengths - start -> end over RAY_ANIM_DURATION. */
const SUN_OUTER_CARDINAL_START = 42
const SUN_OUTER_CARDINAL_END = 128
const SUN_OUTER_DIAGONAL_START = 28
const SUN_OUTER_DIAGONAL_END = 64
const RAY_ANIM_DURATION = '3s'

/** Pre-computed ray start/end coordinates (module-level, zero per-render cost). */
const SUN_RAYS_DATA = Array.from({ length: SUN_RAYS }, (_, i) => {
  const angle = (i * Math.PI * 2) / SUN_RAYS
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const isCardinal = i % 2 === 0
  const outerStart = isCardinal ? SUN_OUTER_CARDINAL_START : SUN_OUTER_DIAGONAL_START
  const outerEnd = isCardinal ? SUN_OUTER_CARDINAL_END : SUN_OUTER_DIAGONAL_END
  return {
    x1: SUN_CENTER + cos * SUN_INNER,
    y1: SUN_CENTER + sin * SUN_INNER,
    x2Start: SUN_CENTER + cos * outerStart,
    y2Start: SUN_CENTER + sin * outerStart,
    x2End: SUN_CENTER + cos * outerEnd,
    y2End: SUN_CENTER + sin * outerEnd,
  }
})

const CIRCUMFERENCE = 2 * Math.PI * RING_R

/** Earth sits at the trailing end of the arc, the ring leads behind like a tail. */
const EARTH_ANGLE = ARC_FRACTION * 2 * Math.PI
const EARTH_CX = SUN_CENTER + RING_R * Math.cos(EARTH_ANGLE)
const EARTH_CY = SUN_CENTER + RING_R * Math.sin(EARTH_ANGLE)

export function LoadingScreen(): React.JSX.Element {
  const { progress, currentLabel, isComplete } = useLoadingProgress()

  return (
    <div
      data-testid="loading-screen"
      data-state={isComplete ? 'complete' : 'loading'}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden ${
        isComplete ? 'animate-fade-out pointer-events-none' : ''
      }`}
      role="status"
      aria-label="Loading Earth 3D"
      aria-hidden={isComplete}
    >
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Orbital ring with Earth + Sun */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }} aria-hidden="true">
          <svg
            className="absolute inset-0 animate-loading-spin"
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            fill="none"
          >
            {/* Faint full orbit track */}
            <circle
              cx={SUN_CENTER}
              cy={SUN_CENTER}
              r={RING_R}
              stroke="white"
              strokeOpacity="0.06"
              strokeWidth={RING_STROKE}
            />
            {/* Visible arc, trailing behind Earths sphere */}
            <circle
              cx={SUN_CENTER}
              cy={SUN_CENTER}
              r={RING_R}
              stroke="white"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE * (1 - ARC_FRACTION)}`}
            />
            {/* Earth sphere at trailing end of the arc */}
            <circle cx={EARTH_CX} cy={EARTH_CY} r="5" fill="white" />
          </svg>

          {/* Sun, static at center */}
          <svg
            className="absolute inset-0"
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            fill="none"
          >
            <circle cx={SUN_CENTER} cy={SUN_CENTER} r={SUN_CORE_R} fill="white" />
            {SUN_RAYS_DATA.map((ray, i) => (
              <line
                key={i}
                x1={ray.x1}
                y1={ray.y1}
                x2={ray.x2Start}
                y2={ray.y2Start}
                stroke="white"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.5"
              >
                <animate attributeName="x2" from={ray.x2Start} to={ray.x2End} dur={RAY_ANIM_DURATION} fill="freeze" />
                <animate attributeName="y2" from={ray.y2Start} to={ray.y2End} dur={RAY_ANIM_DURATION} fill="freeze" />
              </line>
            ))}
          </svg>
        </div>

        {/* Title */}
        <h1
          data-testid="loading-title"
          className="text-2xl font-semibold uppercase text-white m-0"
        >
          Earth3D
        </h1>

        {/* Progress bar */}
        <div
          className="flex flex-col items-center gap-2 w-64"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading progress"
        >
          <div className="flex items-center gap-3 w-full">
            <div
              data-testid="loading-progress-track"
              className="flex-1 h-px bg-white/10 rounded-full overflow-hidden"
            >
              <div
                data-testid="loading-progress-fill"
                className="h-full rounded-full bg-white/80 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm tabular-nums text-white/35 min-w-[3ch] text-right">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Current step label */}
          <p
            data-testid="loading-status"
            className="text-sm tracking-wider text-white/20 m-0 min-h-[1.15em] text-center"
          >
            {currentLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
