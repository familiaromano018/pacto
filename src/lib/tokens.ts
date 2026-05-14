/**
 * Design tokens — Casal no Azul
 *
 * 3 camadas: PRIMITIVE (valores crus) → SEMANTIC (intenção, via CSS vars) → COMPONENT.
 * Semantic colors retornam `var(--xxx)` (resolvidos em runtime → dark mode automático).
 * Spacing / radius / fontSize não mudam por tema, então ficam como strings estáticas.
 *
 * Componentes consomem APENAS semantic ou component. Nunca primitive direto.
 */

// ── PRIMITIVE (escalas — não mudam por tema) ──────────────────────────────────

export const primitive = {
  space: {
    0: '0',
    1: '2px',
    2: '4px',
    3: '6px',
    4: '8px',
    5: '10px',
    6: '12px',
    7: '14px',
    8: '16px',
    9: '18px',
    10: '20px',
    11: '22px',
    12: '24px',
    14: '28px',
    16: '32px',
    20: '40px',
    24: '48px',
    32: '64px',
  },
  fontSize: {
    '2xs': '10px',
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '15px',
    xl: '16px',
    '2xl': '17px',
    '3xl': '18px',
    '4xl': '20px',
    '5xl': '24px',
    '6xl': '26px',
    '7xl': '28px',
    '8xl': '32px',
    display: '40px',
    hero: '52px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    display: "'Inter', system-ui, -apple-system, sans-serif",
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
  },
  radius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '14px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '20px',
    pill: '999px',
  },
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '600ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  zIndex: {
    base: 0,
    raised: 10,
    sticky: 100,
    nav: 200,
    overlay: 500,
    modal: 600,
    popover: 700,
    toast: 1000,
  },
  breakpoint: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
  },
} as const

// ── SEMANTIC (cores via CSS vars → dark mode automático) ──────────────────────

