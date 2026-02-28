import { useUserProfiles, useToggleAdmin } from '../hooks/useUserProfiles'
import { useToast } from './Toast'
import type { UserProfile } from '../lib/types'

interface Props {
  onClose: () => void
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
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
      <div className="modal" style={{ maxWidth: 520 }}>
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
              <div className="user-info">
                <span className="user-email">{user.email}</span>
                <span className="user-session-meta">
                  {formatRelative(user.lastSessionAt)}
                  {' · '}
                  {user.numSessions} {user.numSessions === 1 ? 'session' : 'sessions'}
                </span>
              </div>
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

