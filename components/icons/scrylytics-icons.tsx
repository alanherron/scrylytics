////////////////////////////////////////////////////////////
// Scrylytics Icon Components
////////////////////////////////////////////////////////////
import React from "react"

export const CardlyticsIcon = ({ color = "#388E3C", size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 120" fill={color}>
    <rect x="10" y="10" width="80" height="100" rx="10" />
    <rect x="35" y="40" width="30" height="40" rx="5" fill="rgba(255,255,255,0.15)" />
  </svg>
)

export const DecklyticsIcon = ({ color = "#0288D1", size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
    <rect x="15" y="60" width="70" height="30" rx="6" />
    <rect x="10" y="40" width="70" height="30" rx="6" />
    <rect x="5" y="20" width="70" height="30" rx="6" />
  </svg>
)

export const PlaylyticsIcon = ({ color = "#E53935", size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 100" fill={color}>
    <rect x="10" y="30" width="80" height="60" rx="8" transform="rotate(-10 50 60)" />
    <rect x="20" y="25" width="80" height="60" rx="8" transform="rotate(-5 60 55)" />
    <rect x="30" y="20" width="80" height="60" rx="8" />
  </svg>
)

export const MetalyticsIcon = ({ color = "#6A1B9A", size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill={color}>
    <g transform="translate(60,60)">
      {[...Array(6)].map((_, i) => (
        <rect
          key={i}
          x="-10"
          y="-40"
          width="20"
          height="30"
          rx="4"
          transform={`rotate(${i * 60})`}
        />
      ))}
    </g>
  </svg>
)








