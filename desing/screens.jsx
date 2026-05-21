// Underground KB Mobile — Screen components
// All dark mode. Slate base + orange accent.

const { useState, useEffect, useRef, useMemo, Fragment } = React;

// ────────────────────────────────────────────────────────────────────────────
// Tokens
// ────────────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0f172a',
  bgDeep: '#080d18',
  card: '#1e293b',
  cardHi: '#27344a',
  border: '#334155',
  borderSoft: '#1e2a3f',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  textMute: '#64748b',
  accent: '#f97316',
  accentDeep: '#c2410c',
  accentSoft: 'rgba(249,115,22,0.14)',
  good: '#10b981',
  bad: '#ef4444',
  font: '"Manrope", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
};

// ────────────────────────────────────────────────────────────────────────────
// Icon set — outline + filled variants, Ionicons-style
// ────────────────────────────────────────────────────────────────────────────
const I = {
  // outline
  home: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3.5l9 7V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  homeF: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M3 10.5L12 3.5l9 7V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"/>
    </svg>
  ),
  kettlebell: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M9 4h6a1.5 1.5 0 010 3h-0.4a6 6 0 11-5.2 0H9a1.5 1.5 0 010-3z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  kettlebellF: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M9 4h6a1.5 1.5 0 010 3h-0.4a6 6 0 11-5.2 0H9a1.5 1.5 0 010-3z"/>
    </svg>
  ),
  pulse: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h4l2-6 4 12 2-6h6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  pulseF: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h4l2-6 4 12 2-6h6" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trendUp: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 17l6-6 4 4 8-9M14 6h6v6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trendUpF: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 17l6-6 4 4 8-9M14 6h6v6" stroke={c} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  person: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.7"/>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  personF: (s=24, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.7" fill={c}/>
    </svg>
  ),
  // ui
  chevR: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevL: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  check: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M4 12.5l5 5 11-12" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  play: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M6 4l14 8-14 8z"/>
    </svg>
  ),
  pause: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
  ),
  scale: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke={c} strokeWidth="1.7"/>
      <path d="M8 9h8M12 9v3" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  drop: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3s-7 8-7 13a7 7 0 0014 0c0-5-7-13-7-13z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  target: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="5" stroke={c} strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="1.5" fill={c}/>
    </svg>
  ),
  flame: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3c1 4 5 5 5 10a5 5 0 11-10 0c0-3 2-4 2-7 2 1 3 0 3-3z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  clock: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.7"/>
      <path d="M12 7v5l3 2" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  arrowU: (s=14, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5M5 12l7-7 7 7" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowD: (s=14, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12l7 7 7-7" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  more: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
    </svg>
  ),
  edit: (s=20, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16v4z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  close: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  bolt: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  ruler: (s=22, c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="9" width="20" height="6" rx="1" transform="rotate(-30 12 12)" stroke={c} strokeWidth="1.7"/>
      <path d="M8 10v2M11 8.5v2M14 7v2M17 5.5v2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// ────────────────────────────────────────────────────────────────────────────
// Common chrome
// ────────────────────────────────────────────────────────────────────────────
function StatusBarDark() {
  return (
    <div style={{
      height: 54, display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', padding: '0 28px 6px',
      color: T.text, fontFamily: T.font, position: 'relative', zIndex: 30,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}>9:41</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={T.text}/>
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={T.text}/>
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={T.text}/>
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={T.text}/>
        </svg>
        <svg width="15" height="11" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={T.text}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={T.text}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={T.text}/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={T.text} strokeOpacity="0.4" fill="none"/>
          <rect x="2" y="2" width="16" height="9" rx="2" fill={T.text}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={T.text} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: I.home, iconF: I.homeF },
  { key: 'workouts',  label: 'Edzések',   icon: I.kettlebell, iconF: I.kettlebellF },
  { key: 'measure',   label: 'Mérések',   icon: I.pulse,  iconF: I.pulseF },
  { key: 'progress',  label: 'Fejlődés',  icon: I.trendUp, iconF: I.trendUpF },
  { key: 'profile',   label: 'Profil',    icon: I.person, iconF: I.personF },
];

function BottomTabs({ active, onChange }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      paddingBottom: 22, paddingTop: 8,
      background: 'linear-gradient(to top, ' + T.bg + ' 60%, rgba(15,23,42,0.85) 85%, rgba(15,23,42,0))',
      borderTop: '1px solid ' + T.borderSoft,
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
      paddingLeft: 8, paddingRight: 8,
    }}>
      {TABS.map(t => {
        const isActive = active === t.key;
        const Icon = isActive ? t.iconF : t.icon;
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            style={{
              all: 'unset', cursor: 'pointer', flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 0', color: isActive ? T.accent : T.textMute,
              transition: 'color .15s',
            }}>
            {Icon(24, isActive ? T.accent : T.textMute)}
            <span style={{
              fontFamily: T.font, fontSize: 10.5, fontWeight: isActive ? 700 : 500,
              letterSpacing: 0.2,
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{
      position: 'absolute', bottom: 6, left: 0, right: 0, zIndex: 70,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{ width: 134, height: 4.5, borderRadius: 4, background: 'rgba(255,255,255,0.5)' }} />
    </div>
  );
}

// Header used inside tabs (large title)
function TabHeader({ title, subtitle, right }) {
  return (
    <div style={{ padding: '4px 20px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        {subtitle && <div style={{
          fontFamily: T.font, fontSize: 12.5, fontWeight: 600, letterSpacing: 1.4,
          textTransform: 'uppercase', color: T.textMute, marginBottom: 6,
        }}>{subtitle}</div>}
        <h1 style={{
          margin: 0, fontFamily: T.font, fontSize: 30, fontWeight: 800,
          color: T.text, letterSpacing: -0.6, lineHeight: 1.05,
        }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// Card primitive
function Card({ children, style, padding = 18, onClick, accent = false }) {
  return (
    <div onClick={onClick}
      style={{
        background: T.card, borderRadius: 16, padding,
        border: '1px solid ' + T.borderSoft,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...(accent ? { borderColor: 'rgba(249,115,22,0.35)' } : {}),
        ...style,
      }}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ────────────────────────────────────────────────────────────────────────────
function Dashboard({ go }) {
  return (
    <div style={{ paddingBottom: 110, color: T.text }}>
      {/* Greeting */}
      <div style={{ padding: '8px 20px 22px' }}>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.textMute, fontWeight: 600, marginBottom: 6 }}>
          Csütörtök, máj. 21
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: T.font, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            Szia, Márton
          </h1>
          <span style={{ fontSize: 26 }}>👊</span>
        </div>
        <div style={{ fontFamily: T.font, fontSize: 14, color: T.textDim, marginTop: 4 }}>
          Készen állsz a 12. hétre?
        </div>
      </div>

      {/* Stat cards row */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
        <StatTile icon={I.scale} label="Testsúly" value="84.2" unit="kg" delta={-0.6} />
        <StatTile icon={I.drop}  label="Testzsír" value="14.8" unit="%" delta={-0.4} />
        <StatTile icon={I.target} label="FMS" value="17" unit="/21" delta={+2} />
      </div>

      {/* Recent workout */}
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <SectionLabel>Legutóbbi edzés</SectionLabel>
        <Card padding={0}>
          <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: T.accentSoft, color: T.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{I.kettlebellF(28, T.accent)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 16, marginBottom: 3 }}>
                Snatch Test + Strength
              </div>
              <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.textDim, display: 'flex', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{I.clock(13, T.textMute)} 48 perc</span>
                <span>·</span>
                <span>Tegnap</span>
              </div>
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid ' + T.borderSoft,
          }}>
            <MiniStat label="Volume" value="4 280" unit="kg" />
            <MiniStat label="Szettek" value="24" unit="" border />
            <MiniStat label="Ismétlés" value="312" unit="" />
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Gyors műveletek</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <QuickAction
            primary
            icon={I.bolt}
            title="Edzés indítása"
            subtitle="Heti terv: B nap"
            onClick={() => go('active')}
          />
          <QuickAction
            icon={I.plus}
            title="Mérés felvétele"
            subtitle="Testkompo"
            onClick={() => go('bodycomp')}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, unit, delta }) {
  const up = delta >= 0;
  // For body fat & weight, lower is generally better - but we just show direction-color neutrally for this mock.
  const goodForDown = label === 'Testzsír' || label === 'Testsúly';
  const isGood = goodForDown ? delta < 0 : delta > 0;
  const dColor = delta === 0 ? T.textMute : isGood ? T.good : T.bad;
  return (
    <div style={{
      background: T.card, borderRadius: 14, padding: '12px 11px 13px',
      border: '1px solid ' + T.borderSoft,
    }}>
      <div style={{ color: T.accent, marginBottom: 8 }}>{icon(20, T.accent)}</div>
      <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1, letterSpacing: -0.5 }}>
        {value}<span style={{ fontSize: 12, color: T.textDim, fontWeight: 600, marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.textMute, fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: dColor, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {up ? I.arrowU(10, dColor) : I.arrowD(10, dColor)}{Math.abs(delta)}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, border }) {
  return (
    <div style={{
      padding: '10px 10px 12px',
      borderLeft: border ? '1px solid ' + T.borderSoft : 'none',
      borderRight: border ? '1px solid ' + T.borderSoft : 'none',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: T.font, fontSize: 10.5, color: T.textMute, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.text }}>
        {value}{unit && <span style={{ fontSize: 10, color: T.textDim, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, primary, onClick }) {
  const bg = primary ? T.accent : T.card;
  const fg = primary ? '#fff' : T.text;
  const sub = primary ? 'rgba(255,255,255,0.85)' : T.textDim;
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      background: bg, borderRadius: 16, padding: '16px 14px',
      border: primary ? 'none' : '1px solid ' + T.borderSoft,
      minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: primary ? '0 8px 20px -8px rgba(249,115,22,0.6)' : 'none',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: primary ? 'rgba(255,255,255,0.18)' : T.accentSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon(20, primary ? '#fff' : T.accent)}</div>
      <div>
        <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: fg, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontFamily: T.font, fontSize: 12, color: sub, marginTop: 2 }}>{subtitle}</div>
      </div>
    </button>
  );
}

function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{
        fontFamily: T.font, fontSize: 12, fontWeight: 700, letterSpacing: 1.3,
        textTransform: 'uppercase', color: T.textMute,
      }}>{children}</div>
      {right}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MÉRÉSEK TAB
// ────────────────────────────────────────────────────────────────────────────
function MeasureTab({ go }) {
  const history = [
    { d: 'május 18.', type: 'Testkompo', val: '84.2 kg · 14.8%' },
    { d: 'május 4.',  type: 'Testkompo', val: '84.8 kg · 15.2%' },
    { d: 'április 28.', type: 'FMS felmérés', val: '17 / 21' },
    { d: 'április 20.', type: 'Testkompo', val: '85.4 kg · 15.4%' },
    { d: 'április 6.',  type: 'Testkompo', val: '85.9 kg · 15.6%' },
    { d: 'március 25.', type: 'FMS felmérés', val: '15 / 21' },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <TabHeader subtitle="Áttekintés" title="Mérések" />

      {/* Two large cards */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        <BigMeasureCard
          title="FMS felmérés"
          icon={I.target}
          big="17"
          unit="/21"
          meta="április 28."
          status={{ label: 'JÓ', color: T.good }}
          cta="Új felmérés"
          onClick={() => {}}
        />
        <BigMeasureCard
          title="Testkompo mérés"
          icon={I.scale}
          rows={[
            ['Testsúly', '84.2', 'kg'],
            ['Testzsír', '14.8', '%'],
            ['Izomtömeg', '37.8', 'kg'],
            ['BMI', '23.4', ''],
          ]}
          meta="május 18."
          cta="Új mérés"
          onClick={() => go('bodycomp')}
        />
      </div>

      {/* History */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Előzmények</SectionLabel>
        <Card padding={0}>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderTop: i === 0 ? 'none' : '1px solid ' + T.borderSoft,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: T.accentSoft, color: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {h.type === 'FMS felmérés' ? I.target(18, T.accent) : I.scale(18, T.accent)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.font, fontSize: 14.5, fontWeight: 700, color: T.text }}>{h.type}</div>
                <div style={{ fontFamily: T.font, fontSize: 12, color: T.textDim, marginTop: 2 }}>{h.d}</div>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textDim, marginRight: 6 }}>{h.val}</div>
              {I.chevR(16, T.textMute)}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function BigMeasureCard({ title, icon, big, unit, rows, meta, status, cta, onClick }) {
  return (
    <Card padding={0}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{icon(18, T.accent)}</div>
          <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
        </div>
        <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.textMute }}>{meta}</div>
      </div>

      {big && (
        <div style={{ padding: '6px 16px 14px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: T.mono, fontSize: 42, fontWeight: 700, color: T.text, letterSpacing: -1.5, lineHeight: 1 }}>
            {big}<span style={{ fontSize: 18, color: T.textDim, fontWeight: 600 }}>{unit}</span>
          </div>
          {status && (
            <div style={{
              fontFamily: T.font, fontSize: 11, fontWeight: 700, color: status.color,
              letterSpacing: 1, textTransform: 'uppercase',
              border: '1px solid ' + status.color, padding: '4px 9px', borderRadius: 999,
              background: status.color + '15',
            }}>{status.label}</div>
          )}
        </div>
      )}

      {rows && (
        <div style={{ padding: '6px 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: T.font, fontSize: 12.5, color: T.textDim }}>{r[0]}</span>
              <span style={{ fontFamily: T.mono, fontSize: 15, color: T.text, fontWeight: 700 }}>
                {r[1]}<span style={{ fontSize: 10.5, color: T.textMute, marginLeft: 2, fontWeight: 600 }}>{r[2]}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onClick} style={{
        all: 'unset', cursor: 'pointer', display: 'block',
        margin: '0 16px 14px', padding: '11px 14px',
        background: T.accent, color: '#fff', borderRadius: 11,
        fontFamily: T.font, fontWeight: 700, fontSize: 14, textAlign: 'center',
        letterSpacing: 0.2,
      }}>{cta}</button>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TESTKOMPO FORM
// ────────────────────────────────────────────────────────────────────────────
function BodyCompForm({ go }) {
  const [v, setV] = useState({
    weight: '84.2', bodyfat: '14.8', muscle: '37.8',
    visceral: '7', water: '58.2', bone: '3.6', note: '',
  });
  const bmi = useMemo(() => {
    const w = parseFloat(v.weight);
    if (!w) return '—';
    const h = 1.82;
    return (w / (h*h)).toFixed(1);
  }, [v.weight]);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Title bar w/ close */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 12px' }}>
        <button onClick={() => go('measure')} style={{
          all: 'unset', cursor: 'pointer',
          width: 36, height: 36, borderRadius: 10,
          background: T.card, border: '1px solid ' + T.borderSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.textDim,
        }}>{I.chevL(20, T.textDim)}</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.textMute, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>Új bejegyzés</div>
          <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: -0.4 }}>Testkompo mérés</div>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Testsúly" unit="kg" value={v.weight} onChange={set('weight')} />
        <Field label="Testzsír" unit="%" value={v.bodyfat} onChange={set('bodyfat')} />
        <Field label="Izomtömeg" unit="kg" value={v.muscle} onChange={set('muscle')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Zsigeri zsír" unit="idx" value={v.visceral} onChange={set('visceral')} compact />
          <Field label="Csontmass" unit="kg" value={v.bone} onChange={set('bone')} compact />
        </div>
        <Field label="Testvíz" unit="%" value={v.water} onChange={set('water')} />

        {/* BMI auto card */}
        <div style={{
          background: T.accentSoft, border: '1px solid rgba(249,115,22,0.35)',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.accent, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>BMI (auto)</div>
            <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.textDim, marginTop: 2 }}>Magasság: 182 cm</div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: -0.8 }}>{bmi}</div>
        </div>

        {/* Note */}
        <div>
          <label style={{ fontFamily: T.font, fontSize: 12.5, color: T.textMute, fontWeight: 600, display: 'block', marginBottom: 6, marginLeft: 4 }}>
            Megjegyzés
          </label>
          <textarea
            value={v.note} onChange={set('note')}
            placeholder="Hogy érezted magad? Mit változtatnál?"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: T.bg, border: '1px solid ' + T.border, borderRadius: 12,
              padding: '12px 14px', color: T.text,
              fontFamily: T.font, fontSize: 14, resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        <button onClick={() => go('measure')} style={{
          all: 'unset', cursor: 'pointer', display: 'block', textAlign: 'center',
          marginTop: 6, padding: '14px 16px',
          background: T.accent, color: '#fff', borderRadius: 12,
          fontFamily: T.font, fontWeight: 800, fontSize: 15, letterSpacing: 0.3,
          boxShadow: '0 8px 20px -8px rgba(249,115,22,0.6)',
        }}>Mentés</button>
      </div>
    </div>
  );
}

function Field({ label, unit, value, onChange, compact }) {
  return (
    <div>
      <label style={{
        fontFamily: T.font, fontSize: 12.5, color: T.textMute,
        fontWeight: 600, display: 'block', marginBottom: 6, marginLeft: 4,
      }}>{label}</label>
      <div style={{
        background: T.bg, border: '1px solid ' + T.border, borderRadius: 12,
        display: 'flex', alignItems: 'center', padding: '0 14px',
      }}>
        <input
          value={value} onChange={onChange}
          inputMode="decimal"
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            color: T.text, fontFamily: T.mono, fontSize: compact ? 16 : 18, fontWeight: 700,
            padding: compact ? '11px 0' : '13px 0', letterSpacing: -0.3,
          }}
        />
        <span style={{ fontFamily: T.font, fontSize: 13, color: T.textMute, fontWeight: 600 }}>{unit}</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PROGRESS TAB
// ────────────────────────────────────────────────────────────────────────────
function ProgressTab() {
  const [period, setPeriod] = useState('3h');
  const [metric, setMetric] = useState('weight');
  const periods = [['1h', '1 hó'], ['3h', '3 hó'], ['6h', '6 hó'], ['1e', '1 év']];
  const metrics = [
    { k: 'weight', label: 'Testsúly', unit: 'kg' },
    { k: 'fat', label: 'Testzsír', unit: '%' },
    { k: 'fms', label: 'FMS' },
  ];

  // sample series
  const series = {
    weight: { data: [87.4, 87.1, 86.8, 86.4, 86.0, 85.9, 85.4, 85.2, 84.8, 84.6, 84.4, 84.2], unit: 'kg', goodDown: true },
    fat:    { data: [16.4, 16.2, 16.0, 15.9, 15.6, 15.4, 15.4, 15.2, 15.0, 14.9, 14.8, 14.8], unit: '%', goodDown: true },
    fms:    { data: [13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17], unit: '', goodDown: false, bar: true },
  };
  const m = series[metric];
  const first = m.data[0], last = m.data[m.data.length-1];
  const diff = +(last - first).toFixed(1);
  const dPct = +((diff/first)*100).toFixed(1);

  return (
    <div style={{ paddingBottom: 110 }}>
      <TabHeader subtitle="Időszak" title="Fejlődés" />

      {/* Period chips */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8 }}>
        {periods.map(([k, label]) => (
          <button key={k} onClick={() => setPeriod(k)} style={{
            all: 'unset', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 999,
            fontFamily: T.font, fontWeight: 700, fontSize: 12.5,
            background: period === k ? T.accent : T.card,
            color: period === k ? '#fff' : T.textDim,
            border: '1px solid ' + (period === k ? T.accent : T.borderSoft),
          }}>{label}</button>
        ))}
      </div>

      {/* Metric tabs */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6 }}>
        {metrics.map(mm => (
          <button key={mm.k} onClick={() => setMetric(mm.k)} style={{
            all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center',
            padding: '8px 4px', borderRadius: 10,
            fontFamily: T.font, fontWeight: 700, fontSize: 12,
            background: metric === mm.k ? 'rgba(249,115,22,0.12)' : 'transparent',
            color: metric === mm.k ? T.accent : T.textMute,
            border: '1px solid ' + (metric === mm.k ? 'rgba(249,115,22,0.4)' : T.borderSoft),
          }}>{mm.label}</button>
        ))}
      </div>

      {/* Big chart card */}
      <div style={{ padding: '0 20px 18px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.font, fontSize: 12, color: T.textMute, fontWeight: 600, letterSpacing: 1.1, textTransform: 'uppercase' }}>
                Jelenleg
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.text, letterSpacing: -0.8, lineHeight: 1, marginTop: 4 }}>
                {last}<span style={{ fontSize: 14, color: T.textDim, marginLeft: 3 }}>{m.unit}</span>
              </div>
            </div>
            <DeltaBadge diff={diff} pct={dPct} unit={m.unit} goodDown={m.goodDown} />
          </div>
          {m.bar
            ? <BarChart data={m.data} />
            : <LineChart data={m.data} goodDown={m.goodDown} />}
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 8,
            fontFamily: T.mono, fontSize: 10.5, color: T.textMute,
          }}>
            <span>FEB</span><span>MÁR</span><span>ÁPR</span><span>MÁJ</span>
          </div>
        </Card>
      </div>

      {/* Delta summary cards */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Összefoglaló — utolsó 3 hónap</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DeltaRow label="Testsúly" first={87.4} last={84.2} unit="kg" goodDown />
          <DeltaRow label="Testzsír" first={16.4} last={14.8} unit="%" goodDown />
          <DeltaRow label="Izomtömeg" first={37.1} last={37.8} unit="kg" goodDown={false} />
          <DeltaRow label="FMS pontszám" first={13} last={17} unit="/21" goodDown={false} />
        </div>
      </div>
    </div>
  );
}

function DeltaBadge({ diff, pct, unit, goodDown }) {
  const positive = diff > 0;
  const isGood = goodDown ? !positive : positive;
  const c = diff === 0 ? T.textMute : isGood ? T.good : T.bad;
  const sign = positive ? '+' : '';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 9px', borderRadius: 999,
      background: c + '18', color: c,
      fontFamily: T.mono, fontSize: 12, fontWeight: 700,
    }}>
      {positive ? I.arrowU(11, c) : I.arrowD(11, c)}
      {sign}{diff}{unit} · {sign}{pct}%
    </div>
  );
}

