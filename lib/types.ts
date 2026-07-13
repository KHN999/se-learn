// The knowledge model for SE-Map.
//
// A Flow is one end-to-end story ("what happens when you type a URL and press
// Enter"). It is made of ordered Stages. Each Stage is a small, self-contained
// lesson that answers the same set of questions every time, so the learner
// never loses their bearings:
//
//   Where am I?      -> label + position in the flow
//   What happens?    -> oneLiner
//   Why does it      -> problem   (start from the problem, never the definition)
//     exist?
//   How does it      -> how       (minimal technical explanation)
//     work?
//   What goes in/out -> input / output
//   What does it     -> tradeoff  (every technology has a cost)
//     cost?
//   What connects    -> related   (edges to other topics)
//     to it?
//
// Keeping this as typed data (not prose) means the same content drives the
// diagram, the side panel, and later the knowledge graph. Long-form deep-dive
// pages are where MDX will earn its place — not here.

export type RelatedTopic = {
  label: string;
  /** One line on *why* it is related — not just that it is. */
  note: string;
};

export type Stage = {
  id: string;
  /** Short name shown on the node, e.g. "DNS lookup". */
  label: string;
  /** lucide-react icon name (see components/FlowExplorer icon map). */
  icon: string;
  /** One sentence: what happens in this step. */
  oneLiner: string;
  /** The problem this step exists to solve. Lead with this, always. */
  problem: string;
  /** How it works — the minimum technical detail to build a real model. */
  how: string;
  /** What arrives at this step. */
  input: string;
  /** What leaves this step. */
  output: string;
  /** The cost or gotcha. Every step has one. */
  tradeoff: string;
  /** Rough latency in ms, used for the animation timing and the latency bar. */
  latencyMs: number;
  /** Edges to related concepts. */
  related: RelatedTopic[];
};

export type Flow = {
  slug: string;
  /** Short title for cards and nav. */
  title: string;
  /** The question the flow answers, phrased as a learner would ask it. */
  question: string;
  /** One-paragraph framing shown above the diagram. */
  summary: string;
  /** The happy ending, shown when the run finishes. */
  outcome: string;
  /** Unit label for the per-stage duration numbers (default "ms"). */
  unit?: string;
  stages: Stage[];
};
