/**
 * ============================================================================
 * CASAL NO AZUL — DESIGN TOKENS (PROPOSTA)
 * ============================================================================
 *
 * Arquivo de tokens em 3 camadas seguindo o modelo Material Design /
 * Style Dictionary (https://m3.material.io/foundations/design-tokens/overview):
 *
 *   1. PRIMITIVE  — valores crus, marca-agnósticos (paleta completa, escalas)
 *   2. SEMANTIC   — mapeia primitivos para INTENÇÃO de uso (--color-person-a)
 *   3. COMPONENT  — opcional, tokens específicos de componente
 *
 * Regra de ouro: COMPONENTES nunca importam PRIMITIVE diretamente.
 * Sempre via SEMANTIC. Isso é o que destrava dark mode e rebrand sem refactor.
 *
 * Escalas matemáticas adotadas:
 *   • Spacing: 4pt grid (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
 *   • Type:    Modular ratio 1.125 (Major Second) ancorado em 14px
 *              → 10, 11, 13, 14, 16, 18, 20, 24, 28, 32, 40, 52
 *              (mantém compat com uso atual onde fontSize:15 vira 16)
 *   • Radius:  sm 8 / md 12 / lg 16 / xl 20 / pill 999
 *   • Shadow:  sm / md / lg / focus
 *   • Z:       0 base → 1000 toast
 *
 * Refs: Brad Frost (Atomic Design), Alina Wheeler (Designing Brand Identity),
 * Material Design 3 token spec, Tailwind CSS color naming.
 * ============================================================================
 */

// ============================================================================
// 1. PRIMITIVE TOKENS — paleta crua, sem semântica
// ============================================================================

