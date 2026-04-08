import { useState, useEffect, useRef } from 'react'
import Topbar from '../components/Topbar.jsx'
import { useAuth } from '../App.jsx'
import { getToken } from '../utils/auth.js'

/* CSV parser */
function splitCSVLine(line) {
  const result = []
  let inQuotes = false, current = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else { current += ch }
  }
  result.push(current)
  return result
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = splitCSVLine(line)
      return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? '').trim().replace(/^"|"$/g, '')]))
    })
}

/* Toast component */
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      background: type === 'success' ? '#1e3a35' : '#dc2626',
      color: 'white', borderRadius: '10px',
      padding: '14px 20px', fontSize: '14px', fontWeight: '500',
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: '10px',
      animation: 'slideIn 0.25s ease',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {type === 'success'
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      }
      {message}
    </div>
  )
}

/* Upload card */
function UploadCard({ label, icon, file, onFile, dragKey, dragOver, onDragOver, onDragLeave, disabled }) {
  const inputRef = useRef()
  const isOver = dragOver === dragKey

  function handleDrop(e) {
    if (disabled) return
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) onFile(f)
    onDragLeave()
  }

  function handleBrowse(e) {
    if (disabled) return
    e.stopPropagation()
    inputRef.current.click()
  }

  function handleChange(e) {
    const f = e.target.files[0]
    if (f) onFile(f)
    e.target.value = ''
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{
      flex: 1, background: disabled ? '#f9fafb' : 'white',
      border: '1px solid #e5e7eb', borderRadius: '12px',
      padding: '24px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      minWidth: 0, opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 0.2s',
    }}>
      <div style={{
        width: '48px', height: '48px',
        background: disabled ? '#f3f4f6' : '#f0f7f5', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? '#9ca3af' : '#1e3a35',
      }}>
        {icon}
      </div>

      <div style={{ fontSize: '14px', fontWeight: '700', color: disabled ? '#9ca3af' : '#111827' }}>{label}</div>

      {file ? (
        <div style={{
          width: '100%', background: '#f0f7f5',
          border: '1.5px solid #2d6a4f', borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              {formatSize(file.size)}
            </div>
          </div>
          <button
            onClick={() => onFile(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', flexShrink: 0, padding: '2px',
              borderRadius: '4px', display: 'flex',
            }}
            title="Remove file"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); onDragOver(dragKey) }}
          onDragLeave={onDragLeave}
          onDrop={handleDrop}
          style={{
            width: '100%',
            border: `2px dashed ${isOver ? '#1e3a35' : '#d1d5db'}`,
            borderRadius: '10px',
            padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            background: isOver ? '#f0f7f5' : '#fafafa',
            transition: 'all 0.15s', cursor: 'default',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', lineHeight: '1.4' }}>
            Drop CSV here or
          </div>
          <button
            onClick={handleBrowse}
            style={{
              background: '#1e3a35', color: 'white',
              border: 'none', borderRadius: '6px',
              padding: '6px 14px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#2d6a4f'}
            onMouseLeave={e => e.currentTarget.style.background = '#1e3a35'}
          >
            Browse
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  )
}

/* Icons */
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)

const CompetencyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

/* Tab component */
function Tab({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        background: active ? '#ffffff' : 'transparent',
        color: active ? '#1e3a35' : '#6b8c7d',
        border: 'none',
        borderBottom: active ? '2px solid #1e3a35' : '2px solid transparent',
        borderRadius: 0,
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/* Data Upload Summary Card */
function DataSummaryCard({ title, data, icon, color }) {
  if (!data) return null

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      minWidth: '0',
      flex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '9px',
          background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color.text,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{title}</div>
      </div>
      
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a35', marginBottom: '4px' }}>
        {data.count}
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
        {data.type === 'interactions' ? 'interactions logged' :
         data.type === 'auditmate' ? 'cases audited' : 'responses'}
      </div>
      
      {data.avgScore !== undefined && (
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
          Avg Score: <span style={{ fontWeight: '700', color: '#111827' }}>{data.avgScore}%</span>
        </div>
      )}
      
      {data.avgRating !== undefined && (
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
          Avg Rating: <span style={{ fontWeight: '700', color: '#111827' }}>{data.avgRating} / 5</span>
        </div>
      )}
    </div>
  )
}

/* Competency Edit Form */
function CompetencyForm({ competency, onSave, onCancel, roles }) {
  const [formData, setFormData] = useState({
    role: competency?.role || 'CSO',
    competency_type: competency?.competency_type || 'Core',
    sequence: competency?.sequence || 1,
    name: competency?.name || '',
    short_description: competency?.short_description || '',
    bullet_points: competency?.bullet_points?.join('\n') || '',
    target_level: competency?.target_level || 'Intermediate',
    measurable_from_correspondence: competency?.measurable_from_correspondence || false,
    applicable_roles: competency?.applicable_roles || [],
    assessment_method: competency?.assessment_method || 'manual_assessment',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      bullet_points: formData.bullet_points.split('\n').filter(p => p.trim()),
      sequence: Number(formData.sequence),
    }
    onSave(data)
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
        {competency ? 'Edit Competency' : 'Add New Competency'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Role
            </label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '13px', color: '#111827',
                outline: 'none', fontFamily: 'inherit',
              }}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Competency Type
            </label>
            <select
              value={formData.competency_type}
              onChange={e => setFormData({ ...formData, competency_type: e.target.value })}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '13px', color: '#111827',
                outline: 'none', fontFamily: 'inherit',
              }}
            >
              <option value="Correspondence">Correspondence</option>
              <option value="Core">Core</option>
              <option value="Functional">Functional</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Sequence
              </label>
              <input
                type="number"
                value={formData.sequence}
                onChange={e => setFormData({ ...formData, sequence: e.target.value })}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '13px', color: '#111827',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Target Level
              </label>
              <select
                value={formData.target_level}
                onChange={e => setFormData({ ...formData, target_level: e.target.value })}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '13px', color: '#111827',
                  outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '13px', color: '#111827',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Short Description
            </label>
            <textarea
              value={formData.short_description}
              onChange={e => setFormData({ ...formData, short_description: e.target.value })}
              rows={2}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '13px', color: '#111827',
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Bullet Points (one per line)
            </label>
            <textarea
              value={formData.bullet_points}
              onChange={e => setFormData({ ...formData, bullet_points: e.target.value })}
              rows={4}
              placeholder="Enter bullet points, one per line"
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '13px', color: '#111827',
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Assessment Method
            </label>
            <select
              value={formData.assessment_method}
              onChange={e => setFormData({ ...formData, assessment_method: e.target.value })}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '13px', color: '#111827',
                outline: 'none', fontFamily: 'inherit',
              }}
            >
              <option value="correspondence_data">Correspondence Data</option>
              <option value="manual_assessment">Manual Assessment</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="measurable"
              checked={formData.measurable_from_correspondence}
              onChange={e => setFormData({ ...formData, measurable_from_correspondence: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="measurable" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
              Measurable from correspondence data
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              background: '#f3f4f6', color: '#374151', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              background: '#1e3a35', color: 'white', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

/* Main Admin Panel */
export default function AdminPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('uploads')
  const [toast, setToast] = useState(null)
  
  // Data upload state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [interactionsFile, setInteractionsFile] = useState(null)
  const [auditmateFile, setAuditmateFile] = useState(null)
  const [essFile, setEssFile] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadData, setUploadData] = useState([])
  const [uploadLoading, setUploadLoading] = useState(false)
  
  // Competency management state
  const [competencies, setCompetencies] = useState([])
  const [competencyLoading, setCompetencyLoading] = useState(false)
  const [editingCompetency, setEditingCompetency] = useState(null)
  const [showCompetencyForm, setShowCompetencyForm] = useState(false)

  const roles = ['CSO', 'TL', 'Supervisor']
  const today = new Date().toISOString().slice(0, 10)
  const hasAnyFile = !!(interactionsFile || auditmateFile || essFile)

  // Fetch upload data for viewing
  useEffect(() => {
    if (activeTab === 'uploads') {
      fetchUploadData()
    }
  }, [activeTab, date])

  // Fetch competencies
  useEffect(() => {
    if (activeTab === 'competencies') {
      fetchCompetencies()
    }
  }, [activeTab])

  async function fetchUploadData() {
    setUploadLoading(true)
    try {
      const response = await fetch(`/api/admin/uploads?date=${date}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUploadData(data)
      } else {
        setToast({ message: 'Failed to fetch upload data', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Error fetching upload data', type: 'error' })
    } finally {
      setUploadLoading(false)
    }
  }

  async function fetchCompetencies() {
    setCompetencyLoading(true)
    try {
      const response = await fetch('/api/admin/competencies', {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCompetencies(data)
      } else {
        setToast({ message: 'Failed to fetch competencies', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Error fetching competencies', type: 'error' })
    } finally {
      setCompetencyLoading(false)
    }
  }

  async function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = e => resolve(parseCSV(e.target.result))
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  async function handleUpload() {
    if (!hasAnyFile || loading) return
    setLoading(true)
    try {
      const [interactions, auditmate, ess] = await Promise.all([
        interactionsFile ? readFile(interactionsFile) : null,
        auditmateFile    ? readFile(auditmateFile)    : null,
        essFile          ? readFile(essFile)          : null,
      ])

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ date, interactions, auditmate, ess }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setInteractionsFile(null)
      setAuditmateFile(null)
      setEssFile(null)
      setToast({ message: 'Data uploaded successfully!', type: 'success' })
      fetchUploadData()
    } catch (err) {
      setToast({ message: err.message || 'Upload failed.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveCompetency(data) {
    try {
      const url = editingCompetency 
        ? `/api/admin/competencies/${editingCompetency._id}`
        : '/api/admin/competencies'
      const method = editingCompetency ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setToast({ message: `Competency ${editingCompetency ? 'updated' : 'created'} successfully`, type: 'success' })
        setShowCompetencyForm(false)
        setEditingCompetency(null)
        fetchCompetencies()
      } else {
        setToast({ message: 'Failed to save competency', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Error saving competency', type: 'error' })
    }
  }

  async function handleDeleteCompetency(id) {
    if (!window.confirm('Are you sure you want to delete this competency?')) return
    
    try {
      const response = await fetch(`/api/admin/competencies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })

      if (response.ok) {
        setToast({ message: 'Competency deleted successfully', type: 'success' })
        fetchCompetencies()
      } else {
        setToast({ message: 'Failed to delete competency', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Error deleting competency', type: 'error' })
    }
  }

  function editCompetency(competency) {
    setEditingCompetency(competency)
    setShowCompetencyForm(true)
  }

  function addCompetency() {
    setEditingCompetency(null)
    setShowCompetencyForm(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Topbar title="Admin Panel" subtitle="Manage uploads and competencies" />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#ffffff', marginBottom: '24px' }}>
          <Tab
            label="Data Uploads"
            active={activeTab === 'uploads'}
            onClick={() => setActiveTab('uploads')}
            icon={<UploadIcon />}
          />
          <Tab
            label="Competencies"
            active={activeTab === 'competencies'}
            onClick={() => setActiveTab('competencies')}
            icon={<CompetencyIcon />}
          />
        </div>

        {/* Data Uploads Tab */}
        {activeTab === 'uploads' && (
          <div>
            {/* Upload Section */}
            <div style={{
              background: 'white', borderRadius: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              padding: '28px', marginBottom: '24px',
            }}>
              {/* Date row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                paddingBottom: '24px', borderBottom: '1px solid #f0f0f0', marginBottom: '24px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Data Date</div>
                <input
                  type="date"
                  value={date}
                  max={today}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    border: '1.5px solid #d1d5db', borderRadius: '8px',
                    padding: '7px 12px', fontSize: '13px', color: '#111827',
                    outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a35'}
                  onBlur={e  => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* Upload cards */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
                <UploadCard
                  label="Interactions"
                  icon={<PersonIcon />}
                  file={interactionsFile}
                  onFile={setInteractionsFile}
                  dragKey="interactions"
                  dragOver={dragOver}
                  onDragOver={setDragOver}
                  onDragLeave={() => setDragOver(null)}
                  disabled={false}
                />
                <UploadCard
                  label="Auditmate"
                  icon={<ClipboardIcon />}
                  file={auditmateFile}
                  onFile={setAuditmateFile}
                  dragKey="auditmate"
                  dragOver={dragOver}
                  onDragOver={setDragOver}
                  onDragLeave={() => setDragOver(null)}
                  disabled={false}
                />
                <UploadCard
                  label="ESS"
                  icon={<ChatIcon />}
                  file={essFile}
                  onFile={setEssFile}
                  dragKey="ess"
                  dragOver={dragOver}
                  onDragOver={setDragOver}
                  onDragLeave={() => setDragOver(null)}
                  disabled={false}
                />
              </div>

              {/* Submit button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={handleUpload}
                  disabled={!hasAnyFile || loading}
                  style={{
                    background: hasAnyFile && !loading ? '#1e3a35' : '#e5e7eb',
                    color: hasAnyFile && !loading ? 'white' : '#9ca3af',
                    border: 'none', borderRadius: '9px',
                    padding: '11px 40px', fontSize: '14px', fontWeight: '600',
                    cursor: hasAnyFile && !loading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                    minWidth: '160px',
                  }}
                  onMouseEnter={e => { if (hasAnyFile && !loading) e.currentTarget.style.background = '#2d6a4f' }}
                  onMouseLeave={e => { if (hasAnyFile && !loading) e.currentTarget.style.background = '#1e3a35' }}
                >
                  {loading ? 'Uploading...' : 'Submit Data'}
                </button>
              </div>

              {/* Info banner */}
              <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: '10px', padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div style={{ fontSize: '13px', color: '#1d4ed8', lineHeight: '1.5' }}>
                  <strong>Note:</strong> At least one data source must be uploaded. All files must be in CSV format.
                </div>
              </div>
            </div>

            {/* Existing Data Section */}
            <div style={{
              background: 'white', borderRadius: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              padding: '28px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
                Existing Upload Data for {date}
              </h3>

              {uploadLoading ? (
                <div style={{
                  padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9ca3af',
                }}>
                  Loading upload data...
                </div>
              ) : uploadData.length > 0 ? (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {uploadData.map((item, index) => (
                    <DataSummaryCard
                      key={index}
                      title={`${item.officerName} - ${item.type}`}
                      data={item}
                      icon={item.type === 'interactions' ? <PersonIcon /> :
                            item.type === 'auditmate' ? <ClipboardIcon /> : <ChatIcon />}
                      color={item.type === 'interactions' ? { bg: '#e8f5f0', text: '#1e3a35' } :
                             item.type === 'auditmate' ? { bg: '#eff6ff', text: '#3b82f6' } :
                             { bg: '#f5f3ff', text: '#7c3aed' }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9ca3af',
                }}>
                  No upload data found for {date}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Competencies Tab */}
        {activeTab === 'competencies' && (
          <div>
            {showCompetencyForm ? (
              <CompetencyForm
                competency={editingCompetency}
                onSave={handleSaveCompetency}
                onCancel={() => {
                  setShowCompetencyForm(false)
                  setEditingCompetency(null)
                }}
                roles={roles}
              />
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    Competency Framework
                  </h3>
                  <button
                    onClick={addCompetency}
                    style={{
                      padding: '8px 16px', fontSize: '13px', fontWeight: '600',
                      background: '#1e3a35', color: 'white', border: 'none',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Add Competency
                  </button>
                </div>

                {competencyLoading ? (
                  <div style={{
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
                    padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9ca3af',
                  }}>
                    Loading competencies...
                  </div>
                ) : competencies.length > 0 ? (
                  <div style={{
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
                    overflow: 'hidden',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Role</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Type</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Sequence</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Target Level</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Assessment</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competencies.map((comp) => (
                          <tr key={comp._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>{comp.role}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>{comp.competency_type}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>{comp.sequence}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>{comp.name}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>{comp.target_level}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>{comp.assessment_method}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center' }}>
                              <button
                                onClick={() => editCompetency(comp)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#1e3a35', padding: '4px', marginRight: '8px',
                                  borderRadius: '4px',
                                }}
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDeleteCompetency(comp._id)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: '#dc2626', padding: '4px', borderRadius: '4px',
                                }}
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
                    padding: '40px', textAlign: 'center', fontSize: '13px', color: '#9ca3af',
                  }}>
                    No competencies found. Click "Add Competency" to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
