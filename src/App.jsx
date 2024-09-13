
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Amg from './pages/Amg'
import Diandra from './pages/Diandra'
import Home from './pages/Home'
import Header from './components/header'
import Padam from './pages/Padam'
import Login from './pages/Login/Login'
import "./firebase/firebaseConfig"

import ProtectedRoute from './components/ProtectedRoutes'



  
function App() {
  const protectedRoute = [
    {path: "/diandra", component : <Diandra/>},
    {path: "/amg", component : <Amg/>},
    {path: "/padam", component : <Padam/>},
    {path: "*", component : <Navigate to = "/"></Navigate>},

  ]
  return (
    <>
    <Header/>
   
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        {/* <Route path="/signup" Component={SignUp} /> */}
        

        {
          protectedRoute.map(({path, component}) => (
            <Route
            key={path}
            path={path}
            element={<ProtectedRoute>{component}</ProtectedRoute>} />
          ))
        }
        
      </Routes>
    
    </>
  )
}

export default App