export const primitive = {
  // ── Paleta de cores (escala 50 → 900 estilo Tailwind) ────────────────────
  color: {
    // Coral (era #FF6B6B — cor da Pessoa A)
    coral: {
      50:  '#fff5f5',  // bg suave
      100: '#ffe3e3',
      200: '#ffc9c9',
      300: '#ffa8a8',
      400: '#ff8787',
      500: '#FF6B6B',  // ★ valor atual (Pessoa A / brand primária)
      600: '#fa5252',
      700: '#e03131',
      800: '#c92a2a',
      900: '#a51111',
    },

    // Teal (era #4ECDC4 — cor da Pessoa B)
    teal: {
      50:  '#f0fffe',  // bg suave
      100: '#c3fbf8',
      200: '#96f5ef',
      300: '#69eee5',
      400: '#4ECDC4',  // ★ valor atual (Pessoa B)
      500: '#26b5ac',
      600: '#1d9b93',
      700: '#16807a',
      800: '#0e6661',
      900: '#073b38',
    },

    // Violet (era #8b5cf6 / #a78bfa — fixos & focus de input)
    violet: {
      50:  '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',  // ★ usado em pessoal gradient
      500: '#8b5cf6',  // ★ COLOR_FIXED / focus
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#a855f7',  // (mistura usada em gradient roxo)
      900: '#4c1d95',
    },

    // Amber (era #f59e0b — parcelas/installments)
    amber: {
      50:  '#fffbeb',  // ★ bg preview parcelas
      100: '#fef3c7',
      200: '#fde68a',  // ★ border preview
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // ★ COLOR_INST
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',  // ★ texto sobre amber-50
      900: '#78350f',
    },

    // Orange (era #fb923c — gradiente parcelas)
    orange: {
      400: '#fb923c',  // ★ usado no gradient
      500: '#f97316',
    },

    // Blue (era #60a5fa — gradiente pessoal)
    blue: {
      400: '#60a5fa',  // ★ usado no gradient pessoal
      500: '#3b82f6',
    },

    // Green / success (era #22c55e — comprometimento OK)
    green: {
      50:  '#f0fdf4',  // ★ bg parcelas quitadas
      100: '#dcfce7',
      200: '#bbf7d0',  // ★ border quitadas
      400: '#4ade80',
      500: '#22c55e',  // ★ status OK
      600: '#16a34a',
    },

    // Neutros (cinzas — eram #aaa #888 #555 #333 #ccc #ddd etc espalhados)
    neutral: {
      0:   '#ffffff',  // ★ #fff
      50:  '#f7f7f8',  // ★ bg do app
      100: '#f5f5f5',  // ★ dividers leves
      200: '#f0f0f0',  // ★ borders & track de progress
      300: '#e8e8e8',  // ★ borders de input
      400: '#ddd',     // ★ texto desabilitado
      500: '#ccc',     // ★ placeholder/empty
      600: '#aaa',     // ★ texto muted (mais usado!)
      700: '#888',     // ★ texto secundário
      800: '#555',     // ★ texto label
      850: '#333',     // ★ texto sobre bg cinza
      900: '#999',     // (intermediário)
      950: '#000000',
    },

    // Alpha overlays (sombras — eram #0000000a)
    overlay: {
      black04: 'rgba(0,0,0,0.04)',   // ★ shadow color principal (#0000000a)
      black08: 'rgba(0,0,0,0.08)',
      black12: 'rgba(0,0,0,0.12)',
    },
  },

  // ── Spacing scale (4pt grid) ─────────────────────────────────────────────
  // Resolve a bagunça de '11px 14px' / '12px 14px' / '14px 16px' / '14px 18px'
  // Snap pra valores do grid.
  space: {
    0:  '0',
    1:  '2px',
    2:  '4px',
    3:  '6px',
    4:  '8px',
    5:  '10px',
    6:  '12px',
    7:  '14px',   // mantém pra compat (era padding-x mais comum)
    8:  '16px',
    9:  '18px',
    10: '20px',
    11: '22px',
    12: '24px',
    14: '28px',
    16: '32px',
    20: '40px',
    24: '48px',
    32: '64px',
  },

  // ── Type scale (modular 1.125 ancorada em 14px) ──────────────────────────
  fontSize: {
    '2xs': '10px',  // ★ uppercase labels
    xs:    '11px',  // ★ meta info
    sm:    '12px',  // ★ helper text
    base:  '13px',  // ★ body padrão
    md:    '14px',  // ★ body grande
    lg:    '15px',  // ★ body destacado (MAIS USADO)
    xl:    '16px',  // ★ subtítulos
    '2xl': '17px',  // ★ headings de card
    '3xl': '18px',
    '4xl': '20px',
    '5xl': '24px',
    '6xl': '26px',
    '7xl': '28px',
    '8xl': '32px',
    display: '40px',
    hero:    '52px',
  },

  fontWeight: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold: 800,  // ★ MAIS USADO (39 ocorrências)
    black:    900,
  },

  fontFamily: {
    // IMPORTANTE: migrar para next/font/google em produção
    // (next/font/google evita FOUC + CLS dos @import do CSS atual)
    sans:    "'DM Sans', system-ui, -apple-system, sans-serif",
    display: "'Poppins', system-ui, -apple-system, sans-serif",
  },

  lineHeight: {
    tight:   1.1,   // headings grandes
    snug:    1.25,
    normal:  1.5,   // body
    relaxed: 1.6,
  },

  letterSpacing: {
    tight:  '-0.02em',
    normal: '0',
    wide:   '0.05em',
    wider:  '0.1em',   // ★ uppercase labels (letterSpacing: 1)
  },

  // ── Radius scale ─────────────────────────────────────────────────────────
  // Resolve borderRadius: 8 / 10 / 12 / 14 / 16 / 18 / 20 / 99
  radius: {
    none: '0',
    sm:   '8px',    // ★ buttons pequenos, chips
    md:   '12px',   // ★ inputs, cards internos (mais usado)
    lg:   '14px',   // ★ buttons grandes, cards aninhados
    xl:   '16px',   // ★ cards principais (MAIS USADO — 9x)
    '2xl': '18px',  // ★ cards expandidos
    '3xl': '20px',  // ★ cards grandes (Card.tsx)
    pill: '999px',  // ★ progress bars, tags arredondadas
  },

  // ── Shadow scale ─────────────────────────────────────────────────────────
  shadow: {
    none: 'none',
    sm:   '0 2px 10px rgba(0,0,0,0.04)',   // ★ cards internos (era 0 2px 10px #0000000a)
    md:   '0 2px 12px rgba(0,0,0,0.04)',   // ★ header
    lg:   '0 4px 24px rgba(0,0,0,0.04)',   // ★ Card principal
    up:   '0 -4px 20px rgba(0,0,0,0.04)',  // ★ bottom nav (sombra invertida)
    avatar: (color: string) => `0 4px 12px ${color}55`, // sombra colorida do Avatar
    focus: '0 0 0 3px rgba(139,92,246,0.25)', // novo — anel de foco a11y
  },

  // ── Z-index scale ────────────────────────────────────────────────────────
  zIndex: {
    base:    0,
    raised:  10,
    sticky:  100,
    nav:     200,
    overlay: 500,
    modal:   600,
    popover: 700,
    toast:   1000,
  },

  // ── Motion ───────────────────────────────────────────────────────────────
  duration: {
    instant: '0ms',
    fast:    '150ms',
    base:    '200ms',  // ★ default (era 0.2s)
    slow:    '300ms',
    slower:  '600ms',  // progress bar
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',  // ★ Material standard (já usado no ProgressBar)
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },

  // ── Breakpoints (mobile-first) ───────────────────────────────────────────
  breakpoint: {
    sm: '480px',   // ★ container max do app
    md: '768px',
    lg: '1024px',
  },
} as const

