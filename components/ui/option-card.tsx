import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import * as React from "react";

interface OptionCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OptionCard({
  label,
  description,
  icon: Icon,
  color,
  isSelected = false,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:scale-105",
        "bg-white shadow-lg hover:shadow-xl",
        isSelected
          ? "border-current ring-4 ring-current/20"
          : "border-gray-200 hover:border-current",
        className
      )}
      style={
        {
          "--tw-ring-color": color,
          "--tw-border-opacity": isSelected ? 1 : 0.5,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-8 w-8" style={{ color: color }} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold" style={{ color: color }}>
            {label}
          </h3>
          <p className="text-sm text-gray-600 max-w-xs">{description}</p>
        </div>
      </div>
    </div>
  );
}
