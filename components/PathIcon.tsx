import {
  Blocks,
  Compass,
  MonitorPlay,
  Rocket,
  Server,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Blocks,
  Compass,
  MonitorPlay,
  Rocket,
  Server,
};

export function PathIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Compass;
  return <Icon className={className} />;
}
