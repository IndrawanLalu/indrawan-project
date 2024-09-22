import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Search from "@/Search"

const Diandra = () => {
    return (
        <>
        <div className='py-4'>
          <Button variant="neutral" className="py-6  gap-4">
            <div>
              <Avatar className="">
            <AvatarImage src="/diandra.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          </div>Diandra Barcode</Button>
        </div>
        <Search/>
      </>
    )
}

export default Diandra