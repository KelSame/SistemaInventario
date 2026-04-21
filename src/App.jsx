import { useState } from 'react'
import AppRoutes from "./Routes/AppRoutes";
import { AuthProvider } from "./Context/AuthContext";

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    </>
  )
}

export default App
