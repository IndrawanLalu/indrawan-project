import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Search from "@/Search";

const Diandra = () => {
  return (
    <>
      <div className="py-4">
        <div className="py-6 flex px-4 gap-4 items-center ">
          <div>
            <Avatar className="">
              <AvatarImage src="/diandra.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <h2>Diandra Barcode</h2>
        </div>
      </div>
      <Search />
    </>
  );
};

export default Diandra;
