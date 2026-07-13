import type { Flow } from "@/lib/types";

export const deployFlow: Flow = {
  slug: "deploy",
  title: "Shipping to production",
  question: "How does code on your machine become a live, running service?",
  summary:
    "A change that works on your laptop is worthless until real users can hit it — safely. This flow follows one commit from your editor through review, testing, packaging, and a careful rollout, ending with the new version serving live traffic and a lever to undo it if it misbehaves.",
  outcome:
    "The new version is live — rolled out safely, verified by health checks and metrics, with a tested way back if it starts misbehaving.",
  unit: "s",
  stages: [
    {
      id: "commit-push",
      label: "Commit & push",
      icon: "GitBranch",
      oneLiner:
        "You record the change as a commit and push it to the shared git remote.",
      problem:
        "The code that matters lives only on your laptop — nobody else can see it, review it, or build on it, and one spilled coffee loses the work.",
      how: "Git snapshots your staged changes into a commit with a message and an author, then `push` uploads that commit to a shared remote like GitHub. The remote becomes the single source of truth that automation and teammates watch. A branch name lets your work-in-progress live alongside the stable main line.",
      input: "Edited files on your working branch.",
      output: "A commit on a remote branch that others and CI can see.",
      tradeoff:
        "Pushing early exposes rough work, but keeping it local risks losing it and hides it from the pipeline that catches mistakes.",
      latencyMs: 2,
      related: [
        { label: "Branching strategy", note: "Where a commit is allowed to land." },
        { label: "Commit hygiene", note: "Why small, well-described commits ease review and rollback." },
      ],
    },
    {
      id: "pull-request",
      label: "Pull request",
      icon: "Users",
      oneLiner:
        "You open a pull request so teammates can review the change before it merges.",
      problem:
        "One person can't catch every bug, security hole, or design mistake in their own code — and unreviewed changes to a shared codebase erode trust in it.",
      how: "A pull request bundles your branch's commits into a proposal to merge into main, with a diff and a description of intent. Reviewers read the diff, ask questions, and request changes; approval is usually required before merge. It also becomes the gate where automated checks must report green.",
      input: "A branch with one or more commits.",
      output: "An approved (or change-requested) proposal to merge.",
      tradeoff:
        "Review adds human latency — hours or days — in exchange for shared understanding and fewer defects reaching main.",
      latencyMs: 30,
      related: [
        { label: "Code review", note: "The human judgment CI can't replace." },
        { label: "Branch protection", note: "Rules that make review and CI unskippable." },
      ],
    },
    {
      id: "ci-tests",
      label: "CI tests",
      icon: "ShieldCheck",
      oneLiner:
        "Continuous integration runs the full test suite automatically on the pushed code.",
      problem:
        "You need to know the change didn't break anything before it goes near production — and humans forget to run tests, or run them on stale code.",
      how: "A CI service checks out the exact commit in a clean environment, installs dependencies, and runs linters and the test suite. A failure blocks the merge; a pass reports back to the pull request. Running in a fresh, consistent environment catches the 'works on my machine' bugs.",
      input: "A pushed commit or open pull request.",
      output: "A pass or fail signal attached to the change.",
      tradeoff:
        "Slower feedback than a local run, but consistent, isolated, and impossible to skip.",
      latencyMs: 120,
      related: [
        { label: "The testing pyramid", note: "What CI actually runs, and in what proportion." },
        { label: "Flaky tests", note: "Why intermittent failures poison trust in CI." },
      ],
    },
    {
      id: "build-image",
      label: "Build image",
      icon: "Container",
      oneLiner:
        "The app and its dependencies are packaged into a container image.",
      problem:
        "The app needs the same OS libraries, runtime version, and dependencies everywhere it runs — but staging, production, and your laptop all differ subtly.",
      how: "A build reads a Dockerfile, installs dependencies onto a base image, copies in the compiled or bundled app, and produces an immutable image tagged with the commit. That image bundles everything the app needs to run, so it behaves identically wherever it lands. Layer caching reuses unchanged steps to keep rebuilds fast.",
      input: "The tested source at a specific commit.",
      output: "A tagged, immutable container image.",
      tradeoff:
        "Images are larger and slower to produce than shipping raw code, but they eliminate environment drift between machines.",
      latencyMs: 60,
      related: [
        { label: "Immutable artifacts", note: "Why the built image, not the source, is what deploys." },
        { label: "Base images & layers", note: "How caching and image size are controlled." },
      ],
    },
    {
      id: "push-registry",
      label: "Push to registry",
      icon: "Package",
      oneLiner:
        "The built image is uploaded to a container registry the servers can pull from.",
      problem:
        "The image exists only on the build machine — the production servers that need to run it have no way to reach it there.",
      how: "The build pushes the tagged image to a registry, a versioned store for container images. Servers and orchestrators later pull the image by its tag or content digest. Referencing an image by digest guarantees every server runs byte-for-byte the same artifact.",
      input: "A locally built, tagged image.",
      output: "The image stored in the registry, addressable by tag or digest.",
      tradeoff:
        "An extra network round-trip and a store to secure and pay for, in exchange for a single distribution point every server trusts.",
      latencyMs: 25,
      related: [
        { label: "Image tags vs digests", note: "Why digests give reproducible deploys." },
        { label: "Registry auth", note: "Keeping private images out of the wrong hands." },
      ],
    },
    {
      id: "deploy-rollout",
      label: "Deploy",
      icon: "Rocket",
      oneLiner:
        "The orchestrator tells the servers to pull and run the new image.",
      problem:
        "Restarting everything at once with the new version would drop in-flight requests and risk a site-wide outage if the release is bad.",
      how: "You update the desired version in the orchestrator (for example a Kubernetes Deployment), and it starts new containers from the new image while the old ones keep serving. A rolling or canary strategy replaces instances gradually rather than all at once. The old version stays running until the new one proves itself.",
      input: "A registry image reference and a target environment.",
      output: "New-version instances starting up alongside the old.",
      tradeoff:
        "Gradual rollout is slower and briefly runs two versions at once, but it avoids an all-or-nothing outage.",
      latencyMs: 30,
      related: [
        { label: "Rolling vs canary vs blue-green", note: "How much risk each rollout style exposes." },
        { label: "Orchestrators", note: "What reconciles desired state with running containers." },
      ],
    },
    {
      id: "health-shift",
      label: "Health & traffic",
      icon: "RefreshCw",
      oneLiner:
        "New instances must pass health checks before the load balancer sends them traffic.",
      problem:
        "A container can be 'running' while the app inside is still starting, misconfigured, or unable to reach its database — sending users there would serve errors.",
      how: "Each new instance exposes a health endpoint the orchestrator and load balancer probe. Only instances that report healthy (readiness) are added to the pool; then traffic shifts from old to new. Once the new version is fully serving, the old instances are drained and removed.",
      input: "Newly started instances and probe results.",
      output: "Live user traffic flowing to the healthy new version.",
      tradeoff:
        "Waiting for probes and draining connections adds seconds to the cutover, but prevents routing users to a not-yet-ready app.",
      latencyMs: 20,
      related: [
        { label: "Readiness vs liveness probes", note: "The difference between 'ready for traffic' and 'still alive'." },
        { label: "Connection draining", note: "Finishing in-flight requests before killing old instances." },
      ],
    },
    {
      id: "monitor-rollback",
      label: "Monitor & roll back",
      icon: "Gauge",
      oneLiner:
        "You watch logs and metrics to confirm the release is healthy — and roll back if it isn't.",
      problem:
        "Green health checks don't prove the release is good: error rates, latency, or a subtle logic bug can only show up under real production traffic.",
      how: "Dashboards and alerts track error rate, latency, saturation, and business metrics against the pre-deploy baseline. If something regresses, you roll back by redeploying the previous known-good image — fast because it's already in the registry. Because artifacts are immutable and versioned, the rollback is a deterministic reversal, not a scramble.",
      input: "Live traffic, logs, and metric streams from the new version.",
      output: "A confirmed-healthy release, or a rollback to the prior version.",
      tradeoff:
        "Good observability costs instrumentation effort and storage, but without it you're flying blind and a bad release lingers unnoticed.",
      latencyMs: 60,
      related: [
        { label: "The four golden signals", note: "Latency, traffic, errors, saturation — what to watch." },
        { label: "Rollback vs roll-forward", note: "When to revert versus ship a fix on top." },
      ],
    },
  ],
};
