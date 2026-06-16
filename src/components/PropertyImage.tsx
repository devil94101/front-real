import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "../utils/cn";
import type { PropertyType } from "../types";
import { propertyTypeGradient } from "../lib/meta";

export function PropertyImage({
  src,
  type,
  className,
  rounded = "rounded-xl",
}: {
  src?: string;
  type: PropertyType;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
          propertyTypeGradient[type],
          rounded,
          className
        )}
      >
        <Building2 className="h-1/3 w-1/3 text-white/70" strokeWidth={1.5} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-slate-100", rounded, className)}>
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
