import { Button } from "@/components/ui/button";
import { Filter, Plus, SortAsc } from "lucide-react";
import { useRouter } from "next/navigation";

interface HomeHeaderProps {
  eventsCount: number;
}

export default function HomeHeader({ eventsCount }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl mb-6">
      {/* En-tête principal */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Statistiques rapides */}
      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">
              Événements actifs
            </p>
            <p className="text-2xl font-bold">{eventsCount}</p>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Boutons de tri et filtres */}
      <div className="flex space-x-3 mt-4">
        <Button
          variant="outline"
          className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-orange-600 rounded-xl px-4 py-2"
        >
          <SortAsc className="w-4 h-4 mr-2" />
          TRIER PAR
        </Button>
        <Button
          variant="outline"
          className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-orange-600 rounded-xl px-4 py-2"
        >
          <Filter className="w-4 h-4 mr-2" />
          FILTRES
        </Button>
      </div>
    </div>
  );
}
