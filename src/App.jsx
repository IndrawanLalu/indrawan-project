import './App.css'
import { Route, Routes } from 'react-router-dom'
import Amg from './pages/Amg'
import Diandra from './pages/Diandra'
import Home from './pages/Home'
import Header from './components/header'
import Padam from './pages/Padam'
import Login from './pages/Login'


function App() {
  return (
    <>
    <Header/>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        <Route path="/padam" Component={Padam} />
        <Route path="/diandra" Component={Diandra} />
        <Route path="/amg" Component={Amg} />
      </Routes>
    </>
  )
}

export default App
