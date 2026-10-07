import { useEffect, useState } from 'react'
import { getExpenses, addExpense, deleteExpense } from './api'

const emptyForm = { amount: '', category: '', date: '', description: '' }

function App() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  useEffect(() => {
    getExpenses()
      .then(setExpenses)
      .catch((err) => setError(err.message))
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const created = await addExpense(form)
      setExpenses([...expenses, created])
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteExpense(id)
      setExpenses(expenses.filter((expense) => expense.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>Student Finance</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <button type="submit">Add</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td>{expense.description}</td>
              <td>{expense.amount} €</td>
              <td>
                <button onClick={() => handleDelete(expense.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {expenses.length === 0 && <p>No expenses yet.</p>}
    </div>
  )
}

export default App
