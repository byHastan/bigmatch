"use client";

import { useUserRole } from "@/src/hooks/useUserRole";
import { useSession } from "@/src/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Loader2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BasicInfoCard,
  DateTimeCard,
  EventRules,
  LocationCard,
  ProgressBar,
  ProgressIndicator,
  SuccessCard,
} from "@/components/events";
import { PublicPrivateToggle } from "@/components/ui/toggle";

type EventType = "MATCH" | "CHAMPIONNAT" | "COUPE";

interface CreateEventForm {
  name: string;
  description: string;
  type: EventType;
  date: Date | undefined;
  time: string;
  location: string;
  rules: string;
  maxTeams: number | null;
  maxPlayers: number | null;
  isPublic: boolean;
}

const steps = [
  { id: 1, title: "Informations", icon: "📝" },
  { id: 2, title: "Date & Heure", icon: "📅" },
  { id: 3, title: "Lieu", icon: "📍" },
  { id: 4, title: "Règles", icon: "⚖️" },
  { id: 5, title: "Inscription", icon: "🔗" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Utiliser l'authentification Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();
  const { userRole, isLoading: isRoleLoading } = useUserRole();
  const [formData, setFormData] = useState<CreateEventForm>({
    name: "",
    description: "",
    type: "MATCH",
    date: undefined,
    time: "",
    location: "",
    rules: "",
    maxTeams: null,
    maxPlayers: null,
    isPublic: true,
  });

  const [eventRules, setEventRules] = useState<any>({});
  const [registrationLink, setRegistrationLink] = useState("");
  const [codeCourt, setCodeCourt] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    if (!isSessionLoading && !isRoleLoading) {
      if (!session?.user?.id) {
        router.push("/");
        return;
      }

      if (!userRole || userRole.roleType !== "ORGANISATEUR") {
        router.push("/welcome");
        return;
      }
    }
  }, [session, userRole, isSessionLoading, isRoleLoading, router]);

  const handleInputChange = (field: keyof CreateEventForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      if (currentStep === 4) {
        // Créer l'événement via l'API
        createEvent();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createEvent = async () => {
    if (!formData.date) {
      alert("Veuillez sélectionner une date");
      return;
    }

    if (!session?.user?.id) {
      alert("Vous devez être connecté pour créer un événement");
      return;
    }

    if (!userRole || userRole.roleType !== "ORGANISATEUR") {
      alert("Vous devez avoir le rôle d'organisateur pour créer un événement");
      return;
    }

    setIsLoading(true);
    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        date: formData.date.toISOString(),
        time: formData.time,
        location: formData.location,
        rules: eventRules,
        maxTeams: formData.maxTeams,
        maxPlayers: formData.maxPlayers,
        isPublic: formData.isPublic,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        setCreatedEvent(result.data);
        setCodeCourt(result.data.registrationCode);
        setRegistrationLink(result.data.registrationLink);
        setCurrentStep(5);
      } else {
        alert(`Erreur lors de la création: ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error);
      alert("Erreur lors de la création de l'événement");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.name,
          text: `Rejoignez ${formData.name} ! Code d'inscription: ${codeCourt}`,
          url: registrationLink,
        });
      } catch (err) {
        console.error("Erreur lors du partage:", err);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      copyToClipboard(registrationLink);
    }
  };

  // Afficher un loader pendant le chargement de l'authentification
  if (isSessionLoading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  // Rediriger si pas d'utilisateur connecté ou pas le bon rôle
  if (!session?.user?.id || !userRole || userRole.roleType !== "ORGANISATEUR") {
    return null; // Le useEffect s'occupera de la redirection
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BasicInfoCard
              formData={formData}
              onInputChange={handleInputChange}
            />

            {/* Toggle Privé/Public */}
            <PublicPrivateToggle
              isPublic={formData.isPublic}
              onToggle={(isPublic) => handleInputChange("isPublic", isPublic)}
              className="mt-6"
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DateTimeCard
              date={formData.date}
              time={formData.time}
              onDateChange={(date) => handleInputChange("date", date)}
              onTimeChange={(time) => handleInputChange("time", time)}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LocationCard
              location={formData.location}
              onLocationChange={(location) =>
                handleInputChange("location", location)
              }
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EventRules
              eventType={formData.type}
              onRulesChange={setEventRules}
            />

            {/* Limites d'équipes et joueurs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Limites de participation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre max d'équipes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeams || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "maxTeams",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Illimité"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre max de joueurs
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxPlayers || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "maxPlayers",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Illimité"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <SuccessCard
              title="Événement créé avec succès ! 🎉"
              message={`Votre événement "${formData.name}" est maintenant prêt à recevoir des inscriptions.`}
            />

            {/* Informations de l'événement créé */}
            {createdEvent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Détails de l'événement
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        createdEvent.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {createdEvent.status === "DRAFT" ? "Brouillon" : "Actif"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibilité:</span>
                    <span className="text-gray-900">
                      {formData.isPublic ? "Public" : "Privé"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{createdEvent.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">
                      {new Date(createdEvent.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Code d'inscription */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Code d'inscription
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Code court</p>
                  <div className="text-3xl font-bold text-blue-600 tracking-wider font-mono">
                    {codeCourt}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center mb-4">
                Partagez ce code avec vos participants pour qu'ils puissent
                s'inscrire
              </p>
            </div>

            {/* Lien d'inscription */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lien d'inscription
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 mb-2">Lien complet</p>
                  <p className="text-sm font-mono text-gray-800 break-all">
                    {registrationLink}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => copyToClipboard(codeCourt)}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copier le code</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(registrationLink)}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 active:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copier le lien</span>
                  </button>
                </div>

                <button
                  onClick={shareEvent}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager l'événement</span>
                </button>
              </div>
            </div>

            {/* Message de confirmation */}
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-200 rounded-xl p-4 text-center"
              >
                <p className="text-green-800 font-medium">
                  ✓ Copié dans le presse-papiers !
                </p>
              </motion.div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header avec progression */}
      <ProgressBar
        steps={steps}
        currentStep={currentStep}
        title="Créer un événement"
        onBack={() => router.back()}
      />

      {/* Contenu principal */}
      <div className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

        {/* Navigation des étapes */}
        {currentStep < steps.length && (
          <div className="flex items-center justify-between mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              Précédent
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Terminer"
              ) : (
                "Suivant"
              )}
            </motion.button>
          </div>
        )}

        {/* Bouton final pour retourner au dashboard */}
        {currentStep === steps.length && (
          <div className="mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard/organisateur")}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 active:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Retourner au dashboard
            </motion.button>
          </div>
        )}

        {/* Indicateur de progression */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      </div>
    </div>
  );
}
