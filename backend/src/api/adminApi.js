import client from './client'

export async function fetchPendingAccounts() {
  const { data } = await client.get('/accounts/admin/accounts/pending/')
  return data
}

export async function approveAccount(id) {
  const { data } = await client.post(`/accounts/admin/accounts/${id}/approve/`)
  return data
}

export async function rejectAccount(id) {
  const { data } = await client.post(`/accounts/admin/accounts/${id}/reject/`)
  return data
}
