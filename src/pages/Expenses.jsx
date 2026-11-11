import { useEffect, useRef, useState } from 'react'
import { getExpenses, addExpense, deleteExpense } from '../api'

const emptyForm = { amount: '', type: 'EXPENSE', category: '', date: '', description: '' }

function validate(f) {
  const errors = {}
  const amount = Number(f.amount)
  if (f.amount === '') errors.amount = 'Amount is required'
  else if (amount < 0) errors.amount = 'Amount cannot be negative'
  else if (amount > 9999.99) errors.amount = 'Amount must be at most 9999.99'
  else if (!/^\d+(\.\d{1,2})?$/.test(f.amount)) errors.amount = 'Use at most 2 decimals'
  if (!f.type) errors.type = 'Type is required'
  if (!f.category.trim()) errors.category = 'Category is required'
  else if (f.category.length > 30) errors.category = 'Category must be at most 30 characters'
  if (!f.date) errors.date = 'Date is required'
  if (f.description.length > 100) errors.description = 'Description must be at most 100 characters'
  return errors
}

const signed = (e) => (e.type === 'INCOME' ? 1 : -1) * Number(e.amount)
const formatDate = (d) =>
  new Date(d + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function groupByDate(expenses) {
  const groups = {}
  for (const e of expenses) (groups[e.date] ??= []).push(e)
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function ConfirmDialog({ expense, onCancel, onConfirm }) {
  const cancelRef = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    cancelRef.current.focus()
    return () => previous?.focus?.()
  }, [])

  function onKeyDown(e) {
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Tab') {
      // Focus trap: only two buttons
      e.preventDefault()
      const buttons = e.currentTarget.querySelectorAll('button')
      const next = document.activeElement === buttons[0] ? buttons[1] : buttons[0]
      next.focus()
    }
  }

  return (
    <div className="overlay center" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <h2 id="dialog-title">Delete this {expense.type === 'INCOME' ? 'income' : 'expense'}?</h2>
        <p>{expense.description || expense.category}: {expense.amount} €. This cannot be undone.</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="btn secondary" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  function load() {
    getExpenses()
      .then(setExpenses)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }

  // loading starts true, so the first load needs no state reset
  useEffect(load, [])

  function retry() {
    setLoading(true)
    setLoadError(null)
    load()
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    try {
      const created = await addExpense(form)
      setExpenses([...expenses, created])
      setForm(emptyForm)
      setError(null)
      setSheetOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function confirmDelete() {
    const { id } = toDelete
    setToDelete(null)
    try {
      await deleteExpense(id)
      setExpenses(expenses.filter((expense) => expense.id !== id))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const invalid = (name) => (fieldErrors[name] ? true : undefined)

  return (
    <div className="expenses">
      <h1>Expenses</h1>
      {error && <p className="banner" role="alert">{error}</p>}

      <div className="expenses-body">
        <section className="list" aria-label="Expense list">
          {loading && (
            <div aria-busy="true" aria-label="Loading">
              <p className="muted">Loading</p>
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" />)}
            </div>
          )}
          {loadError && (
            <div className="state">
              <p role="alert">{loadError}</p>
              <button className="btn secondary" onClick={retry}>Try again</button>
            </div>
          )}
          {!loading && !loadError && expenses.length === 0 && (
            <div className="state">
              <p className="state-title">No expenses yet</p>
              <p className="muted">Add your first expense or income to see it here.</p>
            </div>
          )}
          {groupByDate(expenses).map(([date, items]) => {
            const total = items.reduce((sum, e) => sum + signed(e), 0)
            return (
              <div key={date} className="group">
                <div className="group-header">
                  <span>{formatDate(date)}</span>
                  <span>{total > 0 ? '+' : total < 0 ? '−' : ''}{Math.abs(total).toFixed(2)} €</span>
                </div>
                {items.map((expense) => {
                  const income = expense.type === 'INCOME'
                  return (
                    <div key={expense.id} className="row">
                      <div className={`avatar ${income ? 'income' : 'expense'}`} aria-hidden="true">{income ? '▲' : '▼'}</div>
                      <div className="row-main">
                        <div className="row-title">{expense.description || expense.category}</div>
                        <div className="row-tags">
                          <span className="chip">{expense.category}</span>
                          <span className={`badge ${income ? 'income' : 'expense'}`}>{income ? 'Income' : 'Expense'}</span>
                        </div>
                      </div>
                      <div className={`amount ${income ? 'income' : 'expense'}`}>
                        {income ? '▲ +' : '▼ −'}{expense.amount} €
                      </div>
                      <button className="icon-btn" aria-label={`Delete ${expense.description || expense.category}`} onClick={() => setToDelete(expense)}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </section>

        {sheetOpen && <div className="overlay sheet-backdrop" onClick={() => setSheetOpen(false)} />}
        <aside
          className={`form-panel ${sheetOpen ? 'open' : ''}`}
          onKeyDown={(e) => e.key === 'Escape' && setSheetOpen(false)}
        >
          <div className="form-head">
            <h2>Add expense</h2>
            <button type="button" className="icon-btn close" aria-label="Close form" onClick={() => setSheetOpen(false)}>✕</button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <Field label="Amount" error={fieldErrors.amount}>
              <input name="amount" type="number" inputMode="decimal" step="0.01" min="0" max="9999.99" placeholder="0.00" value={form.amount} onChange={handleChange} aria-invalid={invalid('amount')} />
            </Field>
            <Field label="Type" error={fieldErrors.type}>
              <select name="type" value={form.type} onChange={handleChange} aria-invalid={invalid('type')}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </Field>
            <Field label="Category" error={fieldErrors.category}>
              <input name="category" placeholder="Category" maxLength={30} value={form.category} onChange={handleChange} aria-invalid={invalid('category')} />
            </Field>
            <Field label="Date" error={fieldErrors.date}>
              <input name="date" type="date" value={form.date} onChange={handleChange} aria-invalid={invalid('date')} />
            </Field>
            <Field label="Description" error={fieldErrors.description}>
              <input name="description" placeholder="Description (optional)" maxLength={100} value={form.description} onChange={handleChange} aria-invalid={invalid('description')} />
            </Field>
            <button type="submit" className="btn primary">Add</button>
          </form>
        </aside>
      </div>

      <button className="fab" aria-label="Add expense" onClick={() => setSheetOpen(true)}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {toDelete && <ConfirmDialog expense={toDelete} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />}
    </div>
  )
}

export default Expenses
