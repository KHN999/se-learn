import type { TopicContent } from "@/lib/topics";

export const batchG: TopicContent[] = [
  {
    slug: "why-testing",
    tagline:
      "Why writing more code to check your code is faster than testing by hand.",
    problem:
      "You fix a bug in the checkout flow, ship it, and two days later discover the fix broke the discount code that used to work. Nobody touched the discount code — but nobody re-checked it either. Every change to a growing codebase can silently break something far away, and clicking through the whole app by hand after each change stops being possible once it's more than a few screens. How do you know a change didn't break anything?",
    demo: "regression-catch",
    how: [
      {
        type: "para",
        text: "A test is code that runs your code and checks the result against what you expected. Because it's code, it runs in seconds and can be re-run on every change — so instead of re-checking everything by hand, you let the machine do it. When a test that used to pass starts failing, you've caught a regression before your users did.",
      },
      {
        type: "code",
        code: '// The discount code nobody touched\ntest("100% off makes the order free", () => {\n  expect(applyDiscount(50, 1.0)).toBe(0);\n});\n\n// After an unrelated checkout refactor, this turns red:\n//   Expected: 0   Received: 50   ← the discount silently stopped applying',
        caption: "A passing test that turns red after an unrelated change is a regression caught automatically.",
      },
      {
        type: "para",
        text: "The real payoff isn't proving code works the day you write it — it's the safety net that lets you change it later. A codebase with good tests is one you can refactor and extend with confidence; one without becomes something everyone is afraid to touch.",
      },
      {
        type: "demo",
        demo: "regression-catch",
      },
      {
        type: "note",
        text: "Tests can only show the presence of the bugs you thought to check for, never their total absence. They shrink the space of things that can silently break; they don't eliminate it.",
      },
    ],
    tradeoffs: {
      good: [
        "Catch regressions automatically instead of by manual clicking.",
        "Make refactoring safe — change code freely and the tests tell you what broke.",
        "Tests document how the code is meant to behave, in runnable form.",
        "Force you to design code that's actually callable in isolation.",
      ],
      costs: [
        "Tests are code too — they take time to write and must be maintained.",
        "Brittle tests that break on every harmless change train people to ignore them.",
        "They give false confidence if they test the wrong things or too little.",
        "Slow test suites get skipped, defeating the point.",
      ],
    },
    realWorld:
      "The moment a team feels this is the first time they refactor a tested module fearlessly, versus the dread of editing an untested one. Most CI pipelines exist to run the test suite on every push and block merges that break it.",
    related: [
      {
        slug: "unit-tests",
        note: "The smallest, fastest kind of test and the usual starting point.",
      },
      {
        slug: "ci-cd",
        note: "Where tests get run automatically on every change.",
      },
      {
        slug: "test-coverage",
        note: "One (imperfect) measure of how much your tests exercise.",
      },
      {
        slug: "tech-debt-refactoring",
        note: "Tests are the safety net that makes refactoring possible.",
      },
    ],
  },
  {
    slug: "unit-tests",
    tagline:
      "Testing one small piece of code in isolation, fast enough to run on every save.",
    problem:
      "A price-calculation function is buried three layers deep in your app. To check whether it handles a 100% discount correctly, you'd have to spin up the server, log in, add items to a cart, and click through to checkout — a minute of setup to test one line of logic. And if it's wrong, you still don't know if the bug is in the calculation or somewhere along that path. How do you test just that function, directly?",
    demo: "test-runner",
    how: [
      {
        type: "para",
        text: "A unit test calls one small unit of code — usually a single function or class — with specific inputs and asserts the output is what you expect. It touches nothing else: no database, no network, no filesystem. Because it's so isolated, it runs in milliseconds, so you can have thousands of them and run them all on every save.",
      },
      {
        type: "para",
        text: "The classic shape is arrange-act-assert: set up the inputs, call the code, check the result. When a unit test fails, it points almost exactly at the broken function, because nothing else was involved.",
      },
      {
        type: "code",
        code: '// price.test.js — one function, no server, no database\nimport { finalPrice } from "./price";\n\ntest("applies a 100% discount", () => {\n  const result = finalPrice({ amount: 50, discount: 1.0 }); // arrange + act\n  expect(result).toBe(0);                                    // assert\n});\n\ntest("rejects a negative discount", () => {\n  expect(() => finalPrice({ amount: 50, discount: -0.2 })).toThrow();\n});',
        caption: "Arrange, act, assert — one unit, specific inputs, an exact expected output.",
      },
      {
        type: "points",
        items: [
          "Test one thing per test, so a failure names the problem precisely.",
          "Cover the edge cases: empty input, zero, negative numbers, the boundary values.",
          "No external dependencies — if the code needs a database or API, that dependency is stubbed or mocked out.",
          "Fast by design: a whole suite of thousands should finish in seconds.",
        ],
      },
      {
        type: "demo",
        demo: "test-runner",
      },
    ],
    tradeoffs: {
      good: [
        "Pinpoint failures — a red test names the exact unit that broke.",
        "Fast enough to run constantly, giving instant feedback while you code.",
        "Cheap to write and easy to run in isolation.",
        "Encourage small, decoupled functions that are easy to call alone.",
      ],
      costs: [
        "Each unit passing doesn't prove the units work together.",
        "Testing units in isolation often requires mocking, which can drift from reality.",
        "Over-testing trivial code adds maintenance with little payoff.",
        "Tests coupled to internal details break when you refactor them.",
      ],
    },
    realWorld:
      "Pure logic — calculations, parsing, validation, business rules — is the sweet spot for unit tests. They form the wide base of the 'test pyramid': many fast unit tests, fewer integration tests, a handful of slow end-to-end tests.",
    related: [
      {
        slug: "integration-tests",
        note: "The next layer up — checking that units work together.",
      },
      {
        slug: "mocking",
        note: "How you replace a unit's real dependencies to test it alone.",
      },
      {
        slug: "functions-one-thing",
        note: "Code that does one thing is far easier to unit test.",
      },
      {
        slug: "why-testing",
        note: "The broader case for having any tests at all.",
      },
    ],
  },
  {
    slug: "integration-tests",
    tagline:
      "Checking that separately-working pieces actually work together.",
    problem:
      "Your order service passes all its unit tests. Your payment client passes all of its. But in production, orders fail — the payment client sends amounts in dollars and the payment API expects cents. Each unit was correct in isolation; the bug lives in the gap between them, exactly where no unit test looks. How do you catch failures at the seams?",
    demo: "test-pyramid",
    how: [
      {
        type: "para",
        text: "An integration test exercises several units together, often including real external systems like a database, a cache, or another service. Instead of stubbing the database, you run the query against a real (usually disposable) one and check the rows that come back. It verifies the wiring: the data formats, the SQL, the API contracts, the assumptions each piece makes about the others.",
      },
      {
        type: "code",
        code: '// Runs against a real, throwaway Postgres — not a mock\ntest("saveOrder stores the amount in cents", async () => {\n  const db = await startTestDb();          // disposable container\n  await saveOrder(db, { totalDollars: 19.99 });\n\n  const row = await db.query("SELECT amount_cents FROM orders");\n  expect(row.amount_cents).toBe(1999);     // the dollars-vs-cents seam\n});',
        caption: "Hitting a real (disposable) database is what surfaces the dollars-vs-cents mismatch between two units.",
      },
      {
        type: "para",
        text: "These sit in the middle of the test pyramid — slower and fewer than unit tests, because they involve real I/O, but far more realistic. A common setup spins up a throwaway database in a container, seeds it, runs the code path, and asserts on the actual result.",
      },
      {
        type: "demo",
        demo: "test-pyramid",
      },
      {
        type: "note",
        text: "The line between 'unit' and 'integration' is fuzzy and teams draw it differently. What matters isn't the label but whether you're testing a piece alone or several pieces talking to each other.",
      },
    ],
    tradeoffs: {
      good: [
        "Catch the bugs that live between components — the ones unit tests miss.",
        "Verify real database queries, migrations, and API contracts actually work.",
        "Higher confidence than mocks, because they use the real dependencies.",
        "Fewer, broader tests can cover a lot of realistic behavior.",
      ],
      costs: [
        "Slower than unit tests — real I/O costs milliseconds to seconds each.",
        "More setup: databases to start, seed data to manage, state to reset.",
        "Flakier — network, timing, and shared state introduce nondeterminism.",
        "A failure points at a wider area, so it's harder to localize.",
      ],
    },
    realWorld:
      "Anything that talks to a database is the prime candidate: you want to know your queries and migrations actually run against the real engine, not a mock that always agrees with you. Testcontainers-style throwaway databases are the common way to make these reliable.",
    related: [
      {
        slug: "unit-tests",
        note: "The faster, narrower layer below integration tests.",
      },
      {
        slug: "e2e-tests",
        note: "The broadest layer — the whole system through the front door.",
      },
      {
        slug: "docker-containers",
        note: "How disposable test databases and services are usually spun up.",
      },
      {
        slug: "mocking",
        note: "The alternative that integration tests deliberately avoid using.",
      },
    ],
  },
  {
    slug: "e2e-tests",
    tagline:
      "Driving the whole running system like a real user, front door to database.",
    problem:
      "Every service passes its own tests, but the signup flow is still broken: the frontend posts to the wrong URL after a route change, and no lower-level test noticed because each piece was tested in isolation. The only thing that would have caught it is actually filling in the form and clicking 'Sign up' in a real browser. How do you test the system the way a user experiences it?",
    demo: "e2e-flow",
    how: [
      {
        type: "para",
        text: "An end-to-end (E2E) test drives the fully assembled, running system from the outside — a real browser clicking buttons and typing into forms, or a client hitting the live API — and checks the user-visible outcome. It goes through every layer: UI, network, backend, database. If a user can do it, an E2E test can do it too.",
      },
      {
        type: "code",
        code: '// Playwright drives a real browser, front door to database\ntest("a new user can sign up", async ({ page }) => {\n  await page.goto("/signup");\n  await page.fill("#email", "sam@example.com");\n  await page.fill("#password", "hunter2");\n  await page.click("text=Sign up");\n\n  await expect(page.getByText("Welcome, Sam")).toBeVisible();\n});',
        caption: "A real browser fills the form and clicks — the only test that catches a broken post-signup URL.",
      },
      {
        type: "para",
        text: "These sit at the top of the test pyramid: the most realistic and the most valuable per test, but also the slowest, flakiest, and most expensive to maintain. You keep only a handful, covering the critical paths — sign up, log in, check out — not every edge case.",
      },
      {
        type: "points",
        items: [
          "Tools like Playwright, Cypress, and Selenium drive a real browser.",
          "Cover critical user journeys, not exhaustive edge cases — those belong lower down.",
          "Test against a full deployment, so environment and config bugs surface too.",
          "Prone to flakiness from timing and animations; needs careful waiting logic.",
        ],
      },
      {
        type: "demo",
        demo: "e2e-flow",
      },
    ],
    tradeoffs: {
      good: [
        "Highest confidence — if it passes, a real user can do it.",
        "Catch integration and config bugs no isolated test can see.",
        "Test the actual user experience, not a developer's model of it.",
      ],
      costs: [
        "Slowest tests by far — seconds to minutes each.",
        "Flaky: timing, network, and UI changes break them easily.",
        "Expensive to write and maintain; a small UI change can break many.",
        "A failure can be anywhere in the stack, so debugging is harder.",
      ],
    },
    realWorld:
      "Teams keep a small suite of E2E tests for the money paths — the flows that must never break — and rely on faster unit and integration tests for everything else. Chasing E2E coverage for every case leads to a slow, flaky suite people learn to ignore.",
    related: [
      {
        slug: "integration-tests",
        note: "The narrower layer below — components together, but not the whole system.",
      },
      {
        slug: "unit-tests",
        note: "The fast base of the pyramid E2E tests sit on top of.",
      },
      {
        slug: "why-testing",
        note: "Why the whole layered strategy is worth the effort.",
      },
      {
        slug: "ci-cd",
        note: "E2E suites often run against a staging deploy in the pipeline.",
      },
    ],
  },
  {
    slug: "mocking",
    tagline:
      "Replacing a real dependency with a fake one you fully control, so you can test in isolation.",
    problem:
      "You want to test the code that emails a receipt after a purchase. Running it for real would send an actual email to a real inbox every test run, cost money, and fail whenever the mail server is down — none of which has anything to do with whether your code is correct. And how do you test the 'what if the mail server returns an error?' path without breaking a real one? You need a stand-in.",
    demo: "mocking",
    how: [
      {
        type: "para",
        text: "A mock is a fake version of a dependency that you substitute in during a test. Instead of calling the real email service, database, or payment API, your code calls the mock — which returns whatever you tell it to and records how it was called. This lets you test one unit without dragging its whole dependency chain along.",
      },
      {
        type: "code",
        code: '// Replace the real mail server with a controllable stand-in\nconst mailer = { send: jest.fn() };\n\ntest("sends a receipt after purchase", () => {\n  checkout({ total: 50 }, mailer);\n  expect(mailer.send).toHaveBeenCalledWith(\n    expect.objectContaining({ subject: "Your receipt" })\n  );\n});\n\n// Force the error path that is hard to trigger for real:\nmailer.send.mockRejectedValue(new Error("mail server down"));',
        caption: "The mock stands in for the real mail server — no email sent, and you can force the failure path on demand.",
      },
      {
        type: "para",
        text: "Mocks serve two jobs: standing in for slow or unavailable systems, and letting you force specific scenarios — an API timeout, a 500 error, an empty result — that are hard to trigger for real. 'Mock', 'stub', and 'fake' are used loosely; the shared idea is a controllable replacement.",
      },
      {
        type: "demo",
        demo: "mocking",
      },
      {
        type: "note",
        text: "The danger is mocks drifting from reality. If the real API changes its response shape but your mock still returns the old one, your tests stay green while production breaks. Mocks test your code against your assumptions, not against the real thing.",
      },
    ],
    tradeoffs: {
      good: [
        "Test a unit in isolation without its slow or external dependencies.",
        "Force error paths and edge cases that are hard to reproduce for real.",
        "Fast and deterministic — no network, no flakiness.",
        "Avoid side effects like real emails, charges, or data changes.",
      ],
      costs: [
        "Mocks can drift from the real dependency, giving false confidence.",
        "Over-mocking tests your assumptions, not real behavior.",
        "Tests coupled to how a function is called (not what it returns) break on refactor.",
        "Complex mock setups become their own maintenance burden.",
      ],
    },
    realWorld:
      "Mocking is heaviest in unit tests, where isolation is the goal. Integration tests deliberately swing the other way — using real dependencies precisely to catch the drift that mocks hide. Good suites balance the two.",
    related: [
      {
        slug: "unit-tests",
        note: "The context where mocking is most common — isolating one unit.",
      },
      {
        slug: "integration-tests",
        note: "The counterweight — using real dependencies to catch mock drift.",
      },
      {
        slug: "coupling-cohesion",
        note: "Code with loose coupling is far easier to swap a mock into.",
      },
      {
        slug: "rest",
        note: "External APIs are among the most-mocked dependencies.",
      },
    ],
  },
  {
    slug: "test-coverage",
    tagline:
      "The fraction of your code that runs when the tests run — and why 100% isn't the goal.",
    problem:
      "A team proudly reports 95% test coverage, then ships a bug in a payment edge case. The line that broke was 'covered' — a test executed it — but no test ever checked that its output was correct for a negative amount. Coverage counted the line as tested when nothing actually verified it. So what is coverage really telling you?",
    demo: "coverage",
    how: [
      {
        type: "para",
        text: "Test coverage measures how much of your code is executed while the test suite runs, usually as a percentage of lines or branches. A coverage tool runs your tests, watches which lines fire, and reports what never ran at all. Its real value is negative: it shows you code that no test touches — definite blind spots.",
      },
      {
        type: "para",
        text: "The trap is treating high coverage as high quality. Coverage only measures that a line ran, not that anything asserted the result was correct. You can execute every line and check nothing. So coverage is a useful floor ('this whole module is untested') but a misleading ceiling ('we're at 90%, we're safe').",
      },
      {
        type: "code",
        code: 'function refund(amount) {\n  if (amount < 0) return 0;   // ← this line runs, so it counts as "covered"\n  return amount;\n}\n\ntest("refund returns the amount", () => {\n  refund(-5);                 // executes the guard → 100% line coverage\n  expect(refund(50)).toBe(50);\n});\n// Coverage: 100%. Bug: nobody asserted refund(-5) === 0.',
        caption: "Every line executed, so coverage reads 100% — yet nothing verified the negative-amount result.",
      },
      {
        type: "points",
        items: [
          "Line coverage: which lines ran. Branch coverage: which if/else paths ran (stricter, more useful).",
          "Good at finding untested code; bad at proving tested code is correct.",
          "Chasing 100% wastes effort on trivial code and rewards assertion-free tests.",
          "A sensible target is a team norm, not a universal magic number.",
        ],
      },
      {
        type: "demo",
        demo: "coverage",
      },
    ],
    tradeoffs: {
      good: [
        "Reveals code no test touches at all — genuine blind spots.",
        "Cheap and automatic; runs alongside the test suite.",
        "Branch coverage nudges you to test both sides of conditionals.",
        "A coverage drop in a pull request flags newly untested code.",
      ],
      costs: [
        "Measures execution, not correctness — you can cover a line and assert nothing.",
        "High coverage gives false confidence.",
        "Chasing 100% wastes time on trivial or generated code.",
        "A hard percentage gate encourages gaming with low-value tests.",
      ],
    },
    realWorld:
      "Coverage is best used as a signal, not a target — most teams watch for coverage dropping on new code rather than enforcing a single number. Treating a percentage as the goal (Goodhart's law) reliably produces tests that run everything and verify nothing.",
    related: [
      {
        slug: "unit-tests",
        note: "The tests coverage most directly measures.",
      },
      {
        slug: "why-testing",
        note: "Coverage is one metric for the broader question of test value.",
      },
      {
        slug: "ci-cd",
        note: "Where coverage is measured and reported on each change.",
      },
      {
        slug: "e2e-tests",
        note: "Coverage tools rarely capture what these slower tests exercise.",
      },
    ],
  },
  {
    slug: "logs-stack-traces",
    tagline:
      "The breadcrumbs a program leaves so you can reconstruct what happened after it's gone.",
    problem:
      "At 3am a request failed in production. You can't attach a debugger — the moment has passed and you can't reproduce it. All you have is what the program wrote down as it ran. If it recorded nothing, the failure is a mystery you may never solve. What should it have written, and how do you read it?",
    demo: "stack-trace",
    how: [
      {
        type: "para",
        text: "A log is a timestamped record a program writes as it runs — 'received request X', 'querying database', 'payment failed'. Logs are how you see inside a system you can't pause. When something goes wrong, a stack trace shows the exact chain of function calls that led to the error: which line threw it, and every call above it that got there.",
      },
      {
        type: "para",
        text: "Reading a stack trace is a skill: the top frame is usually where the error was raised, and you read downward (or upward, depending on language) through the callers to find the one in your code. Logs use severity levels so you can filter — DEBUG for detail while developing, ERROR for things that need attention in production.",
      },
      {
        type: "code",
        code: "TypeError: Cannot read properties of undefined (reading 'total')\n    at formatReceipt (checkout.js:42:18)   ← first frame in YOUR code — start here\n    at processOrder  (checkout.js:17:5)\n    at handleRequest (server.js:88:12)\n    at node_modules/express/lib/router.js:281:10   ← library frames, read past them",
        caption: "Read down to the first frame in your own code — checkout.js:42 — and start debugging there.",
      },
      {
        type: "points",
        items: [
          "Levels: DEBUG, INFO, WARN, ERROR — filter noise from what matters.",
          "Structured logs (key-value or JSON) are searchable; plain text isn't at scale.",
          "Include context: a request ID, user ID, timestamp — enough to correlate events.",
          "A stack trace names the failing line and the path of calls that reached it.",
        ],
      },
      {
        type: "demo",
        demo: "stack-trace",
      },
      {
        type: "note",
        text: "Logging too much is its own problem: it costs money to store, buries the signal, and can leak passwords or personal data into files. Log enough to diagnose, never secrets.",
      },
    ],
    tradeoffs: {
      good: [
        "See what happened in production, where you can't attach a debugger.",
        "Stack traces point at the exact failing line and call path.",
        "Structured, searchable logs make incidents diagnosable after the fact.",
        "Cheap to add and always on, unlike interactive debugging.",
      ],
      costs: [
        "Too much logging buries the useful lines and costs storage.",
        "Careless logs leak secrets and personal data.",
        "Logs show what you thought to record — gaps are invisible.",
        "Writing logs synchronously can slow the hot path.",
      ],
    },
    realWorld:
      "Logs and stack traces are the first thing anyone opens during an incident. Centralized logging (ELK, Loki, cloud log services) exists so you can search across many machines at once, and a shared request ID lets you trace one request through every service it touched.",
    related: [
      {
        slug: "observability",
        note: "Logs are one of its three pillars, alongside metrics and traces.",
      },
      {
        slug: "breakpoints-profiling",
        note: "The interactive alternative when you can reproduce the bug locally.",
      },
      {
        slug: "error-handling",
        note: "Where you decide what to log and what to raise.",
      },
      {
        slug: "microservices",
        note: "Distributed systems make correlating logs across services essential.",
      },
    ],
  },
  {
    slug: "breakpoints-profiling",
    tagline:
      "Pausing a program to inspect it, and measuring where it actually spends its time.",
    problem:
      "A function returns the wrong value and staring at the code hasn't revealed why. You could scatter print statements everywhere, re-run, read the output, add more, and repeat — a slow guessing game. Separately, a page is slow but you have no idea which of its fifty function calls is the culprit; optimizing the wrong one wastes a day. There are better tools for both.",
    demo: "profiler",
    how: [
      {
        type: "para",
        text: "A debugger lets you set a breakpoint — a line where execution pauses — then inspect every variable's value at that exact moment, and step through the code one line at a time to watch what happens. Instead of guessing from print statements, you see the actual state as the program runs. It's the fastest way to answer 'what is this variable right here?'",
      },
      {
        type: "para",
        text: "A profiler answers a different question: where does the time (or memory) go? It runs your program and measures how long each function takes and how often it's called, so you optimize the part that actually dominates. The rule is measure first — intuition about what's slow is famously wrong, and optimizing a function that takes 1% of the time is wasted effort.",
      },
      {
        type: "code",
        code: '// Profiler output: where an 800ms render actually went\nrender()            810ms  total\n  parseMarkdown()   740ms   ← 91% of the time — the real bottleneck\n  formatDate()        3ms   ← the "obvious" suspect; optimizing it saves nothing\n  sortItems()         2ms\n\n// Measure first, then fix the one line that dominates.',
        caption: "The profiler shows 91% of the time in one call — measure before you optimize, do not guess.",
      },
      {
        type: "points",
        items: [
          "Breakpoint: pause at a line and inspect live variables and the call stack.",
          "Step over / into / out: walk through execution one call at a time.",
          "Conditional breakpoints pause only when a condition is true — great for 'it fails on the 900th item'.",
          "Profilers produce flame graphs or hot-spot lists showing where time is spent.",
        ],
      },
      {
        type: "demo",
        demo: "profiler",
      },
      {
        type: "note",
        text: "Premature optimization is guessing without measuring. Profile first, fix the biggest hot spot, then measure again — most slowness concentrates in a small fraction of the code.",
      },
    ],
    tradeoffs: {
      good: [
        "See real variable values instead of inferring them from print statements.",
        "Step through logic to find exactly where behavior diverges from expectation.",
        "Profilers point at the true bottleneck, so effort goes where it pays.",
        "Conditional breakpoints isolate rare, data-dependent bugs.",
      ],
      costs: [
        "Debuggers need a reproducible, local failure — useless for last night's crash.",
        "Hard to use across async boundaries, threads, or distributed systems.",
        "Profiling adds overhead and can distort the very timings it measures.",
        "A flame graph still needs interpretation to act on.",
      ],
    },
    realWorld:
      "IDE debuggers (VS Code, IntelliJ, browser dev tools) make breakpoints a click away. For performance, profilers ship with most languages and platforms; the discipline of 'profile, don't guess' is what separates real speedups from wishful rewrites.",
    related: [
      {
        slug: "logs-stack-traces",
        note: "What you fall back on when you can't attach a debugger.",
      },
      {
        slug: "cpu-memory-usage",
        note: "What a profiler measures to find the bottleneck.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Profiling tells you which one your bottleneck is hurting.",
      },
      {
        slug: "n-plus-1",
        note: "A slowdown a profiler or query log reveals instantly.",
      },
    ],
  },
  {
    slug: "latency-vs-throughput",
    tagline:
      "How long one thing takes versus how many things you can do per second — and why they're different.",
    problem:
      "You add more servers to handle a traffic spike, and the system now serves far more requests per second — but each individual user's page still takes the same 800ms it always did, and they're not happier. You improved one thing and left the other untouched. These are two separate measures of speed, and confusing them leads to fixing the wrong one. Which does your problem actually need?",
    how: [
      {
        type: "para",
        text: "Latency is how long a single operation takes — the time from request to response for one user. Throughput is how many operations the system completes per unit of time — requests per second across everyone. They're related but independent: you can raise throughput (add workers) without lowering latency, and you can lower latency without touching throughput.",
      },
      {
        type: "para",
        text: "The classic analogy is a highway. Latency is how long your car takes to drive from A to B; throughput is how many cars pass a point per minute. Adding lanes raises throughput but doesn't make any one car faster. Raising the speed limit lowers latency for everyone.",
      },
      {
        type: "points",
        items: [
          "Latency is measured per operation (ms); throughput is measured over time (ops/sec).",
          "Report latency as percentiles, not averages — the p99 (worst 1%) is what users notice.",
          "Adding parallel capacity raises throughput; it rarely lowers latency.",
          "Under overload, latency spikes as requests queue — even if throughput looks fine.",
        ],
      },
      {
        type: "note",
        text: "An average latency of 100ms can hide a p99 of 3 seconds — meaning 1 in 100 requests is painfully slow. Because users hit many requests per session, tail latency dominates their experience. Always look at percentiles.",
      },
    ],
    tradeoffs: {
      good: [
        "Separating the two tells you whether to speed up work or add capacity.",
        "Throughput scales with parallelism — often just add more workers.",
        "Latency percentiles reveal the slow tail that averages hide.",
      ],
      costs: [
        "Optimizing one can worsen the other (batching raises throughput, adds latency).",
        "Low latency at high throughput is much harder than either alone.",
        "Averages mislead; you must track percentiles to see real experience.",
        "Queuing under load makes latency collapse suddenly, not gradually.",
      ],
    },
    realWorld:
      "Batching is the everyday tension: grouping requests raises throughput but makes each one wait, adding latency. A user-facing API optimizes for low p99 latency; a nightly data pipeline optimizes for raw throughput and doesn't care how long one record takes.",
    related: [
      {
        slug: "caching-perf",
        note: "The most common way to cut latency by avoiding repeat work.",
      },
      {
        slug: "load-balancing",
        note: "Adding capacity to raise throughput under load.",
      },
      {
        slug: "scalability",
        note: "Throughput growth is what scaling is largely about.",
      },
      {
        slug: "breakpoints-profiling",
        note: "How you find which operations are contributing the latency.",
      },
    ],
  },
  {
    slug: "cpu-memory-usage",
    tagline:
      "The two finite resources every program competes for, and how running out of each fails differently.",
    problem:
      "Your service was fine yesterday and today it's crawling. Is it because the CPU is pegged at 100% doing too much computation, or because it's out of memory and constantly swapping to disk? These two look similar from the outside — 'slow' — but have opposite causes and opposite fixes. Guess wrong and you scale the wrong thing. How do you tell them apart?",
    how: [
      {
        type: "para",
        text: "Every program consumes two scarce resources. CPU is compute time — how much work the processor is doing; when it's maxed out, work queues up and everything slows because the machine literally can't calculate faster. Memory (RAM) is working space — where the program keeps the data it's actively using; when it runs low, the system either kills the process or falls back to disk, which is thousands of times slower.",
      },
      {
        type: "para",
        text: "The two failure modes are distinct. CPU-bound work is limited by calculation — tight loops, parsing, encryption. Memory-bound work is limited by how much you're holding at once — loading a huge file entirely into RAM, or a leak that grows without bound until the process is killed (an out-of-memory kill).",
      },
      {
        type: "points",
        items: [
          "CPU-bound: pegged near 100% CPU. Fix by doing less work, better algorithms, or more cores.",
          "Memory-bound: high RAM use, swapping, or OOM kills. Fix by holding less at once (streaming, paging).",
          "Swapping to disk when RAM runs out makes everything catastrophically slow.",
          "A memory leak grows usage steadily until the process dies — a classic 'restarts fix it' symptom.",
        ],
      },
      {
        type: "note",
        text: "The two trade off against each other constantly — this is the time-vs-space tradeoff. Caching a result spends memory to save CPU; recomputing spends CPU to save memory.",
      },
    ],
    tradeoffs: {
      good: [
        "Knowing which resource is the bottleneck tells you what to fix or scale.",
        "CPU-bound work often parallelizes across cores.",
        "Memory-bound work often streams instead of loading everything at once.",
        "Monitoring both catches leaks and runaway load before a crash.",
      ],
      costs: [
        "They trade off — cutting one usually costs the other.",
        "Diagnosing which is the true limit takes profiling, not guessing.",
        "Memory leaks are slow to surface and hard to pin down.",
        "Garbage-collected languages hide memory cost until GC pauses appear.",
      ],
    },
    realWorld:
      "Cloud bills and container limits are set in CPU and memory, so misjudging which you need wastes money or triggers OOM kills. 'It works locally but the container keeps restarting' is almost always a memory limit; 'it pins one core and stalls' is CPU-bound work needing a better algorithm.",
    related: [
      {
        slug: "time-vs-space",
        note: "The fundamental tradeoff between spending CPU and spending memory.",
      },
      {
        slug: "breakpoints-profiling",
        note: "Profilers measure exactly where CPU and memory go.",
      },
      {
        slug: "caching-perf",
        note: "Spending memory to save repeated CPU work.",
      },
      {
        slug: "garbage-collection",
        note: "How managed languages reclaim memory, and where its cost hides.",
      },
    ],
  },
  {
    slug: "caching-perf",
    tagline:
      "Keeping the answer to expensive work nearby so you don't redo it every time.",
    problem:
      "Your homepage runs the same heavy database query for every visitor, and the data only changes a few times a day. Ten thousand visitors an hour means ten thousand identical expensive queries computing the same result. You're paying full price over and over for an answer that hasn't changed. Why recompute what you already know?",
    how: [
      {
        type: "para",
        text: "A cache stores the result of expensive work so the next request can reuse it instead of redoing it. The first request computes the answer and saves it; subsequent requests get the saved copy — a cache hit — which is far cheaper than a miss that has to compute from scratch. Caching is one of the highest-leverage performance tools because so much work is repeated.",
      },
      {
        type: "para",
        text: "The hard part isn't storing data — it's knowing when the stored copy is stale. If the underlying data changes but the cache still serves the old value, users see wrong information. So every cache needs an invalidation strategy: a time-to-live (TTL) that expires entries after a while, or explicit eviction when the source changes.",
      },
      {
        type: "points",
        items: [
          "Hit vs miss: a hit reuses the cached value; a miss pays full cost and populates the cache.",
          "TTL: entries expire after a set time, trading freshness for simplicity.",
          "Eviction: when the cache is full, something must go (LRU — least recently used — is common).",
          "Layers: caches stack from CPU to browser to CDN to app to database.",
        ],
      },
      {
        type: "note",
        text: "'There are only two hard things in computer science: cache invalidation and naming things.' Stale cache bugs — showing data that's already changed — are among the most common and confusing production issues.",
      },
    ],
    tradeoffs: {
      good: [
        "Turns expensive repeated work into a cheap lookup — often a huge latency win.",
        "Cuts load on the slow thing behind it (database, API, computation).",
        "Layers naturally, from CPU caches to CDNs, each absorbing load.",
        "Often a small change with an outsized payoff.",
      ],
      costs: [
        "Stale data — the cache serves an answer that's no longer true.",
        "Invalidation is genuinely hard to get right.",
        "Adds a moving part that can fail or fill up.",
        "A 'cache stampede' — many misses at once — can hammer the source.",
      ],
    },
    realWorld:
      "Redis is the go-to for shared application caching; CDNs cache static assets at the network edge; browsers, databases, and CPUs all cache internally. The recurring lesson is that caching is easy to add and hard to invalidate correctly — most cache bugs are staleness, not misses.",
    related: [
      {
        slug: "redis",
        note: "The most common tool for a shared application cache.",
      },
      {
        slug: "caching-cdn",
        note: "Caching content at the network edge, close to users.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Caching is the classic latency-reduction technique.",
      },
      {
        slug: "time-vs-space",
        note: "A cache spends memory to save recomputation time.",
      },
    ],
  },
  {
    slug: "compression",
    tagline:
      "Trading a bit of CPU to make data smaller, so it moves and stores cheaper.",
    problem:
      "Your API returns a 2MB JSON payload on every page load. Over a mobile connection that's a slow, expensive download for the user and a lot of bandwidth for you — and JSON is mostly repetitive text with obvious patterns. Sending all those bytes as-is wastes the network on redundancy. Can you send fewer bytes without losing any of the data?",
    how: [
      {
        type: "para",
        text: "Compression re-encodes data into fewer bytes by exploiting patterns and redundancy — repeated words, common byte sequences, predictable structure. The receiver decompresses it back to the original. It's a trade: you spend CPU time to shrink the data, and win on transfer time and storage space. When the network is the bottleneck (and it usually is), that trade pays off handsomely.",
      },
      {
        type: "para",
        text: "There are two families. Lossless compression (gzip, Brotli, zstd) reconstructs the original exactly — essential for text, code, and JSON. Lossy compression (JPEG, MP3, H.264) throws away detail humans barely notice to shrink far more — right for images, audio, and video, wrong for anything that must survive intact.",
      },
      {
        type: "points",
        items: [
          "Lossless: exact reconstruction — for text, data, code. gzip, Brotli, zstd.",
          "Lossy: discards imperceptible detail for much smaller size — for media. JPEG, MP3.",
          "Higher compression levels shrink more but cost more CPU — a tunable dial.",
          "Already-compressed data (JPEGs, ZIPs) barely shrinks further — don't bother.",
        ],
      },
      {
        type: "note",
        text: "Web servers compress text responses automatically when the browser sends Accept-Encoding — gzip or Brotli. It's often the single easiest bandwidth win: turn it on and text payloads shrink by 70% or more.",
      },
    ],
    tradeoffs: {
      good: [
        "Far less data to transfer — faster loads, lower bandwidth bills.",
        "Less storage needed for logs, backups, and archives.",
        "Text and JSON often shrink by 70-90% losslessly.",
        "Usually a one-line config change on the server.",
      ],
      costs: [
        "Costs CPU to compress and decompress on both ends.",
        "Already-compressed or encrypted data won't shrink — wasted effort.",
        "Lossy compression permanently discards detail; over-compress and quality suffers.",
        "Highest levels can cost more CPU than the transfer time they save.",
      ],
    },
    realWorld:
      "HTTP responses are gzip- or Brotli-compressed by default across the web; databases and file systems compress at rest; media formats are compression schemes at their core. The everyday decision is which algorithm and level — and remembering not to compress data that's already compressed.",
    related: [
      {
        slug: "headers-cookies",
        note: "Accept-Encoding and Content-Encoding negotiate compression over HTTP.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Smaller payloads cut transfer latency when the network is the limit.",
      },
      {
        slug: "cpu-memory-usage",
        note: "The CPU cost you spend to save bandwidth.",
      },
      {
        slug: "caching-cdn",
        note: "CDNs serve pre-compressed assets from the edge.",
      },
    ],
  },
  {
    slug: "connection-pooling",
    tagline:
      "Reusing a set of already-open connections instead of opening a new one every time.",
    problem:
      "Every request to your app opens a fresh database connection, runs one quick query, and closes it. Opening that connection — TCP handshake, TLS negotiation, database authentication — takes longer than the query itself. Under load, thousands of requests open thousands of connections, and the database, which can only handle a few hundred at once, falls over. The connecting, not the querying, is killing you.",
    how: [
      {
        type: "para",
        text: "A connection pool keeps a fixed set of open connections ready and hands them out on demand. When your code needs the database, it borrows a connection from the pool, uses it, and returns it — the connection stays open for the next borrower instead of being torn down. You pay the expensive setup cost once per connection, not once per request.",
      },
      {
        type: "para",
        text: "The pool also acts as a throttle. It has a maximum size, so it caps how many connections hit the database at once — protecting it from being overwhelmed. If all connections are in use, new requests wait for one to free up rather than piling more load on the database.",
      },
      {
        type: "points",
        items: [
          "Borrow, use, return — the connection is reused, not recreated.",
          "Pool size caps concurrent connections, shielding the database from overload.",
          "When the pool is exhausted, callers queue for a free connection or time out.",
          "Pools health-check and recycle stale connections that have dropped.",
        ],
      },
      {
        type: "note",
        text: "Sizing matters both ways. Too small and requests queue waiting for a connection; too large and you overwhelm the database — which has its own hard connection limit. The right size is usually smaller than people expect.",
      },
    ],
    tradeoffs: {
      good: [
        "Skips the expensive connection setup on nearly every request.",
        "Caps concurrent connections, protecting the database from overload.",
        "Smooths load spikes by queuing instead of flooding.",
        "Recycles dead connections so callers don't hit stale ones.",
      ],
      costs: [
        "Sizing is a balancing act — too small queues, too large overwhelms.",
        "Pooled connections hold resources even when idle.",
        "Leaked connections (borrowed and never returned) exhaust the pool and hang the app.",
        "Adds a component that can itself become the bottleneck.",
      ],
    },
    realWorld:
      "Almost every database library ships with pooling (HikariCP, pgbouncer, and the pools built into ORMs). A frequent serverless pitfall is many short-lived function instances each opening their own connections and blowing past the database limit — which is exactly what an external pooler like pgbouncer is meant to solve.",
    related: [
      {
        slug: "tcp-vs-udp",
        note: "The connection setup cost pooling avoids is largely the TCP handshake.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Reusing connections cuts per-request latency and raises throughput.",
      },
      {
        slug: "thread-pools",
        note: "The same reuse-a-fixed-set idea applied to threads.",
      },
      {
        slug: "load-balancing",
        note: "Both are about managing finite capacity under concurrent load.",
      },
    ],
  },
  {
    slug: "n-plus-1",
    tagline:
      "Why a page issues hundreds of tiny queries when one would do.",
    problem:
      "You load 100 blog posts, then loop over them to fetch each author — that's 1 query for the posts plus 100 for the authors. The page felt fine with 5 posts in testing and crawls with 100 in production. Where did the queries come from?",
    how: [
      {
        type: "para",
        text: "The N+1 pattern is one query to get a list, then one more query per item in that list. It hides easily behind ORMs and lazy-loaded relationships, so the extra queries aren't visible in your code — accessing post.author quietly fires a query each time through the loop.",
      },
      {
        type: "points",
        items: [
          "Fix by fetching related data in one query (a JOIN or an IN (...) batch).",
          "ORMs call this eager loading or prefetching.",
          "It scales linearly with the list size, so it only hurts at scale.",
          "Query logging makes it obvious — you'll see the same query repeated N times.",
        ],
      },
      {
        type: "note",
        text: "The trap is that it's invisible at small scale. Five items means six queries and nobody notices; a thousand items means a thousand-and-one, and the page dies. It's a latent bug that testing on small data won't reveal.",
      },
    ],
    tradeoffs: {
      good: [
        "Fixing it can turn hundreds of round-trips into one.",
        "Usually a small code change (eager load).",
        "Big latency win on list pages.",
      ],
      costs: [
        "Eager loading can over-fetch if you don't need the relation.",
        "Hard to spot without query logging.",
        "One big query can occasionally be worse than a few small ones.",
        "Deeply nested relations make the single query complex.",
      ],
    },
    realWorld:
      "One of the most common causes of a slow list/index page in ORM-based apps; query logs reveal it instantly. Frameworks provide explicit tools for it — Rails' includes, Django's select_related/prefetch_related, GraphQL's DataLoader.",
    related: [
      {
        slug: "indexes",
        note: "The other classic query slowdown.",
      },
      {
        slug: "query-planning",
        note: "The planner can't fix N+1 — it's the app's fault.",
      },
      {
        slug: "joins",
        note: "The usual fix — pull related rows in one query.",
      },
      {
        slug: "breakpoints-profiling",
        note: "Query logs and profilers surface the repeated queries.",
      },
    ],
  },
];