// ============================================================================
// 2. SEMANTIC TOKENS — INTENÇÃO de uso (a interface que componentes consomem)
// ============================================================================
// Dark mode = trocar este objeto. Componentes nunca mudam.

const p = primitive // alias curto

export const semantic = {
  // ── Brand & identidade do casal ──────────────────────────────────────────
  color: {
    // Identidade das pessoas (núcleo do produto)
    personA: p.color.coral[500],          // #FF6B6B
    personA_bg: p.color.coral[50],        // #fff5f5  — bg suave
    personA_border: p.color.coral[500] + '33', // 20% alpha
    personB: p.color.teal[400],           // #4ECDC4
    personB_bg: p.color.teal[50],         // #f0fffe
    personB_border: p.color.teal[400] + '33',

    // Categorias de despesa (verticais funcionais)
    fixed:      p.color.violet[500],      // #8b5cf6 — fixos
    fixed_bg:   p.color.violet[50],
    installment: p.color.amber[500],      // #f59e0b — parcelas
    installment_bg: p.color.amber[50],
    personal:   p.color.violet[400],      // #a78bfa — pessoal

    // Brand
    brand:      p.color.coral[500],       // usar coral como "primary" do app
    brandGradient: `linear-gradient(90deg, ${p.color.coral[500]}, ${p.color.teal[400]})`,

    // Status (feedback)
    success:    p.color.green[500],       // #22c55e
    success_bg: p.color.green[50],        // #f0fdf4
    success_border: p.color.green[200],   // #bbf7d0
    warning:    p.color.amber[500],
    warning_bg: p.color.amber[50],
    warning_border: p.color.amber[200],
    warning_text:   p.color.amber[800],   // #92400e
    danger:     p.color.coral[500],       // reusa coral pra "alto comprometimento"
    danger_bg:  p.color.coral[50],

    // Backgrounds & superfícies
    bg_app:       p.color.neutral[50],    // #f7f7f8
    bg_card:      p.color.neutral[0],     // #fff
    bg_card_muted: p.color.neutral[100],  // pausados
    bg_overlay:   'rgba(0,0,0,0.5)',

    // Textos
    text_primary:    p.color.neutral[950], // #000 (raramente usado — herdamos #333)
    text_heading:    p.color.neutral[850], // #333
    text_body:       p.color.neutral[800], // #555
    text_secondary:  p.color.neutral[700], // #888
    text_muted:      p.color.neutral[600], // #aaa — MAIS USADO
    text_placeholder: p.color.neutral[500],// #ccc
    text_disabled:   p.color.neutral[400], // #ddd
    text_onBrand:    p.color.neutral[0],   // #fff sobre coral/teal

    // Borders
    border_default: p.color.neutral[300], // #e8e8e8
    border_subtle:  p.color.neutral[200], // #f0f0f0
    border_divider: p.color.neutral[100], // #f5f5f5
    border_focus:   p.color.violet[500],  // #8b5cf6 — anel de foco
  },

  // ── Tipografia semântica ─────────────────────────────────────────────────
  text: {
    // Display (hero do setup)
    display: {
      fontFamily: p.fontFamily.display,
      fontSize:   p.fontSize.hero,
      fontWeight: p.fontWeight.black,
      lineHeight: p.lineHeight.tight,
    },
    // H1 — título de card grande
    h1: {
      fontFamily: p.fontFamily.sans,
      fontSize:   p.fontSize['2xl'],   // 17
      fontWeight: p.fontWeight.extrabold,
      lineHeight: p.lineHeight.snug,
    },
    // H2 — subtítulo de seção
    h2: {
      fontFamily: p.fontFamily.sans,
      fontSize:   p.fontSize.xl,        // 16
      fontWeight: p.fontWeight.extrabold,
      lineHeight: p.lineHeight.snug,
    },
    // Body
    body: {
      fontFamily: p.fontFamily.sans,
      fontSize:   p.fontSize.md,        // 14
      fontWeight: p.fontWeight.regular,
      lineHeight: p.lineHeight.normal,
    },
    bodyEmphasis: {
      fontFamily: p.fontFamily.sans,
      fontSize:   p.fontSize.lg,        // 15
      fontWeight: p.fontWeight.bold,
    },
    // Label uppercase (Lbl component)
    label: {
      fontFamily: p.fontFamily.sans,
      fontSize:   p.fontSize.sm,        // 12
      fontWeight: p.fontWeight.bold,
      letterSpacing: p.letterSpacing.wider,
      textTransform: 'uppercase' as const,
    },
    // Helper / meta info
    caption: {
      fontFamily: p.fontFamily.sans,
      fontSize:   p.fontSize.xs,        // 11
      fontWeight: p.fontWeight.regular,
    },
    // Valor monetário grande (dashboard "quem deve")
    money: {
      fontFamily: p.fontFamily.display,
      fontSize:   p.fontSize['6xl'],    // 26
      fontWeight: p.fontWeight.black,
    },
  },

  // ── Spacing semântico ────────────────────────────────────────────────────
  // Mapeia INTENÇÃO ("padding interno de card") → valor do grid
  spacing: {
    // Stack (vertical)
    stack_xs: p.space[2],   // 4
    stack_sm: p.space[4],   // 8
    stack_md: p.space[5],   // 10
    stack_lg: p.space[8],   // 16
    stack_xl: p.space[12],  // 24
    // Inline (horizontal)
    inline_xs: p.space[2],
    inline_sm: p.space[3],  // 6
    inline_md: p.space[4],  // 8
    inline_lg: p.space[6],  // 12
    // Inset (padding interno)
    inset_sm:  p.space[6],  // 12 — chips/tags
    inset_md:  p.space[7],  // 14 — input padding-x
    inset_lg:  p.space[8],  // 16
    inset_xl:  p.space[10], // 20 — Card principal
  },

  radius: {
    chip:     p.radius.pill,
    button:   p.radius.lg,
    buttonSm: p.radius.md,
    input:    p.radius.md,
    card:     p.radius['3xl'],   // 20 — Card padrão
    cardSm:   p.radius.xl,       // 16 — card aninhado
    bannerGradient: p.radius.xl,
    progressBar:    p.radius.pill,
  },

  shadow: {
    card:      p.shadow.lg,
    cardSubtle: p.shadow.sm,
    header:    p.shadow.md,
    bottomNav: p.shadow.up,
    focusRing: p.shadow.focus,
    avatar:    p.shadow.avatar,
  },

  motion: {
    interaction: `all ${p.duration.base} ${p.easing.standard}`,
    progress:    `width ${p.duration.slower} ${p.easing.standard}`,
    inputFocus:  `border-color ${p.duration.base} ${p.easing.standard}`,
  },
} as const

