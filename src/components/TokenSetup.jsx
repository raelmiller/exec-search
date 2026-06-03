import { useState } from 'react'

export default function TokenSetup({ current, onSave, onClose }) {
  const [value, setValue] = useState(current || '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>GitHub Personal Access Token</h2>
        <p>
          A fine-grained PAT is needed to save your application statuses and notes back to
          the repo. Create one at <strong>GitHub → Settings → Developer settings → Fine-grained tokens</strong>{' '}
          with <strong>Contents: read &amp; write</strong> on the <em>raelmiller/exec-search</em> repo.
          The token is stored only in your browser's localStorage.
        </p>
        <input
          type="password"
          placeholder="github_pat_…"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(value.trim())}>Save</button>
        </div>
      </div>
    </div>
  )
}
