import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

function UserList({ onSelectUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, verified, rejected
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name_en, phone, verification_status, created_at, role')
        .eq('role', 'user')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('verification_status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      // Filter by search term
      let filteredData = data || []
      if (searchTerm) {
        filteredData = filteredData.filter(
          (user) =>
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        )
      }

      setUsers(filteredData)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        loadUsers()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      loadUsers()
    }
  }, [searchTerm])

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'badge-warning' },
      verified: { label: 'Verified', class: 'badge-success' },
      rejected: { label: 'Rejected', class: 'badge-error' },
      not_submitted: { label: 'Not Submitted', class: 'badge-neutral' },
    }
    const statusInfo = statusMap[status] || statusMap.not_submitted
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
    )
  }

  if (loading) {
    return <div className="panel"><p>Loading users...</p></div>
  }

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3>User Management</h3>
        <p className="small-text">View and manage user profile verifications</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by email, name, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.5rem' }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="all">All Users</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem' }}>
                    {user.full_name_en || 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>{user.phone || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {getStatusBadge(user.verification_status || 'not_submitted')}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      className="primary-btn small"
                      onClick={() => onSelectUser(user.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserList

