import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeHeader() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl mb-6">
      {/* En-tête principal */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Mes Événements</h1>
          <p className="text-orange-100 text-lg">
            Gérez vos compétitions sportives et créez des moments mémorables
          </p>
        </div>
        <Button
          onClick={() => router.push("/create-event")}
          className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl font-semibold border-2 border-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvel Événement
        </Button>
      </div>
    </div>
  );
}
