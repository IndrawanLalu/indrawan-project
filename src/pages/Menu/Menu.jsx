import { Button } from "@/components/ui/button"
import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ArrowBigRight } from "lucide-react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"


  
const Menu = () => {
    const user = useSelector((state) => state.auth.user); // Mengambil user dari Redux
    
    return (
        <div>
            <div className="Container border-main border-b grid grid-cols-2 mt-4 py-2">
                <h2 className="font-semibold text-start md:text-2xl md:pt-12 pt-2">Menu</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-md border-b norder-main">Inspeksi</CardTitle>
                    </CardHeader>
                    <CardFooter className="w-full justify-end ">
                        <Link to="/inspeksi" >
                        <Button size="sm" variant="neutral">GO  <ArrowBigRight className="ml-2 h-4 w-4" /> </Button>
                        </Link>
                    </CardFooter>
                </Card>
                {user?.role==="admin" | user?.role==="har" ? (
                    <Card>
                    <CardHeader>
                        <CardTitle className="text-md border-b norder-main">Pemeliharaan</CardTitle>
                    </CardHeader>
                    <CardFooter className="w-full justify-end ">
                        <Link to="/pemeliharaan" >
                        <Button size="sm" variant="neutral">GO  <ArrowBigRight className="ml-2 h-4 w-4" /> </Button>
                        </Link>
                    </CardFooter>
                </Card>
                ): null}
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-md border-b norder-main">Lokasi Gardu</CardTitle>
                    </CardHeader>
                    <CardFooter className="w-full justify-end ">
                        <Link to="/amg" >
                        <Button size="sm" variant="neutral">GO  <ArrowBigRight className="ml-2 h-4 w-4" /> </Button>
                        </Link>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-md border-b norder-main">Pemadaman</CardTitle>
                    </CardHeader>
                    <CardFooter className="w-full justify-end ">
                        <Button size="sm" variant="neutral">GO  <ArrowBigRight className="ml-2 h-4 w-4" /> </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Menu