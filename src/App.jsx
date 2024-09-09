import './App.css'
import { Route, Routes } from 'react-router-dom'
import Amg from './pages/Amg'
import Diandra from './pages/Diandra'


function App() {
  return (
    <>
      <Routes>
        <Route path="/diandra" Component={Diandra} />
        <Route path="/" Component={Amg} />
      </Routes>
    </>
  )
}

export default App
