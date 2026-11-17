import client from './client'

export async function fetchNotifications() {
  const { data } = await client.get('/notifications/')
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await client.post(`/notifications/${notificationId}/mark_read/`)
  return data
}