function DeltaRow({ label, first, last, unit, goodDown }) {
  const diff = +(last - first).toFixed(1);
  const positive = diff > 0;
  const isGood = goodDown ? !positive : positive;
  const c = diff === 0 ? T.textMute : isGood ? T.good : T.bad;
  return (
    <Card padding={14}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 700, color: T.text }}>{label}</div>
          <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.textMute, marginTop: 3 }}>
            {first}{unit}  →  {last}{unit}
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, color: c,
          fontFamily: T.mono, fontSize: 14, fontWeight: 700,
        }}>
          {positive ? I.arrowU(13, c) : I.arrowD(13, c)}
          {positive ? '+' : ''}{diff}{unit}
        </div>
      </div>
    </Card>
  );
}

function LineChart({ data, goodDown }) {
  const W = 320, H = 130, P = 6;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (W - P*2) / (data.length - 1);
  const pts = data.map((v, i) => [P + i*stepX, P + (1 - (v - min)/range) * (H - P*2)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const areaPath = path + ` L${pts[pts.length-1][0]} ${H} L${pts[0][0]} ${H} Z`;
  const last = pts[pts.length-1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.accent} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={T.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map(g => (
        <line key={g} x1={P} x2={W-P} y1={P + g*(H-P*2)} y2={P + g*(H-P*2)} stroke={T.borderSoft} strokeWidth="1" strokeDasharray="2 4"/>
      ))}
      <path d={areaPath} fill="url(#lg-fill)"/>
      <path d={path} fill="none" stroke={T.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (i === pts.length-1) && (
        <Fragment key={i}>
          <circle cx={p[0]} cy={p[1]} r="9" fill={T.accent} fillOpacity="0.18"/>
          <circle cx={p[0]} cy={p[1]} r="4" fill={T.accent}/>
          <circle cx={p[0]} cy={p[1]} r="2" fill="#fff"/>
        </Fragment>
      ))}
    </svg>
  );
}

