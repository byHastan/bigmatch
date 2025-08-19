import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  description,
  className,
  disabled = false,
}: ToggleProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex-1">
        {label && <p className="font-medium text-gray-900">{label}</p>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      <button
        onClick={() => !disabled && onCheckedChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>

      {/* Icônes indicatrices */}
      <div className="flex items-center space-x-2 ml-3">
        <span className="text-xs text-gray-500">
          {checked ? "Public" : "Privé"}
        </span>
      </div>
    </div>
  );
}

export function PublicPrivateToggle({
  isPublic,
  onToggle,
  className,
}: {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 shadow-sm border border-gray-100",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Visibilité de l'événement
      </h3>

      <Toggle
        checked={isPublic}
        onCheckedChange={onToggle}
        label={isPublic ? "Événement public" : "Événement privé"}
        description={
          isPublic
            ? "Visible dans la recherche et accessible à tous"
            : "Visible uniquement avec le code d'inscription"
        }
      />
    </div>
  );
}
