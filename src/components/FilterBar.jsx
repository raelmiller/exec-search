export default function FilterBar({ tiers, statuses, filters, onChange, total, shown }) {
  function set(key, val) {
    onChange(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search title or company…"
        value={filters.query}
        onChange={e => set('query', e.target.value)}
      />
      <select value={filters.tier} onChange={e => set('tier', e.target.value)}>
        <option value="">All tiers</option>
        {tiers.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={filters.status} onChange={e => set('status', e.target.value)}>
        <option value="">All statuses</option>
        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <label className="new-filter">
        <input type="checkbox" checked={filters.newOnly || false} onChange={e => set('newOnly', e.target.checked)} />
        {' '}New only
      </label>
      <span className="count">{shown} / {total} roles</span>
    </div>
  )
}
