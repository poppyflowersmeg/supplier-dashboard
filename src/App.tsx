import { useAuth } from './hooks/useAuth'
import { LoginScreen } from './components/LoginScreen'
import { NavBar } from './components/NavBar'
import { SupplierSection } from './components/SupplierSection/SupplierSection'
import { CatalogSection } from './components/CatalogSection/CatalogSection'

export function App() {
  const { session, loading, accessDenied, signIn, signOut } = useAuth()

  if (loading) return null

  if (!session) {
    return <LoginScreen onSignIn={signIn} accessDenied={accessDenied} />
  }

  return (
    <>
      <NavBar userEmail={session.user.email ?? ''} onSignOut={signOut} />
      <div className="page">
        <SupplierSection />
        <CatalogSection />
      </div>
    </>
  )
}
