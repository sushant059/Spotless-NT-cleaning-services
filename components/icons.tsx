import { Armchair, BedDouble, Building2, Frame, KeyRound, Layers, PawPrint, Siren, Sofa, type LucideIcon } from "lucide-react";
import type { IconName } from "@/lib/types";

const ICONS: Record<IconName, LucideIcon> = {
  layers: Layers,
  sofa: Sofa,
  bed: BedDouble,
  rug: Frame,
  armchair: Armchair,
  paw: PawPrint,
  siren: Siren,
  key: KeyRound,
  building: Building2,
};

export function ServiceIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name] ?? Layers;
  return <Icon className={className} aria-hidden />;
}
