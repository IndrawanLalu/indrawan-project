// src/pages/SeedPage.js

// import { useToast } from "@/hooks/use-toast";
// import { seedDataToFirestore } from "../seeder/seedSegment"; // Import seeder function
import Layouts from "@/pages/admin/Layouts";
// import { Button } from "@/components/ui/button";

const SeedSegment = () => {
  //   const { toast } = useToast();
  //   const handleSeed = async () => {
  //     try {
  //       await seedDataToFirestore();
  //       toast({
  //         variant: "success",
  //         title: "Suksess",
  //         description: "Seeding data sukses",
  //       });
  //     } catch (error) {
  //       console.error("Seeding failed:", error);
  //       alert("Seeding failed!");
  //     }
  //   };

  return (
    <Layouts>
      <h1>Data Seeder Segment</h1>
      {/* <Button onClick={handleSeed} className="btn btn-primary">
        Start Seeding Data Segment
      </Button> */}{" "}
    </Layouts>
  );
};

export default SeedSegment;
