// One inline icon per page key; fall back to the first letter
const icons = {
  expenses: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  ),
}

function Sidebar({ pages, currentPage, onSelect }) {
  return (
    <nav className="sidebar" aria-label="Main">
      <h2 className="sidebar-title">Student Finance</h2>
      <ul>
        {Object.entries(pages).map(([key, page]) => (
          <li key={key}>
            <button
              className={key === currentPage ? 'active' : ''}
              onClick={() => onSelect(key)}
              aria-label={page.label}
              title={page.label}
              aria-current={key === currentPage ? 'page' : undefined}
            >
              {icons[key] ?? page.label[0]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar
