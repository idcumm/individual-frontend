function Sidebar({ pages, currentPage, onSelect }) {
  return (
    <nav className="sidebar">
      <h2>Student Finance</h2>
      <ul>
        {Object.entries(pages).map(([key, page]) => (
          <li key={key}>
            <button
              className={key === currentPage ? 'active' : ''}
              onClick={() => onSelect(key)}
            >
              {page.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar
