import { batchA } from "@/lib/topics/batch-a";
import { batchB } from "@/lib/topics/batch-b";
import { batchC } from "@/lib/topics/batch-c";
import { batchD } from "@/lib/topics/batch-d";
import { batchE } from "@/lib/topics/batch-e";
import { batchF } from "@/lib/topics/batch-f";
import { batchG } from "@/lib/topics/batch-g";
import { batchH } from "@/lib/topics/batch-h";
import { batchI } from "@/lib/topics/batch-i";
import { batchFrontend } from "@/lib/topics/batch-frontend";

// Deep-dive content for built topic pages. Kept separate from curriculum.ts
// (which is the index/navigation layer). A topic page renders this rich content
// when it exists, and falls back to the "planned" stub when it doesn't.
//
// The structure is deliberately fixed so every finished page answers the same
// questions in the same order — consistency is what keeps the reader oriented.

// Every interactive demo id. The topic page's registry must cover all of these
// (enforced by `satisfies Record<DemoId, ...>`), and content may only reference
// one of these — so a typo is a compile error, not a silently blank demo.
export type DemoId =
  | "index-scan"
  | "coercion"
  | "references"
  | "control-flow-tracer"
  | "call-stack"
  | "class-instances"
  | "error-propagation"
  | "collections-compare"
  | "file-stream"
  | "array-ops"
  | "linked-list-ops"
  | "stack"
  | "queue"
  | "hashmap-buckets"
  | "heap-tree"
  | "graph-traversal"
  | "bst"
  | "search-compare"
  | "sort-bars"
  | "recursion-factorial"
  | "greedy-coins"
  | "dp-fib"
  | "growth-curves"
  | "class-bars"
  | "time-space"
  | "sql-select"
  | "sql-join"
  | "sql-group"
  | "txn-race"
  | "http-exchange"
  | "http-verbs"
  | "status-codes"
  | "cookies"
  | "dns-resolve"
  | "tcp-udp"
  | "tls-handshake"
  | "ws-push"
  | "multiplexing"
  | "type-inspector"
  | "dom-tree"
  | "box-model"
  | "render-pipeline"
  | "event-bubbling"
  | "ui-state"
  | "vdom-diff"
  | "spa-nav"
  | "prop-drilling"
  | "a11y-tree"
  | "bundler"
  | "web-vitals"
  | "arch-styles"
  | "api-gateway"
  | "load-balance"
  | "service-discovery"
  | "oop-pillars"
  | "refactor-naming"
  | "refactor-functions"
  | "refactor-dry"
  | "coupling"
  | "solid"
  | "design-patterns"
  | "authn-authz"
  | "session-store"
  | "jwt-decode"
  | "oauth-flow"
  | "password-hash"
  | "owasp"
  | "sql-injection"
  | "xss-escape"
  | "csrf-attack"
  | "ssrf-block"
  | "login-attack"
  | "allowlist"
  | "sym-asym"
  | "token-bucket"
  | "regression-catch"
  | "test-runner"
  | "test-pyramid"
  | "e2e-flow"
  | "mocking"
  | "coverage"
  | "stack-trace"
  | "profiler"
  | "latency-throughput"
  | "resource-bound"
  | "cache-hit"
  | "compression"
  | "conn-pool"
  | "n-plus-1"
  | "sync-async"
  | "race-counter"
  | "mutex"
  | "semaphore"
  | "deadlock"
  | "atomic"
  | "thread-pool"
  | "channels";

export type ContentBlock =
  | { type: "para"; text: string }
  | { type: "points"; items: string[] }
  | { type: "note"; text: string }
  | { type: "code"; code: string; caption?: string }
  | { type: "demo"; demo: DemoId }
  | { type: "aside"; title: string; blocks: ContentBlock[] };

export type TopicContent = {
  slug: string;
  /** One sentence under the title. */
  tagline: string;
  /** Lead with the problem, never the definition. */
  problem: string;
  /** Optional interactive experiment, keyed by id (see topic page registry). */
  demo?: DemoId;
  /** How it works — minimal technical model. */
  how: ContentBlock[];
  /** The costs are not optional — every technology has them. */
  tradeoffs: { good: string[]; costs: string[] };
  /** Optional heading overrides for the two tradeoff columns (e.g. foundational
   * topics use "What it enables" / "Common mistakes"). */
  tradeoffLabels?: { good: string; costs: string };
  /** Where you'll actually meet this. */
  realWorld?: string;
  /** Edges to other topics (slugs must exist in curriculum). */
  related: { slug: string; note: string }[];
};

const indexes: TopicContent = {
  slug: "indexes",
  tagline:
    "How a database finds one row among millions without reading them all.",
  problem:
    "Your users table has ten million rows. A query like SELECT * FROM users WHERE email = 'x' has to return one row. With nothing to help it, the database has no choice but to read every row and check each one — ten million comparisons for a single lookup. The bigger the table gets, the slower every such query becomes. How can the database jump almost straight to the row it wants?",
  demo: "index-scan",
  how: [
    {
      type: "para",
      text: "An index is a separate, sorted data structure that maps a column's values to the rows that contain them — most often a B-tree. Because it's kept in sorted order, the database can search it the way you'd search a dictionary: open near the middle, decide whether to go left or right, and repeat. Each step throws away half of what's left.",
    },
    {
      type: "para",
      text: "That halving is the whole trick. Searching 10 million sorted entries takes about 23 steps (log₂ of 10 million), not 10 million. The index entry points straight at the row on disk, and the database goes and fetches it.",
    },
    {
      type: "points",
      items: [
        "Without an index: a full table scan — read every row, O(n).",
        "With an index: a B-tree descent — a couple dozen steps at most, O(log n).",
        "The index lives alongside the table and is kept in sync automatically on every write.",
      ],
    },
    {
      type: "note",
      text: "Having an index doesn't guarantee it's used. If a query would match most of the table anyway, a plain scan is actually cheaper — so the query planner decides case by case.",
    },
  ],
  tradeoffs: {
    good: [
      "Reads that filter or sort on the indexed column become dramatically faster.",
      "Also speeds up ORDER BY and JOINs on that column.",
      "A unique index makes 'is this value already taken?' checks cheap.",
    ],
    costs: [
      "Every INSERT, UPDATE, and DELETE must also update the index — writes get slower.",
      "The index takes extra disk space, and memory when it's cached.",
      "An index nothing queries is pure cost: it slows writes and helps no reads.",
      "Too many indexes bloat the table and can confuse the planner.",
    ],
  },
  realWorld:
    "Adding the right index is the single most common fix for a slow query. When an app 'suddenly gets slow' as its data grows, an un-indexed column in a WHERE or JOIN is the usual culprit — the query was doing a full scan the whole time; it just didn't hurt while the table was small.",
  related: [
    {
      slug: "tree",
      note: "A B-tree — the data structure most indexes are built on.",
    },
    {
      slug: "big-o-notation",
      note: "Why O(log n) beats O(n) so decisively at scale.",
    },
    {
      slug: "query-planning",
      note: "How the database decides whether using an index is worth it.",
    },
    {
      slug: "transactions-acid",
      note: "Index updates happen inside the same transaction as the write.",
    },
    {
      slug: "n-plus-1",
      note: "A related slowdown — many tiny queries where one would do.",
    },
  ],
};

const transactionsAcid: TopicContent = {
  slug: "transactions-acid",
  tagline:
    "How a database groups several changes so they all happen — or none do.",
  problem:
    "A bank transfer is two steps: subtract $100 from Alice, add $100 to Bob. If the server crashes between them, Alice has lost $100 that never reached Bob. Any operation made of multiple steps has this danger — a half-finished change leaves the data in a state that should never exist. How does a database make many steps behave as one?",
  demo: "txn-race",
  how: [
    {
      type: "para",
      text: "A transaction wraps a group of statements between BEGIN and COMMIT. Until you COMMIT, nothing is permanent; if anything goes wrong you ROLLBACK and it's as if none of it happened. The database guarantees the whole group is all-or-nothing.",
    },
    {
      type: "code",
      code: "BEGIN;\n  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';\n  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';\nCOMMIT;   -- both land together; a crash before COMMIT rolls both back\n\n-- if the second UPDATE fails, ROLLBACK undoes the first — no lost $100",
      caption: "Wrapping both updates in one transaction makes them all-or-nothing.",
    },
    {
      type: "para",
      text: "Those guarantees are summarized by the acronym ACID:",
    },
    {
      type: "points",
      items: [
        "Atomicity — all steps succeed, or none do. No half-done transfers.",
        "Consistency — the transaction moves the database from one valid state to another, respecting its rules (constraints, foreign keys).",
        "Isolation — concurrent transactions don't see each other's half-finished work.",
        "Durability — once committed, the change survives a crash or power loss.",
      ],
    },
    {
      type: "note",
      text: "Atomicity and durability usually rely on a write-ahead log (WAL): the change is recorded to an append-only log before the data itself is updated, so the database can recover a consistent state after a crash.",
    },
  ],
  tradeoffs: {
    good: [
      "Multi-step operations become safe against crashes and errors.",
      "You can reason about a group of changes as a single unit.",
      "Constraints stay satisfied even when many things happen at once.",
    ],
    costs: [
      "Coordination and logging add overhead — transactions aren't free.",
      "Long-running transactions hold resources and can block others.",
      "These guarantees are hard to keep across many machines.",
    ],
  },
  realWorld:
    "Anything involving money, inventory, or bookings needs transactions — 'transfer funds', 'place an order', 'book the last seat' all break in subtle ways without them. Most bugs where data ends up in an impossible state trace back to work that should have been one transaction but wasn't.",
  related: [
    {
      slug: "isolation-levels",
      note: "The 'I' in ACID — how much concurrent transactions see of each other.",
    },
    {
      slug: "locks",
      note: "The main mechanism that keeps transactions from colliding.",
    },
    {
      slug: "indexes",
      note: "Index updates happen inside the same transaction as the write.",
    },
    {
      slug: "eventual-consistency",
      note: "What you often trade strict ACID for once you go distributed.",
    },
  ],
};

const locks: TopicContent = {
  slug: "locks",
  tagline:
    "How a database stops two transactions from corrupting the same row at once.",
  problem:
    "Two people buy the last concert ticket in the same instant. Both transactions read 'seats left: 1', both decide it's available, both write 'seats left: 0' and issue a ticket. Two tickets, one seat. Whenever concurrent transactions touch the same data, their steps can interleave and produce results neither would alone. How does the database serialize access to shared rows?",
  demo: "txn-race",
  how: [
    {
      type: "para",
      text: "A lock is a claim a transaction places on a piece of data. While it holds the lock, other transactions that need it must wait. The two common kinds are shared (read) locks — many readers can hold one at once — and exclusive (write) locks — only one holder, blocking everyone else.",
    },
    {
      type: "code",
      code: "BEGIN;\n  -- take an exclusive lock on the row before deciding\n  SELECT seats_left FROM shows WHERE id = 42 FOR UPDATE;\n  -- a second buyer blocks on that SELECT until this transaction commits\n  UPDATE shows SET seats_left = seats_left - 1 WHERE id = 42;\nCOMMIT;",
      caption: "FOR UPDATE locks the row so the second buyer waits, then re-reads the true value.",
    },
    {
      type: "para",
      text: "Locks are taken at different granularities: a single row, a page, or a whole table. Finer (row-level) locks allow more concurrency but cost more to track; coarser locks are cheaper but make transactions wait more often.",
    },
    {
      type: "points",
      items: [
        "Shared lock: 'I'm reading this, don't change it yet.' Compatible with other shared locks.",
        "Exclusive lock: 'I'm changing this.' Incompatible with any other lock.",
        "Pessimistic locking claims up front; optimistic locking assumes no conflict and checks a version number at commit.",
      ],
    },
    {
      type: "note",
      text: "Two transactions each waiting for a lock the other holds will wait forever — a deadlock. Databases detect this and abort one of them, so your code must be ready to retry.",
    },
  ],
  tradeoffs: {
    good: [
      "Prevents lost updates and corruption from concurrent writes.",
      "Lets you enforce 'only one at a time' on a critical row.",
      "Row-level locking allows high concurrency across different rows.",
    ],
    costs: [
      "Waiting on locks adds latency and can become a bottleneck under contention.",
      "Deadlocks are possible and must be handled with retries.",
      "Holding locks too long starves other work.",
    ],
  },
  realWorld:
    "The 'last ticket / last item in stock' problem is the canonical case. The fix is a transaction that locks the row (e.g. SELECT ... FOR UPDATE) before deciding, or an optimistic check on a version column. Getting this wrong is how systems oversell inventory.",
  related: [
    {
      slug: "transactions-acid",
      note: "Locks are how transactions stay isolated from each other.",
    },
    {
      slug: "isolation-levels",
      note: "The isolation level you choose decides how aggressively locks are taken.",
    },
    {
      slug: "deadlock",
      note: "Two transactions each waiting on the other's lock.",
    },
    {
      slug: "race-conditions",
      note: "The general class of bug that locks exist to prevent.",
    },
  ],
};

const isolationLevels: TopicContent = {
  slug: "isolation-levels",
  tagline:
    "How much of each other's unfinished work concurrent transactions are allowed to see.",
  problem:
    "Perfect isolation — every transaction behaving as if it ran completely alone — is slow, because it forces transactions to wait for one another. But loosening it lets strange things happen: you read a value, someone else changes it, you read again mid-transaction and get a different number. Databases give you a dial between 'always correct but slow' and 'faster but with surprises.' Which surprises can you live with?",
  demo: "txn-race",
  how: [
    {
      type: "para",
      text: "The SQL standard defines four isolation levels, from weakest to strongest, each ruling out more anomalies:",
    },
    {
      type: "points",
      items: [
        "Read Uncommitted — you can see others' uncommitted changes (dirty reads). Rarely used.",
        "Read Committed — you only see committed data, but the same query can return different results if run twice (non-repeatable read). The common default.",
        "Repeatable Read — rows you've read won't change under you, but new matching rows can still appear (phantoms).",
        "Serializable — the strongest: transactions behave as if run one at a time. No anomalies, most contention.",
      ],
    },
    {
      type: "code",
      code: "BEGIN;\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\n  SELECT balance FROM accounts WHERE id = 'alice';   -- read\n  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';   -- then act\nCOMMIT;\n\n-- at SERIALIZABLE a conflicting txn is aborted (retry it) instead of\n-- silently overwriting your read — the lost update becomes visible",
      caption: "Raising the level turns a silent lost update into a loud, retryable abort.",
    },
    {
      type: "para",
      text: "The anomalies — dirty read, non-repeatable read, phantom — are the specific ways weaker levels can bite you. You pick the weakest level your correctness needs allow, because weaker generally means faster and more concurrent.",
    },
    {
      type: "note",
      text: "Defaults differ: PostgreSQL and many others default to Read Committed. 'Serializable' is also implemented differently across databases (lock-based vs. snapshot-based), with different performance.",
    },
  ],
  tradeoffs: {
    good: [
      "Lets you buy exactly as much consistency as you need, and no more.",
      "Higher levels remove whole classes of concurrency bugs automatically.",
      "Lower levels give more throughput under heavy concurrency.",
    ],
    costs: [
      "Weaker levels allow subtle, hard-to-reproduce anomalies.",
      "Stronger levels increase locking and aborts, reducing concurrency.",
      "Defaults differ across databases, so 'it worked on mine' can mislead.",
    ],
  },
  realWorld:
    "Most apps run at Read Committed and never think about it — until a report reads inconsistent totals, or a check-then-act (read a balance, then update it) silently loses an update. The fix is a stronger isolation level or explicit locking on the rows involved.",
  related: [
    {
      slug: "transactions-acid",
      note: "Isolation is the 'I' — this is the dial that controls it.",
    },
    {
      slug: "locks",
      note: "Higher isolation is often enforced by taking more locks.",
    },
    {
      slug: "race-conditions",
      note: "Weaker isolation is exactly where these creep in.",
    },
    {
      slug: "consistency-models",
      note: "The same tension, scaled up to distributed systems.",
    },
  ],
};

const normalization: TopicContent = {
  slug: "normalization",
  tagline:
    "Organizing tables so every fact is stored once, in exactly one place.",
  problem:
    "Imagine storing a customer's address on every one of their orders. When they move, you must update dozens of rows — miss one and your data now disagrees with itself. Duplicated data drifts out of sync, wastes space, and makes updates dangerous. How do you structure tables so a fact lives in a single, authoritative spot?",
  how: [
    {
      type: "para",
      text: "Normalization splits data into tables so each piece of information is stored once, with foreign keys linking them. Instead of copying the address onto every order, you keep it on the customer row and have orders point to the customer.",
    },
    {
      type: "code",
      code: "-- denormalized: address copied onto every order → drifts out of sync\norders(id, customer_name, customer_address, item)\n\n-- normalized: the fact lives once; orders reference it\ncustomers(id, name, address)\norders(id, customer_id → customers.id, item)",
      caption: "The address lives once on the customer; orders reference it instead of copying it.",
    },
    {
      type: "para",
      text: "It proceeds in 'normal forms', each stricter than the last. The first three cover almost every practical case:",
    },
    {
      type: "points",
      items: [
        "1NF — each column holds a single value (no lists crammed into one field).",
        "2NF — every non-key column depends on the whole primary key, not just part of it.",
        "3NF — non-key columns depend only on the key, not on each other.",
      ],
    },
    {
      type: "note",
      text: "The opposite move, denormalization, deliberately duplicates data to make reads faster (fewer joins). It's a valid choice — but keeping the copies in sync then becomes your job.",
    },
  ],
  tradeoffs: {
    good: [
      "A fact lives in one place, so updates can't leave the data contradicting itself.",
      "Less duplication means less storage and fewer update bugs.",
      "Clear relationships make the schema easier to reason about.",
    ],
    costs: [
      "Reading related data requires JOINs, which cost time.",
      "Heavily normalized schemas can need many joins for one screen.",
      "For read-heavy workloads, some denormalization is often faster — at the cost of sync complexity.",
    ],
  },
  realWorld:
    "Transactional (OLTP) databases are normalized to keep writes safe. Analytics and reporting systems (OLAP, data warehouses) often deliberately denormalize into wide tables because they read far more than they write and want to avoid joins. Knowing which world you're in tells you which way to lean.",
  related: [
    {
      slug: "foreign-keys",
      note: "The links that hold normalized tables together.",
    },
    { slug: "joins", note: "How you recombine normalized data when reading." },
    {
      slug: "tables-schema",
      note: "The relational model normalization is built on.",
    },
    {
      slug: "sql-vs-nosql",
      note: "NoSQL often denormalizes by design — this is the contrast.",
    },
  ],
};

const queryPlanning: TopicContent = {
  slug: "query-planning",
  tagline: "How the database decides the fastest way to answer your query.",
  problem:
    "You write SQL that says what you want, not how to get it. But there are usually many ways to run the same query — use this index or that one, join these tables in this order or that — and they can differ in speed by thousands of times. Something has to choose. How does the database turn your declarative query into an efficient plan?",
  how: [
    {
      type: "para",
      text: "SQL is declarative: you describe the result, and the query planner (optimizer) works out the steps. It considers the possible strategies — which indexes to use, whether to scan or seek, the order to join tables — and estimates the cost of each using statistics about your data (row counts, how many distinct values).",
    },
    {
      type: "para",
      text: "It picks the plan with the lowest estimated cost and runs it. EXPLAIN shows you the plan it chose — whether it's using an index, scanning the whole table, and how it's joining.",
    },
    {
      type: "code",
      code: "EXPLAIN SELECT * FROM users WHERE email = 'x';\n\n-- Index Scan using users_email_idx  (cost=0.29..8.30 rows=1)   ← seeks straight to the row\n-- Seq Scan on users               (cost=0.00..1804.00 rows=1) ← reads every row instead\n\n-- same query, same result — the plan is the difference between fast and slow",
      caption: "EXPLAIN reveals the plan: an Index Scan jumps to the row; a Seq Scan reads them all.",
    },
    {
      type: "points",
      items: [
        "The planner is cost-based: even a perfect index is skipped if a scan is estimated cheaper.",
        "It relies on statistics; stale statistics lead to bad plans.",
        "EXPLAIN (and EXPLAIN ANALYZE) is your window into what it actually did.",
      ],
    },
    {
      type: "note",
      text: "A query that suddenly gets slow often means the planner switched to a worse plan — usually because statistics went stale or the data distribution changed. Re-analyzing the table frequently fixes it.",
    },
  ],
  tradeoffs: {
    good: [
      "You write what you want; the database handles the how, and adapts as data changes.",
      "A good plan can be orders of magnitude faster than a naive one.",
      "EXPLAIN makes slow queries diagnosable rather than mysterious.",
    ],
    costs: [
      "Planning itself takes time (mitigated by prepared statements).",
      "Estimates can be wrong, producing a bad plan for tricky queries.",
      "You sometimes must help it — better indexes, fresh statistics, or query rewrites.",
    ],
  },
  realWorld:
    "When a query is slow, EXPLAIN is the first tool: it tells you whether your index is being used or the database is scanning everything. A huge fraction of performance work is reading plans and giving the planner what it needs to choose well.",
  related: [
    {
      slug: "indexes",
      note: "The main tool the planner chooses between using or not.",
    },
    {
      slug: "big-o-notation",
      note: "The gap between plans is a difference in order of growth.",
    },
    {
      slug: "n-plus-1",
      note: "A slowdown the planner can't fix — it's caused by the app, not the plan.",
    },
    { slug: "joins", note: "Join order is one of the planner's biggest decisions." },
  ],
};

const tree: TopicContent = {
  slug: "tree",
  tagline:
    "A branching structure that keeps sorted data searchable in about log n steps — when it stays balanced.",
  problem:
    "A plain array is great for reading by position but slow to keep sorted as you insert and delete — every insert can shift everything after it. A linked list inserts cheaply but can't jump to the middle. You want both: fast search and fast insertion in sorted data. What structure gives you that?",
  how: [
    {
      type: "para",
      text: "A tree stores values in nodes, each linking to child nodes, branching out from a single root. In a binary search tree, each node has up to two children: smaller values go left, larger go right. To find a value you start at the root and go left or right; in a reasonably balanced tree, each comparison eliminates roughly half the remaining values.",
    },
    {
      type: "para",
      text: "That halving gives O(log n) search, insert, and delete — as long as the tree stays balanced. If it grows lopsided (e.g. inserting already-sorted data), it degrades into a list with O(n) behaviour, which is why real systems use self-balancing trees like red-black trees or B-trees.",
    },
    {
      type: "code",
      code: "// binary search tree: smaller left, larger right\nfind(10)    // 8 → 12 → 10 — 3 steps, halving each time (balanced: O(log n))\ninorder()   // 2, 4, 6, 8, 10, 12, 14 — sorted output, O(n)",
      caption: "Search halves the tree each step; in-order traversal comes out sorted.",
    },
    {
      type: "demo",
      demo: "bst",
    },
    {
      type: "points",
      items: [
        "Balanced tree: O(log n) search, insert, and delete, with data kept in sorted order.",
        "In-order traversal visits nodes in sorted order — great for range queries.",
        "B-trees — wide, shallow trees — are the backbone of database indexes and filesystems.",
      ],
    },
  ],
  tradeoffs: {
    good: [
      "Keeps data sorted while still supporting fast insert and delete.",
      "O(log n) operations scale to enormous datasets.",
      "Produces sorted output via in-order traversal (O(n)) and easy range queries.",
    ],
    costs: [
      "Must stay balanced, which adds bookkeeping on every change.",
      "More memory overhead (pointers) than a flat array.",
      "Less cache-friendly than an array, unless kept wide like a B-tree.",
    ],
  },
  tradeoffLabels: { good: "Strengths", costs: "Weaknesses" },
  realWorld:
    "You rarely hand-code a tree, but you use them constantly: database indexes (B-trees), the sorted maps and sets in standard libraries, file systems, and autocomplete (tries) are all trees. Understanding them is what makes 'why is this index O(log n)?' finally click.",
  related: [
    {
      slug: "indexes",
      note: "Database indexes are usually B-trees — trees applied to storage.",
    },
    {
      slug: "big-o-notation",
      note: "Why O(log n) is the payoff a balanced tree buys you.",
    },
    {
      slug: "hash-map",
      note: "The other fast-lookup structure — O(1), but unsorted.",
    },
    { slug: "graph", note: "A tree is a special, cycle-free kind of graph." },
  ],
};

