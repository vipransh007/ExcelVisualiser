import { useState } from 'react'
import Navbar from './assets/components/Navbar.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    </>
  )
}

export default App
