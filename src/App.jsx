import './App.css'
import { Route, Routes } from 'react-router-dom'
import Diandra from './pages/Diandra'
import Amg from './pages/Amg'
import Home from './pages/Home'


function App() {
  return (
    <>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/diandra" Component={Diandra} />
        <Route path="/amg" Component={Amg} />
      </Routes>
    </>
  )
}

export default App
