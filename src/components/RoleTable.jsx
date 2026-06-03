export default function RoleTable({ jobs, applications, statuses, onStatusChange, onNoteChange, onNoteBlur }) {
  if (!jobs.length) return <p className="loading">No roles match the current filters.</p>

  return (
    <div className="role-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Tier</th>
            <th>Seniority</th>
            <th>Location</th>
            <th>Posted</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => {
            const app = applications[job.id] || {}
            const status = app.status || 'Watching'
            const tierClass = 'tier-' + (job.role_tier || '').replace(/[/ ]+/g, '-')
            return (
              <tr key={job.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{job.company}</div>
                  <div className="company-tier">{job.company_tier}</div>
                </td>
                <td>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    {job.title}
                  </a>
                </td>
                <td>
                  <span className={`tier-badge ${tierClass}`}>{job.role_tier}</span>
                </td>
                <td>{job.seniority || '—'}</td>
                <td>{job.location || <em style={{ color: '#aaa' }}>unknown</em>}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{job.posted ? job.posted.slice(0, 10) : '—'}</td>
                <td>
                  <select
                    className={`status-select status-${status}`}
                    value={status}
                    onChange={e => onStatusChange(job.id, e.target.value)}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <textarea
                    className="notes-input"
                    rows={1}
                    value={app.notes || ''}
                    onChange={e => onNoteChange(job.id, e.target.value)}
                    onBlur={() => onNoteBlur(job.id)}
                    placeholder="Add notes…"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
