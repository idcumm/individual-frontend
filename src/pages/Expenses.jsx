import { useEffect, useState } from 'react'
import { getExpenses, addExpense, deleteExpense, editExpense } from '../api'

const emptyForm = { amount: '', type: 'EXPENSE', category: '', date: '', description: '' }

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)

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
      if (editingId === null) {
        const created = await addExpense(form)
        setExpenses([...expenses, created])
      } else {
        const edited = await editExpense(editingId, form)
        setExpenses(expenses.map((expense) => (expense.id === editingId ? edited : expense)))
        setEditingId(null)
      }
      setForm(emptyForm)
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
    setForm(emptyForm)
    setEditingId(null)
  }

  return (
    <div>
      <h1>Expenses</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <button type="submit">{editingId === null ? 'Add' : 'Save'}</button>
        {editingId !== null && (
          <button type="button" onClick={handleCancel}>Cancel</button>
        )}
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
                <button onClick={() => handleEdit(expense)}>Edit</button>
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

export default Expenses
