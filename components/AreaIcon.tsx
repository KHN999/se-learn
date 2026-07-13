import {
  Blocks,
  Boxes,
  Braces,
  Cloud,
  Cpu,
  Database,
  FlaskConical,
  Gauge,
  GitBranch,
  GitFork,
  Globe,
  KeyRound,
  Layers,
  Network,
  Shapes,
  Share2,
  ShieldCheck,
  Table2,
  TrendingUp,
  Users,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Blocks,
  Boxes,
  Braces,
  Cloud,
  Cpu,
  Database,
  FlaskConical,
  Gauge,
  GitBranch,
  GitFork,
  Globe,
  KeyRound,
  Layers,
  Network,
  Shapes,
  Share2,
  ShieldCheck,
  Table2,
  TrendingUp,
  Users,
  Webhook,
  Workflow,
};

export function AreaIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Boxes;
  return <Icon className={className} />;
}
