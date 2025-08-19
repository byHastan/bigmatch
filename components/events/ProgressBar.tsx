interface Step {
  id: number;
  title: string;
  icon: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  title: string;
  onBack: () => void;
}

export default function ProgressBar({
  steps,
  currentStep,
  title,
  onBack,
}: ProgressBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-md mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Header avec titre et bouton retour */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
            {title}
          </h1>
          <div className="w-8 sm:w-10" />
        </div>

        {/* Barre de progression responsive */}
        <div className="flex items-center w-full justify-center">
          <div className="flex w-full items-center justify-between mb-2 mx-5">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                    currentStep >= step.id
                      ? "bg-blue-500 text-white shadow-lg scale-110"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Titre de l'étape responsive */}
        <p className="text-center text-xs sm:text-sm text-gray-600 font-medium px-2">
          {steps[currentStep - 1].title}
        </p>
      </div>
    </div>
  );
}
