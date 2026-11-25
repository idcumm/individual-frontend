import {useEffect, useState} from 'react'
import {getExpenses, addExpense, deleteExpense, editExpense} from '../api'

const CATEGORIES = ['Food', 'Rent', 'Transport', 'Leisure', 'Health', 'Education', 'Salary', 'Other']

function newForm() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return {
    amount: '', type: 'EXPENSE', category: '', date: d.toISOString().slice(0,
      16), description: ''
  }
}

function formatDay(day) {
  return new Date(`${day}T00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(newForm)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  const days = Object.groupBy(sorted, (expense) => expense.date.slice(0, 10))

  useEffect(() => {
    getExpenses().then(setExpenses).catch((err) => setError(err.message))
  }, [])

  function handleChange(e) {
    setForm({...form, [e.target.name]: e.target.value})
  }

  async function handleSubmit(e) {
    setError(null)
    e.preventDefault()
    try {
      if (editingId === null) {
        const created = await addExpense(form)
        setExpenses([...expenses, created])
      } else {
        const edited = await editExpense(editingId, form)
        setExpenses(expenses.map((expense) => (expense.id === editingId ? edited : expense)))
        setEditingId(null)
      }
      setForm(newForm())
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteExpense(id)
      setExpenses(expenses.filter((expense) => expense.id !== id))
      if (editingId === id) handleCancel()
    } catch (err) {
      setError(err.message)
    }
  }

  function handleEdit(expense) {
    setForm(expense)
    setEditingId(expense.id)
  }

  function handleCancel() {
    setForm(newForm())
    setEditingId(null)
  }

  return (
    <div>
      <h1>Expenses</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange}
               required/>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="" disabled>Category</option>
          {/* keep old free-text categories selectable when editing */}
          {(CATEGORIES.includes(form.category) || !form.category ? CATEGORIES : [...CATEGORIES, form.category]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input name="date" type="datetime-local" value={form.date} onChange={handleChange} required/>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange}/>
        <button type="submit">{editingId === null ? 'Add' : 'Save'}</button>
        {editingId !== null && (
          <button type="button" onClick={handleCancel}>Cancel</button>
        )}
      </form>

      {Object.entries(days).map(([day, items]) => (
        <section key={day}>
          <h2 className="day-header">{formatDay(day)}</h2>
          <ul className="transactions">
            {items.map((expense) => (
              <li key={expense.id} className="transaction">
                <div className="transaction-icon">
                  💶
                </div>
                <div className="transaction-info">
                  <span className="transaction-title">
                    {expense.description || expense.category}
                  </span>
                  {expense.description && (
                    <span className="tag">
                      {expense.category}
                    </span>
                  )}
                </div>
                <div className="transaction-amount">
                  <span className="transaction-time">
                    {expense.date.slice(11, 16)}
                  </span>
                  <span className={expense.type === 'INCOME' ? 'income' : 'expense'}>
                    {expense.type === 'INCOME' ? '+' : '-'}{expense.amount} €
                  </span>
                </div>
                <button onClick={() => handleEdit(expense)}>Edit</button>
                <button onClick={() => handleDelete(expense.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {expenses.length === 0 && <p>No expenses yet.</p>}
    </div>
  )
}

export default Expenses