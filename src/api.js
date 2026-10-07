const URL = '/expenses'

export async function getExpenses() {
  const res = await fetch(URL)
  if (!res.ok) throw new Error('Error loading expenses')
  return res.json()
}

export async function addExpense(expense) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
  if (!res.ok) throw new Error('Error adding expense')
  return res.json()
}

export async function deleteExpense(id) {
  const res = await fetch(`${URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error deleting expense')
}
