

import './App.css'
import { Button } from './components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import Search from './Search'


function App() {


  return (
    <>
      <div className='py-4'>
        
        <Button className="py-6 gap-4"><Avatar>
          <AvatarImage src="/diandra.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>Diandra Barcode</Button>
      </div>

      <Search />
    </>
  )
}

export default App
