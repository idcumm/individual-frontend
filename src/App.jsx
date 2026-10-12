import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Expenses from './pages/Expenses'

// To add a new section, add an entry here
const pages = {
  expenses: { label: 'Expenses', component: Expenses },
}

function App() {
  const [currentPage, setCurrentPage] = useState('expenses')
  const Page = pages[currentPage].component

  return (
    <div className="layout">
      <Sidebar pages={pages} currentPage={currentPage} onSelect={setCurrentPage} />
      <main className="content">
        <Page />
      </main>
    </div>
  )
}

export default App
