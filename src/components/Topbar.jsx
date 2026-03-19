export default function Topbar({ officer, setRole, onLogout }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #1a6b55 0%, #0a4a3a 100%)',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 500 }}>
            Reviewing
          </div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
            {officer.name}
          </div>
        </div>
        <div style={{
          height: 28,
          width: 1,
          background: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Rank / Role</span>
          <select
            value={officer.role}
            onChange={e => setRole(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 7,
              color: '#fff',
              padding: '4px 28px 4px 10px',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.6)' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            <option value="CSO" style={{ background: '#0a4a3a' }}>CSO</option>
            <option value="TL" style={{ background: '#0a4a3a' }}>TL</option>
            <option value="Supervisor" style={{ background: '#0a4a3a' }}>Supervisor</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            CPF Mirror
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Performance Dashboard</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13,
        }}>
          {officer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <button onClick={onLogout} title="Sign out" style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M16 17l5-5-5-5M21 12H9M13 5H5a2 2 0 00-2 2v10a2 2 0 002 2h8" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