function BarChart({ data }) {
  const W = 320, H = 130, P = 6;
  const max = Math.max(...data), min = 0;
  const range = max - min || 1;
  const stepX = (W - P*2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {[0.25, 0.5, 0.75].map(g => (
        <line key={g} x1={P} x2={W-P} y1={P + g*(H-P*2)} y2={P + g*(H-P*2)} stroke={T.borderSoft} strokeWidth="1" strokeDasharray="2 4"/>
      ))}
      {data.map((v, i) => {
        const h = ((v - min)/range) * (H - P*2 - 4);
        const x = P + i*stepX + stepX*0.15;
        const w = stepX * 0.7;
        const y = H - P - h;
        const isLast = i === data.length - 1;
        return (
          <rect key={i} x={x} y={y} width={w} height={h} rx="2"
            fill={isLast ? T.accent : 'rgba(249,115,22,0.32)'}/>
        );
      })}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// EDZÉSEK TAB (programs list)
// ────────────────────────────────────────────────────────────────────────────
function WorkoutsTab({ go }) {
  const today = { name: 'B nap — Strength', desc: 'Snatch Test + Press / Squat', sets: 24, dur: '~50 perc' };
  const program = [
    { day: 'A', name: 'Power & Pull', dur: '45 perc', done: true },
    { day: 'B', name: 'Strength', dur: '50 perc', today: true },
    { day: 'C', name: 'Conditioning', dur: '35 perc' },
    { day: 'D', name: 'Mobility & Core', dur: '30 perc' },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <TabHeader subtitle="Heti terv · 4 / 8" title="Edzések" />

      {/* Today's workout big card */}
      <div style={{ padding: '0 20px 18px' }}>
        <Card padding={0} accent>
          <div style={{ padding: '18px 18px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                background: T.accent, color: '#fff',
                fontFamily: T.font, fontSize: 10.5, fontWeight: 800,
                padding: '3px 8px', borderRadius: 6, letterSpacing: 1, textTransform: 'uppercase',
              }}>Ma</span>
              <span style={{ fontFamily: T.font, fontSize: 11.5, color: T.textMute, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                B nap
              </span>
            </div>
            <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>
              {today.name}
            </div>
            <div style={{ fontFamily: T.font, fontSize: 13, color: T.textDim, marginTop: 4 }}>{today.desc}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 14, fontFamily: T.mono, fontSize: 12, color: T.textDim }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{I.clock(13, T.textMute)} {today.dur}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{I.kettlebell(13, T.textMute)} {today.sets} szett</span>
            </div>
          </div>
          <button onClick={() => go('active')} style={{
            all: 'unset', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            margin: '14px 16px 16px', padding: '14px',
            background: T.accent, color: '#fff', borderRadius: 12,
            fontFamily: T.font, fontWeight: 800, fontSize: 15, letterSpacing: 0.3,
            boxShadow: '0 8px 20px -8px rgba(249,115,22,0.6)',
          }}>
            {I.play(15, '#fff')} Edzés indítása
          </button>
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Heti program</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {program.map((p, i) => (
            <Card key={i} padding={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: p.today ? T.accent : (p.done ? 'rgba(16,185,129,0.15)' : T.bg),
                  color: p.today ? '#fff' : (p.done ? T.good : T.textDim),
                  border: p.today ? 'none' : '1px solid ' + T.borderSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.font, fontSize: 16, fontWeight: 800,
                }}>{p.done ? I.check(20, T.good) : p.day}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text }}>{p.name}</div>
                  <div style={{ fontFamily: T.font, fontSize: 12, color: T.textMute, marginTop: 2 }}>
                    {p.done ? 'Befejezve' : p.today ? 'Ma esedékes' : 'Várakozik'} · {p.dur}
                  </div>
                </div>
                {I.chevR(16, T.textMute)}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ACTIVE WORKOUT
// ────────────────────────────────────────────────────────────────────────────
const EXERCISES = [
  {
    name: 'Kettlebell Snatch',
    desc: '24 kg · jobb és bal váltva · 10 ismétlés / oldal',
    target: { reps: 10, weight: 24, sets: 4 },
  },
  {
    name: 'Double KB Front Squat',
    desc: '2 × 20 kg · 8 ismétlés · 3 mp lent',
    target: { reps: 8, weight: 20, sets: 4 },
  },
  {
    name: 'Strict Press',
    desc: '24 kg · 5 ismétlés / oldal · pause top',
    target: { reps: 5, weight: 24, sets: 5 },
  },
  {
    name: 'Goblet Carry',
    desc: '32 kg · 40 méter',
    target: { reps: 40, weight: 32, sets: 3 },
  },
];

function ActiveWorkout({ go }) {
  const [exIdx, setExIdx] = useState(0);
  const [sets, setSets] = useState(() =>
    EXERCISES.map(e => Array.from({ length: e.target.sets }, () => ({ reps: '', weight: '', done: false })))
  );
  const [elapsed, setElapsed] = useState(18 * 60 + 32); // seconds
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const ex = EXERCISES[exIdx];
  const exSets = sets[exIdx];

  const updateSet = (i, patch) => {
    setSets(prev => prev.map((arr, ei) =>
      ei !== exIdx ? arr : arr.map((s, si) => si === i ? { ...s, ...patch } : s)
    ));
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, '0');
    return m + ':' + ss;
  };

  const completedSets = exSets.filter(s => s.done).length;
  const isLast = exIdx === EXERCISES.length - 1;

  return (
    <div style={{ paddingBottom: 28 }}>
      {/* Header */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <button onClick={() => go('workouts')} style={{
            all: 'unset', cursor: 'pointer',
            width: 36, height: 36, borderRadius: 10,
            background: T.card, border: '1px solid ' + T.borderSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{I.close(20, T.textDim)}</button>

          {/* Timer */}
          <button onClick={() => setRunning(r => !r)} style={{
            all: 'unset', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px 6px 12px', borderRadius: 999,
            background: running ? 'rgba(249,115,22,0.15)' : T.card,
            border: '1px solid ' + (running ? 'rgba(249,115,22,0.4)' : T.borderSoft),
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: 99,
              background: running ? T.accent : T.textMute,
              animation: running ? 'pulse 1.4s ease-in-out infinite' : 'none',
            }}/>
            <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: 0.5 }}>
              {fmtTime(elapsed)}
            </span>
          </button>

          <button style={{
            all: 'unset', cursor: 'pointer',
            width: 36, height: 36, borderRadius: 10,
            background: T.card, border: '1px solid ' + T.borderSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{I.more(20, T.textDim)}</button>
        </div>

        <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.textMute, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 6 }}>
          Snatch Test + Strength · B nap
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 4 }}>
        {EXERCISES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i < exIdx ? T.good : i === exIdx ? T.accent : T.borderSoft,
          }}/>
        ))}
      </div>

      {/* Exercise heading */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontFamily: T.font, fontSize: 12, color: T.accent, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase' }}>
            Gyakorlat {exIdx + 1} / {EXERCISES.length}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textMute }}>
            {completedSets} / {exSets.length} szett
          </div>
        </div>
        <div style={{ fontFamily: T.font, fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: -0.6, lineHeight: 1.1 }}>
          {ex.name}
        </div>
        <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.textDim, marginTop: 6 }}>{ex.desc}</div>
      </div>

      {/* Set logger */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '32px 1fr 1fr 44px',
          gap: 8, padding: '0 4px 8px',
          fontFamily: T.font, fontSize: 10.5, color: T.textMute, fontWeight: 700,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          <div>#</div>
          <div>Reps</div>
          <div>Súly (kg)</div>
          <div style={{ textAlign: 'center' }}>✓</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exSets.map((s, i) => (
            <SetRow
              key={i} idx={i+1} value={s} target={ex.target}
              onChange={patch => updateSet(i, patch)}
            />
          ))}
        </div>
      </div>

      {/* Next exercise button */}
      <div style={{ padding: '8px 20px 28px' }}>
        <button
          onClick={() => isLast ? go('workouts') : setExIdx(i => i + 1)}
          disabled={completedSets < exSets.length}
          style={{
            all: 'unset',
            cursor: completedSets < exSets.length ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', boxSizing: 'border-box',
            padding: '15px 16px', borderRadius: 14,
            background: completedSets < exSets.length ? T.card : T.accent,
            color: completedSets < exSets.length ? T.textMute : '#fff',
            fontFamily: T.font, fontWeight: 800, fontSize: 15.5, letterSpacing: 0.3,
            border: completedSets < exSets.length ? '1px solid ' + T.borderSoft : 'none',
            boxShadow: completedSets < exSets.length ? 'none' : '0 8px 20px -8px rgba(249,115,22,0.6)',
            opacity: completedSets < exSets.length ? 0.6 : 1,
          }}>
          {isLast ? 'Edzés befejezése' : 'Következő gyakorlat'} {I.chevR(18, completedSets < exSets.length ? T.textMute : '#fff')}
        </button>
      </div>
    </div>
  );
}

