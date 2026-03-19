import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import TLShell from './components/TLShell'
import SupervisorShell from './components/SupervisorShell'
import Login, { getStoredSession, clearSession } from './components/Login'
import { saveOfficerResults } from './utils/storage'

const OFFICERS = [
  { id: 'a', name: 'CSO',        role: 'CSO' },
  { id: 'b', name: 'TL',         role: 'TL' },
  { id: 'c', name: 'Supervisor', role: 'Supervisor' },
]

// Officers each role can see in Team Overview
function getTeamFor(role) {
  if (role === 'TL')         return OFFICERS.filter(o => o.role === 'CSO')
  if (role === 'Supervisor') return OFFICERS.filter(o => o.role !== 'Supervisor')
  return []
}

export default function App() {
  const [session, setSession]             = useState(() => getStoredSession())
  const [activeView, setActiveView]       = useState('dashboard')
  const [activeOfficer, setActiveOfficer] = useState(() => getStoredSession() || OFFICERS[0])

  if (!session) return <Login onLogin={officer => { setSession(officer); setActiveOfficer(officer) }} />

  function handleSelectOfficer(officer) {
    setActiveOfficer(officer)
    setActiveView('dashboard')
  }

  function handleSetRole(role) {
    setActiveOfficer(prev => ({ ...prev, role }))
  }

  function handleLogout() {
    clearSession()
    setSession(null)
  }

  const role = activeOfficer.role

  function renderMain() {
    // dashboard view — role-specific shell
    if (role === 'TL')
      return <TLShell officer={activeOfficer} teamOfficers={getTeamFor(role)} />
    if (role === 'Supervisor')
      return <SupervisorShell officer={activeOfficer} teamOfficers={getTeamFor(role)} />
    // CSO — plain dashboard, unchanged
    return (
      <div style={{ height: '100%', overflow: 'auto', padding: '24px' }}>
        <Dashboard officer={activeOfficer} onAnalysisDone={r => saveOfficerResults(activeOfficer.id, r)} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        officers={OFFICERS}
        activeOfficer={activeOfficer}
        onSelectOfficer={handleSelectOfficer}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar officer={activeOfficer} setRole={handleSetRole} onLogout={handleLogout} />
        <main style={{ flex: 1, overflow: 'hidden', background: '#f0faf5' }}>
          {renderMain()}
        </main>
      </div>
    </div>
  )
}
