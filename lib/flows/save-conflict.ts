import type { Flow } from "@/lib/types";

// ---------------------------------------------------------------------------
// Flow: Two people, one record.
//
// The classic lost-update / concurrency story. Two users load the same row,
// both edit it, both save — and without care one person's change silently
// disappears. This flow walks from the innocent-looking read all the way to
// the two standard fixes: a transaction plus a row lock (pessimistic), or a
// version check (optimistic). The point is not that databases are dangerous,
// but that "read, change in your head, write back" is a race unless something
// makes the two writers take turns or notice each other.
//
// Latencies are rough, order-of-magnitude figures. They exist to show where
// the waiting happens (mostly humans thinking, and one writer blocking on a
// lock), not to be benchmarks.
// ---------------------------------------------------------------------------

export const saveConflictFlow: Flow = {
  slug: "save-conflict",
  title: "Two people, one record",
  question: "Two people save at the same moment — why does one change vanish?",
  summary:
    "Two people open the same record, each make a change, and each hit Save. It feels like both edits should stick — but naively one of them just disappears, with no error and no warning. This is the lost update, one of the oldest bugs in shared data. Follow it stop by stop to see exactly where the change is lost, and the two standard ways to make the database catch the conflict instead of swallowing it.",
  outcome: "No update is silently lost — the conflict is caught, not swallowed.",
  unit: "ms",
  stages: [
    {
      id: "open",
      label: "Both open it",
      icon: "Users",
      oneLiner:
        "Two people open the same record at nearly the same moment, each in their own session.",
      problem:
        "Real systems have many users, and nothing stops two of them from working on the same thing at once. The trouble starts the instant more than one person can edit a single record.",
      how: "Alice and Bob both load the same customer record — say a form showing balance = 100. They each get their own request, their own session, their own copy of the page. Neither one is told the other is there; as far as each is concerned, they are alone with the record.",
      input: "Two independent requests for the same record.",
      output: "Two people looking at the same starting data on their screens.",
      tradeoff:
        "Letting everyone edit freely is simple and feels responsive, but it quietly sets up a race the moment both decide to save.",
      latencyMs: 30,
      related: [
        { label: "Concurrency", note: "More than one thing happening to the same data at once." },
        { label: "Sessions", note: "Each user's request is isolated and unaware of the others." },
      ],
    },
    {
      id: "read",
      label: "Both read",
      icon: "Database",
      oneLiner:
        "Both requests read the same current value from the database at the same moment.",
      problem:
        "Nothing yet tells either request that someone else is about to change the same row. A plain read leaves no trace and takes no lock.",
      how: "Each session issues a SELECT and gets the identical starting value, for example balance = 100. A read like this does not reserve the row or warn anyone — it just hands back the current value and moves on. Both sessions now believe the truth is 100.",
      input: "A request to view the record before editing.",
      output: "Two copies of the same starting value, one on each screen.",
      tradeoff:
        "Reading without a lock is cheap and scales well, but it opens the window in which two writers can each act on the same stale starting point.",
      latencyMs: 20,
      related: [
        { label: "Isolation levels", note: "Decide what each transaction is allowed to see of the other." },
        { label: "Stale reads", note: "A value that was true when read but changes before you write." },
      ],
    },
    {
      id: "edit",
      label: "Each edits",
      icon: "TextCursorInput",
      oneLiner:
        "Each person changes their own copy locally, based on the value they read.",
      problem:
        "Editing happens in the user's head and in the browser — far away from the database, and over a stretch of time the database knows nothing about.",
      how: "Alice changes 100 to 120. Bob, working from the same 100, changes it to 150. Each edit is correct on its own and each is computed from the value that person read. But both are built on the same starting number, and neither has told the database anything yet.",
      input: "The starting value each person read.",
      output: "Two different intended new values: Alice wants 120, Bob wants 150.",
      tradeoff:
        "Editing a local copy keeps the UI fast and lets people take their time, but it stretches the gap between reading and writing — the exact gap where the conflict grows.",
      latencyMs: 15,
      related: [
        { label: "Read-modify-write", note: "The pattern — read a value, change it, write it back — that races." },
        { label: "Think time", note: "The unpredictable human delay between opening and saving." },
      ],
    },
    {
      id: "submit",
      label: "Both submit",
      icon: "Send",
      oneLiner:
        "Both people hit Save, sending their new value back to the server.",
      problem:
        "The two saves were prepared independently, but they are now heading for the very same row — and their arrival order is arbitrary.",
      how: "Alice's save (set balance = 120) and Bob's save (set balance = 150) travel to the server as two separate write requests. Which one lands first depends on network timing, not on who is right. Crucially, each request carries only the final number — it says nothing about the 100 it was based on.",
      input: "Two intended new values from two users.",
      output: "Two write requests racing toward the same record.",
      tradeoff:
        "Sending just the final value keeps requests small and simple, but by dropping the original value it throws away the one clue that would let the server detect a clash.",
      latencyMs: 40,
      related: [
        { label: "Idempotency", note: "Whether repeating the same request is safe." },
        { label: "Request ordering", note: "Arrival order is decided by the network, not by intent." },
      ],
    },
    {
      id: "lost-update",
      label: "Lost update",
      icon: "Split",
      oneLiner:
        "Naively, whoever writes last wins — and the earlier change vanishes without a trace.",
      problem:
        "With a plain overwrite, the database has no way to know Bob's save was built on data Alice already replaced. It just does as it is told.",
      how: "Alice's write lands first: balance becomes 120. Then Bob's write lands: set balance = 150, overwriting 120 as if it never existed. Bob was working from 100, so his 150 quietly erased Alice's change. No error is raised — the database faithfully did the last thing it was asked. This is the lost update.",
      input: "Two writes that both blindly overwrite the same field.",
      output: "A final value of 150 — and Alice's change gone, with nobody warned.",
      tradeoff:
        "\"Last write wins\" is the default and needs zero extra code, but it silently destroys concurrent edits — the worst kind of bug, because it looks like nothing went wrong.",
      latencyMs: 10,
      related: [
        { label: "Lost update", note: "The concurrency anomaly this whole flow is about." },
        { label: "Race condition", note: "Correctness depending on accidental timing." },
        { label: "Last write wins", note: "The naive default that causes the loss." },
      ],
    },
    {
      id: "transaction",
      label: "Transaction",
      icon: "Database",
      oneLiner:
        "The fix begins by wrapping the read and the write in one transaction so they act as a single unit.",
      problem:
        "The overwrite happened because reading and writing were two disconnected steps with a gap between them. To close the gap you need the database to treat them as one indivisible operation.",
      how: "The update is done inside a transaction: BEGIN, then read the row, then write it, then COMMIT. Everything between BEGIN and COMMIT either all takes effect or none of it does, and the database can now reason about the read and write together. On its own a transaction guarantees all-or-nothing, but it is the container that makes the next step — locking or a version check — possible.",
      input: "The two racing writes, now each run inside a transaction.",
      output: "A single atomic unit per writer, ready to be coordinated.",
      tradeoff:
        "Transactions add bookkeeping and hold resources until commit, so long-running ones hurt throughput — but they are the foundation every correct fix builds on.",
      latencyMs: 25,
      related: [
        { label: "ACID", note: "Atomic, consistent, isolated, durable — what a transaction promises." },
        { label: "Commit & rollback", note: "Make the whole unit stick, or undo all of it." },
        { label: "Isolation levels", note: "How strictly one transaction is shielded from another." },
      ],
    },
    {
      id: "lock",
      label: "Take the lock",
      icon: "Lock",
      oneLiner:
        "Either the second writer waits on a row lock, or an optimistic version check catches the clash.",
      problem:
        "A transaction alone still lets both writers read 100 and race. Something has to make them take turns, or make a stale write fail — otherwise the lost update returns.",
      how: "Two standard approaches. Pessimistic: read with SELECT ... FOR UPDATE, which locks the row; the second writer's transaction blocks and waits until the first commits, then reads the fresh value. Optimistic: add a version column; you read version = 7, and your update runs UPDATE ... SET balance = 120, version = 8 WHERE id = ? AND version = 7 — if someone already bumped it to 8, zero rows match and your write is refused.",
      input: "Two transactions attempting to update the same row.",
      output: "One writer proceeds; the other either waits its turn or is flagged as out of date.",
      tradeoff:
        "Pessimistic locks are simple and airtight but serialise writers and risk deadlocks if held too long; optimistic checks stay lock-free and fast under low contention but push retries onto the caller when clashes are common.",
      latencyMs: 60,
      related: [
        { label: "SELECT ... FOR UPDATE", note: "Locks the row so the next writer must wait." },
        { label: "Optimistic locking", note: "A version column lets a stale write be rejected." },
        { label: "Deadlocks", note: "Two transactions each waiting on a lock the other holds." },
      ],
    },
    {
      id: "resolve",
      label: "Reject or retry",
      icon: "RefreshCw",
      oneLiner:
        "The conflicting save is refused or retried against the fresh value, so neither change is lost.",
      problem:
        "Catching the clash only helps if the loser is told and gets a fair chance to redo their edit on current data — a silent failure would be no better than the original bug.",
      how: "With a lock, Bob's transaction wakes once Alice commits, re-reads balance = 120, and applies his change to that instead of the stale 100. With optimistic locking, Bob's UPDATE matched zero rows, so the app returns a conflict (an HTTP 409) and asks Bob to reload and redo the edit. Either way the second write is computed from the value the first writer actually left behind.",
      input: "A blocked or rejected second write.",
      output: "A final value that reflects both intentions — or an honest conflict shown to the user.",
      tradeoff:
        "Retrying and conflict prompts add code and can annoy users when contention is high, but that friction is the price of never quietly throwing away someone's work.",
      latencyMs: 45,
      related: [
        { label: "HTTP 409 Conflict", note: "The status that tells a client its write was out of date." },
        { label: "Retry logic", note: "Re-running the operation against the current value." },
        { label: "Merge strategies", note: "When both edits matter, combine them instead of picking one." },
      ],
    },
  ],
};
