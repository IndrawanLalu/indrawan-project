import { Button } from "@/components/ui/button"

import SearchAmg from "@/SearchAmg"

const Amg = () => {
    return (
        <>
            <div className='py-4'>
                <Button className="py-6 gap-4">
                    Beban Gardu Selong
                </Button>
            </div><SearchAmg/>
        </>
    )
}

export default Amg;