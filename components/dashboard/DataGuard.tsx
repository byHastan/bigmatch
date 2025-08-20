import { ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface DataGuardProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: any;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
  fallback?: ReactNode;
}

export function DataGuard<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  fallback,
}: DataGuardProps<T>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">❌</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-500 mb-4">
          {error?.message || "Une erreur est survenue lors du chargement des données"}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      fallback || (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune donnée
          </h3>
          <p className="text-gray-500">
            Aucune donnée n'est disponible pour le moment
          </p>
        </div>
      )
    );
  }

  return <>{children(data)}</>;
}