// ============================================================================
// 3. COMPONENT TOKENS — específicos de componente (opcional)
// ============================================================================
// Use quando o componente tem decisões de design próprias que merecem ser
// tipadas (ex: tamanhos discretos de Button).

export const component = {
  button: {
    height: {
      sm: '32px',   // small (era padding 7px 14px = ~32px de altura)
      md: '44px',   // padrão (mobile a11y mínimo iOS — 44pt tap target)
    },
    paddingX: {
      sm: p.space[7],   // 14
      md: p.space[11],  // 22
    },
    fontSize: {
      sm: p.fontSize.base, // 13
      md: p.fontSize.lg,   // 15
    },
    radius: {
      sm: p.radius.md,
      md: p.radius.lg,
    },
  },

  input: {
    height: '44px',          // tap target
    paddingX: p.space[7],    // 14
    paddingY: p.space[6],    // ~12 (era 11px — snap)
    fontSize: p.fontSize.md, // 14
    radius:   p.radius.md,   // 12
    borderWidth: '1.5px',
  },

  card: {
    paddingX: p.space[11], // 22
    paddingY: p.space[10], // 20
    radius:   p.radius['3xl'], // 20
    borderWidth: '1.5px',
    marginBottom: p.space[8], // 16
  },

  tag: {
    paddingX: p.space[5],   // 10
    paddingY: p.space[1],   // 2
    fontSize: p.fontSize.sm, // 12
    radius:   p.radius.pill,
    borderWidth: '1px',
  },

  avatar: {
    sizeSm: 28,
    sizeMd: 34,
    sizeLg: 40,  // default
  },

  progressBar: {
    height: '10px',
    radius: p.radius.pill,
  },

  bottomNav: {
    paddingTop:    p.space[4],  // 8
    paddingBottom: p.space[7],  // 14 (safe-area)
    iconSize:      p.fontSize['3xl'], // 18
    labelSize:     p.fontSize['2xs'], // 10
  },
} as const

