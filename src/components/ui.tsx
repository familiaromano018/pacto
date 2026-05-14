'use client'

import React, { CSSProperties } from 'react'
import { tokens } from '@/lib/tokens'

export function Avatar({
  name,
  color,
  size = tokens.component.avatar.sizeLg,
}: {
  name: string
  color: string
  size?: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: tokens.primitive.radius.pill,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: tokens.primitive.fontWeight.extrabold,
        fontSize: size * 0.4,
        color: tokens.color.text_onBrand,
        flexShrink: 0,
        boxShadow: tokens.shadow.avatar(color),
      }}
    >
      {name ? name[0].toUpperCase() : '?'}
    </div>
  )
}

export function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        background: color + '22',
        color,
        border: `${tokens.component.tag.borderWidth} solid ${color}44`,
        borderRadius: tokens.component.tag.radius,
        padding: `${tokens.component.tag.paddingY} ${tokens.component.tag.paddingX}`,
        fontSize: tokens.component.tag.fontSize,
        fontWeight: tokens.primitive.fontWeight.bold,
      }}
    >
      {label}
    </span>
  )
}

export function ProgressBar({
  pct,
  color,
  label,
  sublabel,
}: {
  pct: number
  color: string
  label: string
  sublabel?: string
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing.stack_xs,
        }}
      >
        <span style={{ fontSize: tokens.primitive.fontSize.sm, color: tokens.color.text_secondary }}>
          {label}
        </span>
        <span
          style={{
            fontSize: tokens.primitive.fontSize.sm,
            fontWeight: tokens.primitive.fontWeight.bold,
            color,
          }}
        >
          {sublabel ?? `${pct.toFixed(0)}%`}
        </span>
      </div>
      <div
        style={{
          background: tokens.color.border_subtle,
          borderRadius: tokens.component.progressBar.radius,
          height: tokens.component.progressBar.height,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(pct, 100)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            borderRadius: tokens.component.progressBar.radius,
            transition: tokens.motion.progress,
          }}
        />
      </div>
    </div>
  )
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        background: tokens.color.bg_card,
        borderRadius: tokens.component.card.radius,
        padding: `${tokens.component.card.paddingY} ${tokens.component.card.paddingX}`,
        boxShadow: tokens.shadow.card,
        border: `${tokens.component.card.borderWidth} solid ${tokens.color.border_subtle}`,
        marginBottom: tokens.component.card.marginBottom,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Btn({
  label,
  onClick,
  color = tokens.color.brand,
  small = false,
}: {
  label: string
  onClick: () => void
  color?: string
  small?: boolean
}) {
  const size = small ? 'sm' : 'md'
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: tokens.color.text_onBrand,
        border: `2px solid ${color}`,
        borderRadius: tokens.component.button.radius[size],
        padding: small
          ? `${tokens.primitive.space[3]} ${tokens.component.button.paddingX.sm}`
          : `${tokens.primitive.space[6]} ${tokens.component.button.paddingX.md}`,
        fontWeight: tokens.primitive.fontWeight.extrabold,
        fontSize: tokens.component.button.fontSize[size],
        cursor: 'pointer',
        transition: tokens.motion.interaction,
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}

export function Inp({
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        border: `${tokens.component.input.borderWidth} solid ${tokens.color.border_default}`,
        borderRadius: tokens.component.input.radius,
        padding: `${tokens.component.input.paddingY} ${tokens.component.input.paddingX}`,
        fontSize: tokens.component.input.fontSize,
        fontFamily: 'inherit',
        outline: 'none',
        width: '100%',
        background: tokens.color.bg_card,
        color: tokens.color.text_heading,
        boxSizing: 'border-box',
        transition: tokens.motion.inputFocus,
      }}
      onFocus={(e) => (e.target.style.borderColor = tokens.color.border_focus)}
      onBlur={(e) => (e.target.style.borderColor = tokens.color.border_default)}
    />
  )
}

export function Sel({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { v: string; l: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        border: `${tokens.component.input.borderWidth} solid ${tokens.color.border_default}`,
        borderRadius: tokens.component.input.radius,
        padding: `${tokens.component.input.paddingY} ${tokens.component.input.paddingX}`,
        fontSize: tokens.component.input.fontSize,
        fontFamily: 'inherit',
        outline: 'none',
        background: tokens.color.bg_card,
        color: tokens.color.text_heading,
      }}
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  )
}

export function Lbl({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: tokens.text.label.fontSize,
        fontWeight: tokens.text.label.fontWeight,
        color: tokens.color.text_muted,
        textTransform: tokens.text.label.textTransform,
        letterSpacing: tokens.text.label.letterSpacing,
        marginBottom: tokens.spacing.stack_sm,
      }}
    >
      {text}
    </div>
  )
}
