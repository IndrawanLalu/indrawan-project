import './App.css'
import { Route, Routes } from 'react-router-dom'
import Amg from './pages/Amg'
import Diandra from './pages/Diandra'
import Home from './pages/Home'
import Header from './components/header'


function App() {
  return (
    <>
    <Header/>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/diandra" Component={Diandra} />
        <Route path="/amg" Component={Amg} />
      </Routes>
    </>
  )
}

export default App
