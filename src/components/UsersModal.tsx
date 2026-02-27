import { useUserProfiles, useToggleAdmin } from '../hooks/useUserProfiles'
import { useToast } from './Toast'
import type { UserProfile } from '../lib/types'

interface Props {
  onClose: () => void
}

export function UsersModal({ onClose }: Props) {
  const { data: users = [], isLoading } = useUserProfiles()
  const toggleAdmin = useToggleAdmin()
  const { showToast } = useToast()

  const handleToggle = async (user: UserProfile) => {
    try {
      await toggleAdmin.mutateAsync({ id: user.id, isAdmin: !user.isAdmin })
      showToast(`${user.email} ${!user.isAdmin ? 'is now admin' : 'is no longer admin'} ✓`)
    } catch {
      showToast('Error updating user')
    }
  }

  return (
    <div
      className="modal-backdrop"
      id="modal-users"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">Manage Users</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {isLoading && <div className="catalog-empty">Loading…</div>}
          {!isLoading && users.length === 0 && (
            <div className="catalog-empty">No users found.</div>
          )}
          {users.map((user) => (
            <div key={user.id} className="user-row">
              <span className="user-email">{user.email}</span>
              <label className="toggle-label">
                <span className="toggle-text">Admin</span>
                <button
                  className={`toggle-switch${user.isAdmin ? ' toggle-on' : ''}`}
                  onClick={() => handleToggle(user)}
                  disabled={toggleAdmin.isPending}
                  aria-label={`Toggle admin for ${user.email}`}
                >
                  <span className="toggle-knob" />
                </button>
              </label>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
