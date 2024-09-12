
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const TablePadam = () => {
    return (
        <>
            <h1>Event Padam</h1>
            <div className="border rounded-md w-full ">
            <Table  className="w-full flex flex-col ">
                <TableHeader className="bg-slate-300" >
                    <TableRow className="flex flex-row w-full justify-between justify-items-center items-center">
                        <TableHead className="items-center" >No.</TableHead>
                        <TableHead >Tanggal</TableHead>
                        <TableHead>Penyulang</TableHead>
                        <TableHead>Beban</TableHead>
                        <TableHead>Jam Padam</TableHead>
                        <TableHead>Jam Nyala</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="border-y bg-slate-200" >
                    <TableRow className="flex flex-row w-full justify-between justify-items-center items-center">
                        <TableCell>1</TableCell>
                        <TableCell>01-September-2024</TableCell>
                        <TableCell>Pandan Duri</TableCell>
                        <TableCell>5 MW</TableCell>
                        <TableCell>18.00</TableCell>
                        <TableCell>20:00</TableCell>
                        <TableCell>MLS</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </div>
        </>
    )
}

export default TablePadam