// ============================================================================
// EXPORT principal — uso recomendado
// ============================================================================
// import { tokens } from '@/lib/tokens'
// <div style={{ padding: tokens.spacing.inset_xl, color: tokens.color.text_muted }} />

export const tokens = {
  ...semantic,
  component,
  primitive,
} as const

export type Tokens = typeof tokens

// ============================================================================
// CSS CUSTOM PROPERTIES — quando migrar pra CSS Modules / global stylesheet
// ============================================================================
// Cole no globals.css dentro de :root { ... } e copie de novo dentro de
// @media (prefers-color-scheme: dark) com os mesmos NOMES e valores trocados.
//
// :root {
//   --color-person-a: #FF6B6B;
//   --color-person-b: #4ECDC4;
//   --color-fixed: #8b5cf6;
//   --color-installment: #f59e0b;
//   --color-success: #22c55e;
//   --color-bg-app: #f7f7f8;
//   --color-bg-card: #ffffff;
//   --color-text-muted: #aaaaaa;
//   ...
//   --space-4: 8px;
//   --space-8: 16px;
//   ...
//   --radius-md: 12px;
//   --radius-xl: 16px;
//   ...
//   --shadow-card: 0 4px 24px rgba(0,0,0,0.04);
// }
//
// @media (prefers-color-scheme: dark) {
//   :root {
//     --color-bg-app:  #0a0a0c;
//     --color-bg-card: #18181b;
//     --color-text-muted: #71717a;
//     --color-border-subtle: #27272a;
//     /* personA/personB MANTÊM a cor — identidade do usuário */
//   }
// }