function SetRow({ idx, value, target, onChange }) {
  const done = value.done;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr 1fr 44px',
      gap: 8, alignItems: 'center',
      background: done ? 'rgba(16,185,129,0.08)' : T.card,
      border: '1px solid ' + (done ? 'rgba(16,185,129,0.3)' : T.borderSoft),
      borderRadius: 12, padding: '8px 10px',
      transition: 'background .15s, border-color .15s',
    }}>
      <div style={{
        fontFamily: T.mono, fontSize: 14, color: done ? T.good : T.textDim,
        fontWeight: 700, textAlign: 'center',
      }}>{idx}</div>
      <input
        value={value.reps} onChange={e => onChange({ reps: e.target.value })}
        placeholder={String(target.reps)} inputMode="numeric"
        style={inputStyle(done)}
      />
      <input
        value={value.weight} onChange={e => onChange({ weight: e.target.value })}
        placeholder={String(target.weight)} inputMode="decimal"
        style={inputStyle(done)}
      />
      <button onClick={() => onChange({ done: !done })} style={{
        all: 'unset', cursor: 'pointer',
        width: 34, height: 34, borderRadius: 9,
        background: done ? T.good : T.bg,
        border: '1px solid ' + (done ? T.good : T.border),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto',
        transition: 'all .15s',
      }}>{done ? I.check(18, '#fff') : I.check(18, T.textMute)}</button>
    </div>
  );
}

