const NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
      </svg>
    ),
  },
]

export default function Sidebar({ activeView, setActiveView, officers, activeOfficer, onSelectOfficer }) {
  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: '#0a4a3a',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 34,
          height: 34,
          background: 'linear-gradient(135deg, #1d9e75, #0f6e56)',
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(29,158,117,0.4)',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/>
            <path d="M9 5 L9 9 L12 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>CPF Mirror</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Performance Lens</div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '16px 12px 8px' }}>
        <div style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          padding: '0 8px 6px',
        }}>
          Navigation
        </div>
        {NAV.map(item => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: active ? 'rgba(29,158,117,0.22)' : 'transparent',
                color: active ? '#4ecba8' : 'rgba(255,255,255,0.55)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                marginBottom: 2,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {active && (
                <span style={{
                  marginLeft: 'auto',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#1d9e75',
                  flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 16px' }} />

      {/* Team Members */}
      <div style={{ padding: '12px 12px 0', flex: 1 }}>
        <div style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          padding: '0 8px 6px',
        }}>
          Team Members
        </div>
        {officers.map(officer => {
          const active = activeOfficer.id === officer.id
          const initials = officer.name.split(' ').map(w => w[0]).join('').slice(0, 2)
          return (
            <button
              key={officer.id}
              onClick={() => onSelectOfficer(officer)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                borderRadius: 8,
                border: 'none',
                background: active ? 'rgba(29,158,117,0.18)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: active ? '#1d9e75' : 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: active ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500 }}>
                  {officer.name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{officer.role}</div>
              </div>
              {active && (
                <div style={{
                  marginLeft: 'auto',
                  width: 3,
                  height: 18,
                  borderRadius: 2,
                  background: '#1d9e75',
                  flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'center' }}>
          CPF Mirror v1.0 · Service Design Studio
        </div>
      </div>
    </aside>
  )
}
