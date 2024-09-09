

import './App.css'
import { Route, Routes } from 'react-router-dom'
import Diandra from './pages/diandra'
import Amg from './pages/Amg'


function App() {


  return (
    <>
      
      <Routes>
        <Route path="/diandra" Component={Diandra} />
        <Route path="/amg" Component={Amg} />
        
      </Routes>


    </>
  )
}

export default App