const bigONotation: TopicContent = {
  slug: "big-o-notation",
  tagline:
    "A way to describe how an algorithm's cost grows as the input gets bigger.",
  problem:
    "Two functions both sort a list. On ten items they're indistinguishable. On ten million, one finishes instantly and the other takes hours. Timing code on small inputs tells you almost nothing about how it behaves at scale. You need a way to talk about growth — how cost rises with input size — independent of the machine. That is what Big-O is for.",
  how: [
    {
      type: "para",
      text: "Big-O describes the shape of the growth curve, ignoring constants and small terms and focusing on what dominates as the input size n gets large. O(n) means work grows in direct proportion to the input; O(n²) means doubling the input quadruples the work; O(log n) means doubling the input adds just one more step.",
    },
    {
      type: "para",
      text: "It's about the dominant term, not exact counts. An algorithm doing 3n + 50 steps is O(n) — at scale, the 3 and the 50 stop mattering next to n. We usually care about the worst case, though average case matters too (a hash map is O(1) average, O(n) worst).",
    },
    {
      type: "code",
      code: "// O(n) — one pass over the data\nfor (const x of list) total += x\n\n// O(n²) — a loop inside a loop\nfor (const a of list)\n  for (const b of list)\n    if (a + b === target) return [a, b]   // ~n² pairs",
      caption: "One loop is O(n); a loop inside a loop is O(n²).",
    },
    {
      type: "demo",
      demo: "growth-curves",
    },
    {
      type: "points",
      items: [
        "O(1) — constant: same cost regardless of size (a hash-map lookup).",
        "O(log n) — logarithmic: barely grows (binary search, a balanced tree).",
        "O(n) — linear: proportional (scanning a list).",
        "O(n log n) — the best general-purpose sorting.",
        "O(n²) — quadratic: a nested loop over the data; painful past a few thousand items.",
      ],
    },
    {
      type: "note",
      text: "Because Big-O ignores constants, for small inputs a 'worse' Big-O can actually be faster. It's a tool for reasoning about scale, not a replacement for measuring real performance.",
    },
  ],
  tradeoffs: {
    good: [
      "Predicts how code behaves at scale before you run it at scale.",
      "Machine-independent — a shared language for comparing approaches.",
      "Turns 'is this fast enough?' into a concrete question about growth.",
    ],
    costs: [
      "Hides constant factors, which can dominate at realistic input sizes.",
      "Worst-case Big-O can be pessimistic versus typical behaviour.",
      "Says nothing about memory unless you also track space complexity.",
    ],
  },
  tradeoffLabels: { good: "What it's good for", costs: "What it hides" },
  realWorld:
    "Big-O is the language of the difference between a table scan (O(n)) and an index lookup (O(log n)), or why a nested loop over users × orders (O(n²)) melts down as both grow. Most 'it worked in testing but died in production' failures are an unnoticed jump to a worse complexity class.",
  related: [
    {
      slug: "complexity-classes",
      note: "A closer look at each of the common growth curves.",
    },
    {
      slug: "time-vs-space",
      note: "Big-O applies to memory too, not just time.",
    },
    {
      slug: "indexes",
      note: "The O(n) vs O(log n) story made concrete in a database.",
    },
    { slug: "tree", note: "Where O(log n) comes from structurally." },
  ],
};

const CONTENT: TopicContent[] = [
  indexes,
  transactionsAcid,
  locks,
  isolationLevels,
  normalization,
  queryPlanning,
  tree,
  bigONotation,
  ...batchA,
  ...batchB,
  ...batchC,
  ...batchD,
  ...batchE,
  ...batchF,
  ...batchG,
  ...batchH,
  ...batchI,
  ...batchFrontend,
];

export function getTopicContent(slug: string): TopicContent | undefined {
  return CONTENT.find((c) => c.slug === slug);
}

export function getBuiltTopicSlugs(): string[] {
  return CONTENT.map((c) => c.slug);
}

// The local neighbourhood of one topic: the topics it links to plus the ones
// that link to it (capped), and the edges among that whole set — so a topic
// page can show a small, readable "what connects to this" graph.
export function getTopicGraph(slug: string): {
  neighbors: string[];
  edges: { a: string; b: string }[];
} {
  const self = getTopicContent(slug);
  const outgoing = self ? self.related.map((r) => r.slug) : [];
  const incoming = CONTENT.filter((c) =>
    c.related.some((r) => r.slug === slug),
  ).map((c) => c.slug);

  const seen = new Set<string>();
  const neighbors: string[] = [];
  for (const s of [...outgoing, ...incoming]) {
    if (s === slug || seen.has(s)) continue;
    seen.add(s);
    neighbors.push(s);
    if (neighbors.length >= 9) break;
  }

  const nodeset = new Set([slug, ...neighbors]);
  const edgeSeen = new Set<string>();
  const edges: { a: string; b: string }[] = [];
  for (const c of CONTENT) {
    if (!nodeset.has(c.slug)) continue;
    for (const r of c.related) {
      if (!nodeset.has(r.slug)) continue;
      const key =
        c.slug < r.slug ? `${c.slug}|${r.slug}` : `${r.slug}|${c.slug}`;
      if (edgeSeen.has(key)) continue;
      edgeSeen.add(key);
      edges.push({ a: c.slug, b: r.slug });
    }
  }
  return { neighbors, edges };
}
