import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Inventory from './pages/Inventory'
import Error404 from './pages/Error404'
import Ejemplo from './pages/Ejemplo'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Ejemplo />}/>
        <Route path='/inventory' element={<Inventory />}/>
        <Route path='*' element={<Error404/>}/>
      </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
