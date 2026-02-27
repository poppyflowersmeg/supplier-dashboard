import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast" className={visible ? 'show' : ''}>{message}</div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
