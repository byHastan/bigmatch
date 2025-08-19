"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Camera, CheckCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  number: number;
}

interface TeamRegistration {
  name: string;
  description: string;
  sport: string;
  logo: File | null;
  players: Player[];
}

export default function InscriptionPage({
  params,
}: {
  params: { code: string };
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [teamData, setTeamData] = useState<TeamRegistration>({
    name: "",
    description: "",
    sport: "",
    logo: null,
    players: [
      { id: "1", name: "", email: "", phone: "", position: "", number: 1 },
      { id: "2", name: "", email: "", phone: "", position: "", number: 2 },
    ],
  });

  const steps = [
    { id: 1, title: "Vérification du code", icon: "🔍" },
    { id: 2, title: "Informations de l'équipe", icon: "🏆" },
    { id: 3, title: "Joueurs", icon: "👥" },
    { id: 4, title: "Confirmation", icon: "✅" },
  ];

  // Vérifier le code d'inscription via l'API
  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/inscription?code=${params.code}`);
      const result = await response.json();

      if (result.success) {
        setEventInfo(result.data);
        setCurrentStep(2);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      alert("Erreur lors de la vérification du code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamDataChange = (field: keyof TeamRegistration, value: any) => {
    setTeamData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlayerChange = (
    playerId: string,
    field: keyof Player,
    value: any
  ) => {
    setTeamData((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, [field]: value } : player
      ),
    }));
  };

  const addPlayer = () => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      position: "",
      number: teamData.players.length + 1,
    };
    setTeamData((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  };

  const removePlayer = (playerId: string) => {
    if (teamData.players.length > 1) {
      setTeamData((prev) => ({
        ...prev,
        players: prev.players.filter((player) => player.id !== playerId),
      }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleTeamDataChange("logo", file);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationCode: params.code,
          teamData: {
            ...teamData,
            logo: teamData.logo ? teamData.logo.name : null, // Pour l'instant, on envoie juste le nom
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentStep(4);
      } else {
        alert(`Erreur lors de l'inscription: ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      alert("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Vérification du code d'inscription
              </h2>
              <p className="text-gray-600">
                Entrez le code d'inscription fourni par l'organisateur
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Code d'inscription</Label>
                    <Input
                      id="code"
                      value={params.code}
                      readOnly
                      className="text-center text-2xl font-mono font-bold text-blue-600"
                    />
                  </div>

                  <Button
                    onClick={verifyCode}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? "Vérification..." : "Vérifier le code"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Informations de l'équipe
              </h2>
              <p className="text-gray-600">
                Renseignez les informations de votre équipe
              </p>
            </div>

            {/* Informations de l'événement */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Événement : {eventInfo?.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Type :</span>{" "}
                    {eventInfo?.type}
                  </div>
                  <div>
                    <span className="font-medium">Date :</span>{" "}
                    {eventInfo?.date}
                  </div>
                  <div>
                    <span className="font-medium">Lieu :</span>{" "}
                    {eventInfo?.location}
                  </div>
                  <div>
                    <span className="font-medium">Places :</span>{" "}
                    {eventInfo?.currentTeams}/{eventInfo?.maxTeams}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teamName">Nom de l'équipe *</Label>
                    <Input
                      id="teamName"
                      value={teamData.name}
                      onChange={(e) =>
                        handleTeamDataChange("name", e.target.value)
                      }
                      placeholder="Ex: Les Champions"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={teamData.description}
                      onChange={(e) =>
                        handleTeamDataChange("description", e.target.value)
                      }
                      placeholder="Description de votre équipe..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sport">Sport *</Label>
                    <Input
                      id="sport"
                      value={teamData.sport}
                      onChange={(e) =>
                        handleTeamDataChange("sport", e.target.value)
                      }
                      placeholder="Ex: Football, Basketball..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo">Logo de l'équipe</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="logo"
                        className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        {teamData.logo ? (
                          <div className="text-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">
                              Logo sélectionné
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">
                              Ajouter un logo
                            </span>
                          </div>
                        )}
                        <input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">👥</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Joueurs de l'équipe
              </h2>
              <p className="text-gray-600">
                Ajoutez les informations de vos joueurs
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {teamData.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Joueur {index + 1}
                        </h4>
                        {teamData.players.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePlayer(player.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`name-${player.id}`}>
                            Nom complet *
                          </Label>
                          <Input
                            id={`name-${player.id}`}
                            value={player.name}
                            onChange={(e) =>
                              handlePlayerChange(
                                player.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Nom du joueur"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`email-${player.id}`}>Email</Label>
                          <Input
                            id={`email-${player.id}`}
                            type="email"
                            value={player.email}
                            onChange={(e) =>
                              handlePlayerChange(
                                player.id,
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="email@exemple.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`phone-${player.id}`}>
                            Téléphone
                          </Label>
                          <Input
                            id={`phone-${player.id}`}
                            value={player.phone}
                            onChange={(e) =>
                              handlePlayerChange(
                                player.id,
                                "phone",
                                e.target.value
                              )
                            }
                            placeholder="06 12 34 56 78"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`position-${player.id}`}>Poste</Label>
                          <Input
                            id={`position-${player.id}`}
                            value={player.position}
                            onChange={(e) =>
                              handlePlayerChange(
                                player.id,
                                "position",
                                e.target.value
                              )
                            }
                            placeholder="Ex: Attaquant, Défenseur..."
                          />
                        </div>

                        <div>
                          <Label htmlFor={`number-${player.id}`}>Numéro</Label>
                          <Input
                            id={`number-${player.id}`}
                            type="number"
                            value={player.number}
                            onChange={(e) =>
                              handlePlayerChange(
                                player.id,
                                "number",
                                parseInt(e.target.value) || 1
                              )
                            }
                            min="1"
                            max="99"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={addPlayer}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ajouter un joueur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Inscription réussie ! 🎉
              </h2>
              <p className="text-gray-600">
                Votre équipe a été inscrite avec succès à l'événement
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Récapitulatif de l'inscription
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Équipe :</span>{" "}
                        {teamData.name}
                      </div>
                      <div>
                        <span className="font-medium">Sport :</span>{" "}
                        {teamData.sport}
                      </div>
                      <div>
                        <span className="font-medium">Joueurs :</span>{" "}
                        {teamData.players.length}
                      </div>
                      <div>
                        <span className="font-medium">Événement :</span>{" "}
                        {eventInfo?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Un email de confirmation vous a été envoyé avec tous les
                      détails.
                    </p>
                    <p className="text-sm text-gray-600">
                      L'organisateur vous contactera pour la suite des
                      événements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Inscription Équipe
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-1">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full ${
                      currentStep >= step.id ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-16" /> {/* Espaceur pour centrer le titre */}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-md mx-auto px-4 py-6">
        {renderStepContent()}

        {/* Navigation des étapes */}
        {currentStep < steps.length && currentStep > 1 && (
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={prevStep} className="px-6 py-3">
              Précédent
            </Button>

            <Button
              onClick={currentStep === 3 ? handleSubmit : nextStep}
              disabled={isLoading}
              className="px-6 py-3"
            >
              {isLoading
                ? "Chargement..."
                : currentStep === 3
                ? "Finaliser l'inscription"
                : "Suivant"}
            </Button>
          </div>
        )}

        {/* Bouton final */}
        {currentStep === steps.length && (
          <div className="mt-8">
            <Button onClick={() => router.push("/")} className="w-full py-3">
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
