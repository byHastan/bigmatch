import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onSubmit: (e: React.FormEvent) => void;
}

export default function ActionButtons({ onSubmit }: ActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Annuler
      </Button>
      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={onSubmit}
      >
        Créer l'événement
      </Button>
    </div>
  );
}