function inputStyle(done) {
  return {
    width: '100%', boxSizing: 'border-box',
    background: T.bg, border: '1px solid ' + T.border, borderRadius: 9,
    padding: '9px 10px',
    color: done ? T.good : T.text,
    fontFamily: T.mono, fontSize: 15, fontWeight: 700,
    outline: 'none', textAlign: 'center', letterSpacing: -0.3,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// PROFILE TAB (minimal — for completeness, not detailed in spec)
// ────────────────────────────────────────────────────────────────────────────
function ProfileTab() {
  return (
    <div style={{ paddingBottom: 110 }}>
      <TabHeader subtitle="Sportoló" title="Márton K." />
      <div style={{ padding: '0 20px 18px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 999,
              background: 'linear-gradient(135deg, ' + T.accent + ', ' + T.accentDeep + ')',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.font, fontWeight: 800, fontSize: 22, color: '#fff',
            }}>MK</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 17, color: T.text }}>Márton Kovács</div>
              <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.textDim, marginTop: 2 }}>Underground KB · 12. hét</div>
            </div>
            <button style={{
              all: 'unset', cursor: 'pointer',
              padding: '8px 12px', borderRadius: 9,
              background: T.bg, border: '1px solid ' + T.border,
              color: T.textDim, fontFamily: T.font, fontSize: 12, fontWeight: 700,
            }}>Szerkeszt</button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
            marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + T.borderSoft,
          }}>
            <MiniCol label="Magasság" v="182" u="cm" />
            <MiniCol label="Életkor" v="32" u="év" />
            <MiniCol label="Edzések" v="86" u="" />
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Beállítások</SectionLabel>
        <Card padding={0}>
          {['Edzés terv', 'Edző hozzárendelése', 'Értesítések', 'Mértékegységek', 'Adatkezelés', 'Kijelentkezés'].map((row, i, a) => (
            <div key={row} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 16px',
              borderTop: i === 0 ? 'none' : '1px solid ' + T.borderSoft,
            }}>
              <span style={{ fontFamily: T.font, fontSize: 14.5, color: row === 'Kijelentkezés' ? T.bad : T.text, fontWeight: 600 }}>{row}</span>
              {row !== 'Kijelentkezés' && I.chevR(16, T.textMute)}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function MiniCol({ label, v, u }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.text }}>
        {v}<span style={{ fontSize: 11, color: T.textMute, marginLeft: 2 }}>{u}</span>
      </div>
      <div style={{ fontFamily: T.font, fontSize: 10.5, color: T.textMute, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// APP — owns route state. Renders inside an iOS device (handled by parent).
// ────────────────────────────────────────────────────────────────────────────
function App({ initialRoute = 'dashboard' }) {
  const [route, setRoute] = useState(initialRoute);

  // Routes that have a bottom tab bar
  const tabRoute = ['dashboard', 'workouts', 'measure', 'progress', 'profile'].includes(route);

  let body = null;
  if (route === 'dashboard') body = <Dashboard go={setRoute} />;
  else if (route === 'workouts') body = <WorkoutsTab go={setRoute} />;
  else if (route === 'measure') body = <MeasureTab go={setRoute} />;
  else if (route === 'progress') body = <ProgressTab go={setRoute} />;
  else if (route === 'profile') body = <ProfileTab />;
  else if (route === 'bodycomp') body = <BodyCompForm go={setRoute} />;
  else if (route === 'active') body = <ActiveWorkout go={setRoute} />;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: T.bg, overflow: 'hidden',
      fontFamily: T.font, color: T.text,
    }}>
      <StatusBarDark />
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, bottom: 0,
        overflowY: 'auto', overflowX: 'hidden',
        paddingBottom: tabRoute ? 0 : 30,
      }}>
        {body}
      </div>
      {tabRoute && <BottomTabs active={route} onChange={setRoute} />}
      <HomeIndicator />
    </div>
  );
}

Object.assign(window, { App, T });