export const semantic = {
  color: {
    personA: 'var(--color-person-a)',
    personA_bg: 'var(--color-person-a-bg)',
    personB: 'var(--color-person-b)',
    personB_bg: 'var(--color-person-b-bg)',
    fixed: 'var(--color-fixed)',
    fixed_bg: 'var(--color-fixed-bg)',
    installment: 'var(--color-installment)',
    installment_bg: 'var(--color-installment-bg)',
    personal: 'var(--color-personal)',
    brand: 'var(--color-brand)',

    success: 'var(--color-success)',
    success_bg: 'var(--color-success-bg)',
    success_border: 'var(--color-success-border)',
    warning: 'var(--color-warning)',
    warning_bg: 'var(--color-warning-bg)',
    warning_border: 'var(--color-warning-border)',
    warning_text: 'var(--color-warning-text)',
    danger: 'var(--color-danger)',
    danger_bg: 'var(--color-danger-bg)',

    bg_app: 'var(--color-bg-app)',
    bg_card: 'var(--color-bg-card)',
    bg_card_muted: 'var(--color-bg-card-muted)',
    bg_overlay: 'var(--color-bg-overlay)',
    bg_elevated: 'var(--color-bg-elevated)',

    text_primary: 'var(--color-text-primary)',
    text_heading: 'var(--color-text-heading)',
    text_body: 'var(--color-text-body)',
    text_secondary: 'var(--color-text-secondary)',
    text_muted: 'var(--color-text-muted)',
    text_placeholder: 'var(--color-text-placeholder)',
    text_disabled: 'var(--color-text-disabled)',
    text_onBrand: 'var(--color-text-on-brand)',

    border_default: 'var(--color-border-default)',
    border_subtle: 'var(--color-border-subtle)',
    border_divider: 'var(--color-border-divider)',
    border_focus: 'var(--color-border-focus)',
  },

  text: {
    display: {
      fontFamily: primitive.fontFamily.display,
      fontSize: primitive.fontSize.hero,
      fontWeight: primitive.fontWeight.black,
      lineHeight: primitive.lineHeight.tight,
    },
    h1: {
      fontFamily: primitive.fontFamily.sans,
      fontSize: primitive.fontSize['2xl'],
      fontWeight: primitive.fontWeight.extrabold,
      lineHeight: primitive.lineHeight.snug,
    },
    h2: {
      fontFamily: primitive.fontFamily.sans,
      fontSize: primitive.fontSize.xl,
      fontWeight: primitive.fontWeight.extrabold,
      lineHeight: primitive.lineHeight.snug,
    },
    body: {
      fontFamily: primitive.fontFamily.sans,
      fontSize: primitive.fontSize.md,
      fontWeight: primitive.fontWeight.regular,
      lineHeight: primitive.lineHeight.normal,
    },
    bodyEmphasis: {
      fontFamily: primitive.fontFamily.sans,
      fontSize: primitive.fontSize.lg,
      fontWeight: primitive.fontWeight.bold,
    },
    label: {
      fontFamily: primitive.fontFamily.sans,
      fontSize: primitive.fontSize.sm,
      fontWeight: primitive.fontWeight.bold,
      letterSpacing: primitive.letterSpacing.wider,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontFamily: primitive.fontFamily.sans,
      fontSize: primitive.fontSize.xs,
      fontWeight: primitive.fontWeight.regular,
    },
    money: {
      fontFamily: primitive.fontFamily.display,
      fontSize: primitive.fontSize['6xl'],
      fontWeight: primitive.fontWeight.black,
    },
  },

  spacing: {
    stack_xs: primitive.space[2],
    stack_sm: primitive.space[4],
    stack_md: primitive.space[5],
    stack_lg: primitive.space[8],
    stack_xl: primitive.space[12],
    inline_xs: primitive.space[2],
    inline_sm: primitive.space[3],
    inline_md: primitive.space[4],
    inline_lg: primitive.space[6],
    inset_sm: primitive.space[6],
    inset_md: primitive.space[7],
    inset_lg: primitive.space[8],
    inset_xl: primitive.space[10],
  },

  radius: {
    chip: primitive.radius.pill,
    button: primitive.radius.lg,
    buttonSm: primitive.radius.md,
    input: primitive.radius.md,
    card: primitive.radius['3xl'],
    cardSm: primitive.radius.xl,
    bannerGradient: primitive.radius.xl,
    progressBar: primitive.radius.pill,
  },

  shadow: {
    card: 'var(--shadow-card)',
    cardSubtle: 'var(--shadow-sm)',
    header: 'var(--shadow-header)',
    bottomNav: 'var(--shadow-bottom-nav)',
    focusRing: 'var(--shadow-focus)',
    avatar: (color: string) => `0 4px 12px ${color}55`,
  },

  motion: {
    interaction: `all ${primitive.duration.base} ${primitive.easing.standard}`,
    progress: `width ${primitive.duration.slower} ${primitive.easing.standard}`,
    inputFocus: `border-color ${primitive.duration.base} ${primitive.easing.standard}`,
  },
} as const

// ── COMPONENT TOKENS ──────────────────────────────────────────────────────────

export const component = {
  button: {
    height: { sm: '32px', md: '44px' },
    paddingX: { sm: primitive.space[7], md: primitive.space[11] },
    fontSize: { sm: primitive.fontSize.base, md: primitive.fontSize.lg },
    radius: { sm: primitive.radius.md, md: primitive.radius.lg },
  },
  input: {
    height: '44px',
    paddingX: primitive.space[7],
    paddingY: primitive.space[6],
    fontSize: primitive.fontSize.md,
    radius: primitive.radius.md,
    borderWidth: '1.5px',
  },
  card: {
    paddingX: primitive.space[11],
    paddingY: primitive.space[10],
    radius: primitive.radius['3xl'],
    borderWidth: '1.5px',
    marginBottom: primitive.space[8],
  },
  tag: {
    paddingX: primitive.space[5],
    paddingY: primitive.space[1],
    fontSize: primitive.fontSize.sm,
    radius: primitive.radius.pill,
    borderWidth: '1px',
  },
  avatar: {
    sizeSm: 28,
    sizeMd: 34,
    sizeLg: 40,
  },
  progressBar: {
    height: '10px',
    radius: primitive.radius.pill,
  },
  bottomNav: {
    paddingTop: primitive.space[4],
    paddingBottom: primitive.space[7],
    iconSize: primitive.fontSize['3xl'],
    labelSize: primitive.fontSize['2xs'],
  },
} as const

export const tokens = {
  color: semantic.color,
  text: semantic.text,
  spacing: semantic.spacing,
  radius: semantic.radius,
  shadow: semantic.shadow,
  motion: semantic.motion,
  component,
  primitive,
} as const

export type Tokens = typeof tokens
