import type { TopicContent } from "@/lib/topics";

export const batchH: TopicContent[] = [
  {
    slug: "sync-vs-async",
    tagline:
      "Whether your code waits for a slow operation to finish, or moves on and is told later.",
    problem:
      "A web server calls a payment API that takes two seconds to respond. If the server just sits and waits, that whole thread is frozen for two seconds doing nothing but staring at the network — and while it waits, it can't serve anyone else. Multiply that by a few hundred concurrent users and the server falls over, not because it's busy, but because it's idle in the worst possible way. How do you keep working while you wait?",
    how: [
      {
        type: "para",
        text: "Synchronous means one thing at a time in order: you call an operation, and the next line doesn't run until it returns. Asynchronous means you kick off the operation and continue; when it eventually finishes, its result arrives via a callback, a promise/future, or by resuming a suspended function. The key insight is that most waiting is for I/O — network, disk, another service — and during that wait the CPU has nothing to do, so a single thread can start hundreds of I/O operations and handle each as it completes.",
      },
      {
        type: "points",
        items: [
          "Synchronous (blocking): the caller stops until the result is ready. Simple to read and reason about.",
          "Asynchronous (non-blocking): the caller continues; the result is delivered later via callback, promise, or await.",
          "Async shines for I/O-bound work (waiting on network/disk), not CPU-bound work (which needs real parallelism).",
          "An event loop (as in Node.js) runs one thread but juggles many in-flight operations by resuming each when its I/O is ready.",
        ],
      },
      {
        type: "note",
        text: "Async is not the same as parallel. A single-threaded event loop is concurrent — it interleaves many tasks — but only ever runs one line of your code at a time. For CPU-heavy work you still need multiple threads or processes.",
      },
    ],
    tradeoffs: {
      good: [
        "One thread can handle thousands of waiting connections instead of one.",
        "Uses far less memory than a thread-per-request model.",
        "Keeps user interfaces responsive — the UI thread never freezes on a slow call.",
      ],
      costs: [
        "Async code is harder to write and read — control flow jumps around.",
        "Errors and stack traces are murkier across callback and await boundaries.",
        "A single blocking or CPU-heavy call can stall an entire event loop.",
        "No help for CPU-bound work; you still need real parallelism there.",
      ],
    },
    realWorld:
      "This is the whole design of Node.js, and of async/await in Python, C#, and Rust. When a service that 'wasn't even busy' can't handle more users, the culprit is usually synchronous I/O tying up threads. When an app freezes mid-click, it's usually blocking work on the UI thread.",
    related: [
      {
        slug: "process-vs-thread",
        note: "The unit of real parallelism, versus async concurrency on one thread.",
      },
      {
        slug: "thread-pools",
        note: "The other common way to handle many requests — a pool of blocking threads.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Async trades a little per-request latency for far more throughput.",
      },
      {
        slug: "channels",
        note: "Go's model for coordinating async work without callbacks.",
      },
      {
        slug: "race-conditions",
        note: "Concurrency of any kind opens the door to timing bugs.",
      },
    ],
  },
  {
    slug: "race-conditions",
    tagline:
      "When the result depends on the exact timing of things happening at once.",
    problem:
      "Two requests both read a counter at 41, both add one, both write 42. Two increments happened but the counter only went up by one. The bug appears once in a thousand runs and never in your tests. What went wrong?",
    how: [
      {
        type: "para",
        text: "A race condition happens when two threads or processes touch shared state and the outcome depends on who runs first. Because scheduling is unpredictable, the interleaving that breaks things happens rarely and non-deterministically.",
      },
      {
        type: "points",
        items: [
          "The fix is to make the critical section atomic — one at a time.",
          "Tools: locks/mutexes, atomic operations, or database transactions.",
          "Read-modify-write on shared data is the classic trigger.",
        ],
      },
      {
        type: "note",
        text: "The window is often a single 'increment' that is really three steps under the hood — read, add, write — and any of them can be interrupted between the others.",
      },
    ],
    tradeoffs: {
      good: [
        "Understanding them prevents a whole class of heisenbugs.",
        "Fixes are well-understood (locks, atomics).",
        "Databases give you transactions for the same problem.",
      ],
      costs: [
        "Hard to reproduce and debug.",
        "Over-locking to be safe hurts concurrency.",
        "Easy to introduce a deadlock while fixing a race.",
      ],
    },
    realWorld:
      "The 'lost update' and 'sold the last item twice' bugs are races; they hide until load rises.",
    related: [
      { slug: "mutex", note: "The main tool to prevent races." },
      { slug: "locks", note: "The database-level equivalent for shared rows." },
      { slug: "deadlock", note: "The failure mode of over-locking." },
      { slug: "atomic-operations", note: "A lighter-weight fix." },
    ],
  },
  {
    slug: "mutex",
    tagline:
      "A lock that lets exactly one thread into a section of code at a time.",
    problem:
      "Two threads both run counter++ on the same variable. That single line is really read, add, write — and if the threads interleave those steps, one increment gets lost. You need a way to say 'while I'm doing this, nobody else touches it.' How do you enforce one-at-a-time access to shared data?",
    how: [
      {
        type: "para",
        text: "A mutex — short for mutual exclusion — is a lock a thread acquires before entering a critical section and releases when it leaves. Only one thread can hold it at a time; any other thread that tries to acquire it blocks (waits) until the holder releases. This turns a stretch of code that touches shared state into an indivisible unit: while you hold the mutex, you're guaranteed no other thread is inside the same section.",
      },
      {
        type: "points",
        items: [
          "acquire (lock) at the start of the critical section, release (unlock) at the end.",
          "Keep the critical section as small as possible — everything inside it is serialized.",
          "Always release, even on error paths, or you leave the lock held forever (use RAII / try-finally / defer).",
          "A mutex protects data, not code — every access to that data must go through the same mutex to be safe.",
        ],
      },
      {
        type: "note",
        text: "A mutex is the in-process cousin of a database row lock. Same idea — serialize access to shared state — just at the level of memory and threads rather than rows and transactions.",
      },
    ],
    tradeoffs: {
      good: [
        "Simple, well-understood way to make shared state safe.",
        "Guarantees mutual exclusion — no torn reads or lost updates.",
        "Available in every threading library.",
      ],
      costs: [
        "Threads waiting on a contended mutex sit idle — a bottleneck under load.",
        "Two mutexes acquired in different orders by different threads deadlock.",
        "Forgetting to release, or holding it too long, stalls everyone.",
        "Coarse locking around too much code destroys the benefit of multiple threads.",
      ],
    },
    realWorld:
      "Any time multiple threads share a data structure — an in-memory cache, a connection pool, a shared counter — a mutex is the default protection. When a multi-threaded program mysteriously produces wrong numbers under load, an unprotected shared variable is the usual cause.",
    related: [
      {
        slug: "race-conditions",
        note: "The bug a mutex exists to prevent.",
      },
      {
        slug: "semaphore",
        note: "A generalization — a mutex is like a semaphore that allows just one.",
      },
      {
        slug: "deadlock",
        note: "The classic hazard of holding more than one mutex.",
      },
      {
        slug: "atomic-operations",
        note: "A lighter alternative when you only need to protect one variable.",
      },
      {
        slug: "os-locking-sync",
        note: "How the OS actually implements blocking and waking threads.",
      },
    ],
  },
  {
    slug: "semaphore",
    tagline:
      "A counter that limits how many threads can use a resource at once.",
    problem:
      "You have a pool of 10 database connections, but 200 threads that all want one. If they all grab connections at once, you exhaust the pool and everything breaks. A plain mutex only allows one at a time — too restrictive. You want 'up to 10 at a time, the rest wait.' How do you cap concurrent access at a number greater than one?",
    how: [
      {
        type: "para",
        text: "A semaphore holds a count of available 'permits'. A thread calls acquire (wait) to take a permit — if the count is above zero it decrements and proceeds; if it's zero the thread blocks until a permit is returned. When done, the thread calls release (signal), incrementing the count and waking a waiter. Initialize it to N and you've capped concurrency at N. A binary semaphore (count of 1) behaves much like a mutex.",
      },
      {
        type: "points",
        items: [
          "Counting semaphore: initialized to N, allows up to N concurrent holders — perfect for pools and rate limits.",
          "Binary semaphore: count of 1, used for mutual exclusion or simple signaling.",
          "Also used purely for signaling: one thread releases to wake another that's waiting (producer/consumer).",
          "Unlike a mutex, a semaphore has no concept of an 'owner' — any thread can release it.",
        ],
      },
      {
        type: "note",
        text: "Because there's no owner, semaphores are more flexible but easier to misuse: an extra release inflates the count and lets too many threads in, while a forgotten release permanently shrinks capacity.",
      },
    ],
    tradeoffs: {
      good: [
        "Caps concurrency at any number you choose, not just one.",
        "Ideal for guarding limited resources — connections, file handles, API quotas.",
        "Doubles as a signaling primitive between threads.",
      ],
      costs: [
        "No ownership, so bugs (double-release, missing release) are subtle.",
        "Still causes waiting and can deadlock if combined carelessly.",
        "Choosing the right count is a tuning problem, not an obvious value.",
      ],
    },
    realWorld:
      "Connection pools, thread pools, and 'allow at most N concurrent uploads' throttles are semaphores under the hood. Rate limiters and bulkheads that protect a downstream service from being overwhelmed are the same idea applied to protect capacity.",
    related: [
      {
        slug: "mutex",
        note: "A semaphore of count 1 — the simpler, owned version.",
      },
      {
        slug: "connection-pooling",
        note: "A canonical use — cap concurrent connections at the pool size.",
      },
      {
        slug: "thread-pools",
        note: "Bounding worker count is the same 'limit concurrency' idea.",
      },
      {
        slug: "rate-limiting",
        note: "Capping concurrent or per-window usage builds on the same counting logic.",
      },
      {
        slug: "deadlock",
        note: "Semaphores can deadlock too if acquired in bad orders.",
      },
    ],
  },
  {
    slug: "deadlock",
    tagline:
      "Two or more threads each waiting forever for a lock the other holds.",
    problem:
      "Thread A grabs lock 1 and then reaches for lock 2. At the same moment, thread B holds lock 2 and reaches for lock 1. Neither will release what it has until it gets the other. Both stop, forever, and the part of your system that needs those resources simply hangs. Nothing crashes — it just freezes. How does this happen, and how do you prevent it?",
    how: [
      {
        type: "para",
        text: "A deadlock needs four conditions to hold at once (the Coffman conditions): mutual exclusion (a resource can be held by only one at a time), hold-and-wait (you keep what you have while waiting for more), no preemption (locks can't be forcibly taken away), and circular wait (a cycle of who-waits-for-whom). Break any one of these and deadlock becomes impossible.",
      },
      {
        type: "points",
        items: [
          "The most practical fix: impose a global lock ordering — everyone acquires locks in the same order, breaking the circular wait.",
          "Use timeouts: if you can't get a lock within N ms, back off and retry instead of waiting forever.",
          "Acquire all needed locks at once, or none — avoids hold-and-wait.",
          "Databases detect deadlock cycles automatically and abort one transaction (the 'victim'), so your code must be ready to retry.",
        ],
      },
      {
        type: "note",
        text: "Livelock is the sneaky cousin: threads keep responding to each other and changing state but make no progress — like two people stepping side to side in a hallway. Retrying with a small random backoff usually breaks it.",
      },
    ],
    tradeoffs: {
      good: [
        "Fully preventable with disciplined lock ordering.",
        "Databases detect and resolve it for you automatically.",
        "The four-condition model makes the cause diagnosable.",
      ],
      costs: [
        "The system hangs silently — no crash, no obvious error.",
        "Reproducing it depends on precise, rare timing.",
        "Lock ordering is easy to violate as code grows and locks multiply.",
        "Timeout-based avoidance forces retry logic everywhere.",
      ],
    },
    realWorld:
      "Deadlocks show up in databases (two transactions updating the same rows in opposite orders), in multi-threaded code holding several mutexes, and in distributed systems waiting on each other. The database logging 'deadlock detected, transaction aborted' is your cue to make the operation retryable.",
    related: [
      {
        slug: "mutex",
        note: "Deadlock is the main hazard of holding more than one at a time.",
      },
      {
        slug: "locks",
        note: "The database version — transactions waiting on each other's rows.",
      },
      {
        slug: "race-conditions",
        note: "Often introduced while adding locks to fix a race.",
      },
      {
        slug: "failure-retries-timeouts",
        note: "Timeouts and retries are the standard escape hatch.",
      },
      {
        slug: "semaphore",
        note: "Can deadlock too when acquired in inconsistent orders.",
      },
    ],
  },
  {
    slug: "atomic-operations",
    tagline:
      "A single indivisible operation that can't be interrupted halfway through.",
    problem:
      "Protecting a shared counter with a full mutex works, but it feels heavy: every increment now involves acquiring a lock, possibly blocking a thread, and releasing it — a lot of machinery just to add one to a number. Under high contention, threads spend more time waiting on the lock than doing work. Is there a way to update shared data safely without the overhead of locking?",
    how: [
      {
        type: "para",
        text: "An atomic operation completes as a single, indivisible step from the perspective of other threads — no one can observe it half-done. Modern CPUs provide atomic instructions for small operations: atomic increment, atomic swap, and especially compare-and-swap (CAS), which says 'if this value is still X, set it to Y — and tell me whether it worked.' Building on CAS in a retry loop, you can update shared state correctly without ever taking a lock.",
      },
      {
        type: "points",
        items: [
          "Compare-and-swap (CAS) is the workhorse: it atomically checks-then-sets and reports success or failure.",
          "Lock-free algorithms retry the CAS in a loop until it succeeds, instead of blocking.",
          "Atomics work on single machine words (a counter, a flag, a pointer) — not arbitrary multi-field updates.",
          "No blocking means no deadlock, but a losing thread just spins and tries again.",
        ],
      },
      {
        type: "note",
        text: "Atomics are the right tool for one small variable. Once you need to keep several fields consistent together, you're back to needing a mutex or a transaction — CAS only makes one word indivisible at a time.",
      },
    ],
    tradeoffs: {
      good: [
        "No locks, so no deadlocks and no blocking.",
        "Much faster than a mutex under high contention for simple updates.",
        "Hardware-supported, so extremely efficient.",
      ],
      costs: [
        "Only covers single small values, not complex multi-step updates.",
        "Lock-free code with CAS loops is notoriously hard to get right.",
        "Under heavy contention, threads waste cycles retrying failed CAS.",
        "Subtle hazards (like the ABA problem) trap the unwary.",
      ],
    },
    realWorld:
      "Atomic counters power metrics, reference counting (how garbage collectors and smart pointers know when to free memory), and lock-free queues. When a library advertises 'lock-free' data structures, CAS is what's underneath. It's also how a database implements optimistic locking with a version number.",
    related: [
      {
        slug: "race-conditions",
        note: "A lighter-weight way to close the same window than a full lock.",
      },
      {
        slug: "mutex",
        note: "The heavier alternative when you need to protect more than one value.",
      },
      {
        slug: "garbage-collection",
        note: "Atomic reference counting is one way runtimes track liveness.",
      },
      {
        slug: "isolation-levels",
        note: "Optimistic concurrency at the database level uses the same check-then-set idea.",
      },
      {
        slug: "single-vs-multi-threaded",
        note: "Atomics only matter once more than one thread shares state.",
      },
    ],
  },
  {
    slug: "thread-pools",
    tagline:
      "A fixed set of reusable worker threads that pull tasks from a queue.",
    problem:
      "Your server spawns a brand-new thread for every incoming request. Under a traffic spike, ten thousand requests arrive and you try to create ten thousand threads. Each thread costs a megabyte or more of memory and adds scheduling overhead, so the machine thrashes and grinds to a halt — creating threads is now more expensive than the work itself. How do you handle bursts of work without an unbounded explosion of threads?",
    how: [
      {
        type: "para",
        text: "A thread pool creates a fixed number of worker threads up front and reuses them. Incoming tasks go onto a shared queue; idle workers pick up the next task, run it, and loop back for another. This caps concurrency at the pool size, amortizes the cost of thread creation across many tasks, and gives you a natural place to apply backpressure — when the queue fills, you can reject, block, or shed load rather than melt down.",
      },
      {
        type: "points",
        items: [
          "Pool size is the key knob: for CPU-bound work, roughly the number of cores; for I/O-bound work, more, since workers spend time waiting.",
          "The task queue decouples arrival rate from processing rate, smoothing bursts.",
          "A bounded queue is your safety valve — an unbounded one just moves the memory blowup from threads to the queue.",
          "When the pool and queue are both full, a rejection policy decides what happens next.",
        ],
      },
      {
        type: "note",
        text: "One slow or blocking task can tie up a worker and starve the others. Never run a long blocking operation on a pool sized for quick tasks — it silently drains your concurrency.",
      },
    ],
    tradeoffs: {
      good: [
        "Bounds resource use — a fixed number of threads no matter the load.",
        "Avoids the cost of creating and destroying threads per task.",
        "The queue absorbs bursts and gives you a place to apply backpressure.",
      ],
      costs: [
        "Sizing the pool wrong throttles throughput or wastes resources.",
        "A blocking task can starve the whole pool.",
        "An unbounded queue hides the problem until it OOMs.",
        "Adds latency when tasks wait in the queue behind others.",
      ],
    },
    realWorld:
      "Almost every web server, database driver, and background-job system uses a thread pool. Java's ExecutorService, most HTTP servers, and worker frameworks like Celery or Sidekiq are all this pattern. When a service under load has 'plenty of CPU free' but requests queue up, an undersized or blocked thread pool is a prime suspect.",
    related: [
      {
        slug: "semaphore",
        note: "Bounding worker count is a 'limit concurrency to N' problem.",
      },
      {
        slug: "queue",
        note: "The task queue at the pool's heart.",
      },
      {
        slug: "sync-vs-async",
        note: "The alternative model — one thread juggling many I/O waits.",
      },
      {
        slug: "connection-pooling",
        note: "The same pool-and-reuse idea applied to database connections.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Pool size trades queueing latency against total throughput.",
      },
    ],
  },
  {
    slug: "channels",
    tagline:
      "A typed pipe that lets goroutines communicate by passing values, not by sharing memory.",
    problem:
      "The usual way threads coordinate is through shared variables guarded by locks — and that's exactly where race conditions, deadlocks, and forgotten unlocks live. It's error-prone precisely because everyone is reaching into the same memory. What if instead of sharing memory and locking it, one goroutine just handed the data to another?",
    how: [
      {
        type: "para",
        text: "A channel is a typed conduit in Go: one goroutine sends a value into it, another receives. The channel itself handles the synchronization. Go's guiding slogan is 'do not communicate by sharing memory; instead, share memory by communicating' — ownership of the data passes through the channel, so only one goroutine touches it at a time by construction, without an explicit lock.",
      },
      {
        type: "points",
        items: [
          "Unbuffered channel: the sender blocks until a receiver is ready — a synchronization point (a handoff).",
          "Buffered channel: holds up to N values; the sender only blocks when the buffer is full, decoupling producer and consumer.",
          "select lets a goroutine wait on multiple channels at once — the basis for timeouts and cancellation.",
          "Closing a channel signals 'no more values', which receivers can detect to shut down cleanly.",
        ],
      },
      {
        type: "note",
        text: "Channels don't abolish concurrency bugs — send on a closed channel and you panic; forget to close or receive and goroutines leak or deadlock. They move the mistakes from 'forgot a lock' to 'forgot a handshake.'",
      },
    ],
    tradeoffs: {
      good: [
        "Encourages designs where data has a single clear owner, avoiding shared-state races.",
        "select gives clean timeouts, cancellation, and fan-in/fan-out.",
        "Reads more like a pipeline than a tangle of locks.",
      ],
      costs: [
        "Not a cure-all — deadlocks and leaked goroutines still happen.",
        "For simply protecting one shared counter, a mutex is often simpler and faster.",
        "Buffer sizing is a real tuning decision with backpressure implications.",
        "Overusing channels can make control flow harder to follow than direct locking.",
      ],
    },
    realWorld:
      "Channels are how Go structures worker pools, pipelines, and request cancellation (via context). They're an in-language echo of the message-queue pattern: producers and consumers coordinating through a buffer rather than shared mutable state.",
    related: [
      {
        slug: "message-queues",
        note: "The same producer/consumer-through-a-buffer idea, across processes.",
      },
      {
        slug: "queue",
        note: "A buffered channel is essentially a thread-safe queue.",
      },
      {
        slug: "mutex",
        note: "The shared-memory alternative channels are designed to avoid.",
      },
      {
        slug: "race-conditions",
        note: "Passing ownership sidesteps the shared-state races locks fight.",
      },
      {
        slug: "sync-vs-async",
        note: "Channels are Go's way of coordinating concurrent work.",
      },
    ],
  },
  {
    slug: "caching-cdn",
    tagline:
      "Keeping copies of data close to where it's needed so you don't recompute or refetch it.",
    problem:
      "Your product page runs the same expensive database query for every visitor, and a user in Sydney waits 300ms just for bytes to cross the ocean from your server in Virginia. The data barely changes minute to minute, yet you pay the full cost — compute and distance — on every single request. Why keep doing the same work and the same long trip over and over?",
    how: [
      {
        type: "para",
        text: "Caching stores the result of expensive work (a query, a computation, a rendered page) so later requests can be served from the copy instead of redoing it. A CDN (content delivery network) applies the same idea to geography: it puts copies of your static assets — images, CSS, JS, sometimes whole pages — on servers spread around the world, so users are served from a nearby edge location instead of your origin. Caches live at many layers: in the browser, at the CDN edge, in a shared store like Redis, and inside the application and database.",
      },
      {
        type: "points",
        items: [
          "A cache hit serves the stored copy fast; a cache miss falls through to the slow source and usually populates the cache on the way back.",
          "Freshness is controlled by TTLs (time-to-live) and cache-control headers — how long a copy is trusted before it's re-fetched.",
          "The hard part is invalidation: when the underlying data changes, stale copies must be evicted or expired.",
          "A CDN also absorbs traffic spikes and shields your origin from load and some attacks.",
        ],
      },
      {
        type: "note",
        text: "The old joke — 'there are only two hard things in computer science: cache invalidation and naming things' — is about exactly this. Serving stale data because you forgot to invalidate is the most common caching bug.",
      },
    ],
    tradeoffs: {
      good: [
        "Dramatically cuts latency — served from memory or a nearby edge instead of origin.",
        "Reduces load on databases and origin servers, often by an order of magnitude.",
        "A CDN shields the origin from spikes and geographically distant users.",
      ],
      costs: [
        "Stale data: a cached copy can lag the true value until it expires.",
        "Invalidation is genuinely hard to get right.",
        "Adds a layer to reason about and debug ('is this the cached or live value?').",
        "Caching per-user or rapidly changing data can cost more than it saves.",
      ],
    },
    realWorld:
      "Every fast website leans on this: Cloudflare, Fastly, and CloudFront for the CDN layer; Redis or Memcached for shared application caches; HTTP cache headers for the browser. When a deploy 'didn't take' for some users, a stale CDN or browser cache is usually why.",
    related: [
      {
        slug: "caching-perf",
        note: "The application-level side of caching, in depth.",
      },
      {
        slug: "redis",
        note: "The go-to shared, in-memory cache store.",
      },
      {
        slug: "latency-vs-throughput",
        note: "Caching's main payoff is slashing latency.",
      },
      {
        slug: "headers-cookies",
        note: "Cache-Control and ETag headers drive HTTP caching.",
      },
      {
        slug: "eventual-consistency",
        note: "A cache is a deliberately stale-for-a-while copy of the truth.",
      },
    ],
  },
  {
    slug: "message-queues",
    tagline:
      "A buffer that lets services hand off work asynchronously instead of calling each other directly.",
    problem:
      "When a user places an order, you need to charge their card, send a confirmation email, update inventory, and notify the warehouse. If you do all of that inside the request, the user waits for the slowest step, and if the email service is down the whole order fails. These steps don't need to happen right now, together, or even reliably on the first try. Why make the user — and the order — hostage to every downstream service?",
    how: [
      {
        type: "para",
        text: "A message queue sits between a producer and a consumer. The producer drops a message (an order-placed event, a job to run) onto the queue and returns immediately; one or more consumers pull messages off and process them on their own schedule. This decouples the two sides in time (the consumer can be slow or briefly offline), in load (the queue absorbs bursts), and in failure (a crashed consumer just leaves the message for a retry).",
      },
      {
        type: "points",
        items: [
          "The producer doesn't wait for the work to finish — it just enqueues and moves on.",
          "Delivery guarantees vary: at-most-once, at-least-once (the common default), or exactly-once (hard and often faked).",
          "Because at-least-once means messages can be redelivered, consumers must be idempotent — processing twice must be safe.",
          "Failed messages after repeated retries go to a dead-letter queue for inspection instead of blocking the line.",
        ],
      },
      {
        type: "note",
        text: "The queue smooths spikes: if 10,000 orders land in a second but you can process 500/sec, the queue holds the backlog and consumers drain it steadily instead of everything falling over at once.",
      },
    ],
    tradeoffs: {
      good: [
        "Decouples services — one can be slow or down without failing the caller.",
        "Absorbs bursts and smooths load into a steady processing rate.",
        "Failed work retries automatically instead of being lost.",
        "Lets you scale producers and consumers independently.",
      ],
      costs: [
        "Adds infrastructure to run, monitor, and reason about.",
        "At-least-once delivery forces you to make consumers idempotent.",
        "Work becomes eventually done, not immediately — no instant result to the caller.",
        "Debugging async flows across a queue is harder than a direct call.",
      ],
    },
    realWorld:
      "RabbitMQ, Amazon SQS, and Kafka (a log, but used the same way) power order processing, email/notification sending, video encoding, and event-driven architectures everywhere. Any 'we'll handle that in the background' feature is almost certainly a queue behind the scenes.",
    related: [
      {
        slug: "idempotency",
        note: "Required because at-least-once delivery can process a message twice.",
      },
      {
        slug: "scalability",
        note: "Queues let producers and consumers scale independently.",
      },
      {
        slug: "failure-retries-timeouts",
        note: "Retries and dead-letter queues are core to reliable delivery.",
      },
      {
        slug: "microservices",
        note: "The standard way services communicate without tight coupling.",
      },
      {
        slug: "channels",
        note: "The same producer/consumer idea, inside a single Go program.",
      },
    ],
  },
  {
    slug: "replication",
    tagline:
      "Keeping copies of your data on multiple machines so reads scale and failures don't lose data.",
    problem:
      "Your entire application depends on one database server. It handles every read and every write, and the day its disk fails, your data — and your business — is gone. Even before that, all your read traffic piles onto that single machine until it's the bottleneck. Putting everything on one box is a single point of failure and a single point of contention. How do you keep more than one copy, safely?",
    how: [
      {
        type: "para",
        text: "Replication keeps copies of the data on multiple servers. The most common shape is leader-follower (primary-replica): all writes go to the leader, which streams its changes to one or more followers. Followers serve reads, which spreads read load and gives you standby copies. If the leader dies, a follower can be promoted to take over — that's failover.",
      },
      {
        type: "points",
        items: [
          "Leader-follower: one writer, many readers — scales reads and provides hot standbys.",
          "Multi-leader / leader-less: multiple nodes accept writes, scaling writes too but requiring conflict resolution.",
          "Synchronous replication waits for a follower to confirm before acking the write — safer, slower.",
          "Asynchronous replication acks immediately and streams later — faster, but a follower can lag behind and a crash can lose the last few writes.",
        ],
      },
      {
        type: "note",
        text: "Async replication creates replication lag: a client that writes then immediately reads from a follower may not see its own write yet. This is eventual consistency showing up in practice, and it surprises people constantly.",
      },
    ],
    tradeoffs: {
      good: [
        "Read throughput scales by adding followers.",
        "Surviving a machine failure without data loss (with the right settings).",
        "Standby copies enable failover and reduce downtime.",
        "Copies can live in different regions, closer to users.",
      ],
      costs: [
        "Asynchronous replication means followers can serve stale data.",
        "Synchronous replication adds write latency and can stall on a slow follower.",
        "Failover is tricky — split-brain (two leaders) is a real danger.",
        "Multi-leader setups need conflict resolution, which is genuinely hard.",
      ],
    },
    realWorld:
      "Read replicas are the standard first scaling move for a read-heavy database (PostgreSQL, MySQL, MongoDB all support them). It's also how managed databases offer high availability — a hot standby ready to take over. The classic gotcha is a user updating their profile and not seeing the change because the read hit a lagging replica.",
    related: [
      {
        slug: "sharding",
        note: "The complementary move — split data to scale writes, not just copy it.",
      },
      {
        slug: "high-availability",
        note: "Replicas are what make automatic failover possible.",
      },
      {
        slug: "eventual-consistency",
        note: "Replication lag is where this shows up day to day.",
      },
      {
        slug: "consistency-models",
        note: "Sync vs async replication is a consistency-vs-latency choice.",
      },
      {
        slug: "cap-theorem",
        note: "Replication forces the consistency-vs-availability trade under partitions.",
      },
    ],
  },
  {
    slug: "sharding",
    tagline:
      "Splitting one huge dataset across many machines so no single one holds it all.",
    problem:
      "Read replicas let you scale reads, but every write still goes to one leader, and eventually the whole dataset no longer fits — or the write volume no longer fits — on a single machine. You can't just add more replicas; they're all copies of the same overloaded write path. When one box can't hold or handle all your data, copying it won't help. You have to split it.",
    how: [
      {
        type: "para",
        text: "Sharding (horizontal partitioning) divides the data into pieces called shards, each living on a different machine, so every server holds and serves only a slice of the whole. A shard key (say, user ID) determines which shard a given row belongs to. Because different shards live on different machines, both storage and write throughput scale roughly linearly with the number of shards.",
      },
      {
        type: "points",
        items: [
          "Hash sharding: hash the key to pick a shard — spreads data evenly, but range queries must hit every shard.",
          "Range sharding: assign key ranges to shards — great for range scans, but risks hot spots if traffic clusters in one range.",
          "The shard key choice is everything: a bad one creates hot shards that overload while others sit idle.",
          "Queries that span shards (joins, aggregates) become expensive scatter-gather across the whole cluster.",
        ],
      },
      {
        type: "note",
        text: "Resharding — changing how data is split once you're live — is one of the hardest operations in all of databases. Choose your shard key as if you can never change it, because effectively you almost can't.",
      },
    ],
    tradeoffs: {
      good: [
        "Scales writes and storage beyond a single machine's limits.",
        "Each shard is smaller, so its indexes and working set are faster.",
        "Load and data spread across many machines.",
      ],
      costs: [
        "Cross-shard queries and transactions get slow and complex — or aren't supported.",
        "A poor shard key creates hot spots that defeat the whole point.",
        "Resharding a live system is painful and risky.",
        "Operational complexity jumps: many nodes, rebalancing, routing.",
      ],
    },
    realWorld:
      "Sharding is how the largest systems scale — from social networks partitioned by user ID to multi-tenant SaaS partitioned by customer. Many NoSQL stores (MongoDB, Cassandra) and 'NewSQL' databases shard automatically; traditional SQL databases usually make you do it by hand, which is why teams delay it as long as they can.",
    related: [
      {
        slug: "replication",
        note: "The other half — usually each shard is itself replicated.",
      },
      {
        slug: "scalability",
        note: "Sharding is the classic horizontal-scaling move for data.",
      },
      {
        slug: "sql-vs-nosql",
        note: "Many NoSQL stores shard automatically; SQL often makes you do it by hand.",
      },
      {
        slug: "hash-map",
        note: "Hash sharding applies the same hash-to-bucket idea across machines.",
      },
      {
        slug: "indexes",
        note: "Smaller per-shard indexes are part of the speedup.",
      },
    ],
  },
  {
    slug: "load-balancing",
    tagline:
      "Spreading incoming requests across many servers so no single one is overwhelmed.",
    problem:
      "You've run several copies of your app to handle more traffic, but clients only know one address. If everyone hits server one, it drowns while the others idle. And the moment a server crashes, requests routed to it just fail. You need something in front that spreads work across the healthy servers and stops sending traffic to dead ones. Who directs the traffic?",
    how: [
      {
        type: "para",
        text: "A load balancer sits in front of a pool of servers and distributes incoming requests among them. Clients connect to the load balancer's single address; it forwards each request to one of the backends. Crucially, it health-checks the backends and stops routing to any that fail, so a dead server is quietly taken out of rotation instead of returning errors to users. This is what lets you scale horizontally and survive individual machine failures.",
      },
      {
        type: "points",
        items: [
          "Round-robin: hand requests out in rotation. Least-connections: send to the least-busy backend.",
          "Layer 4 (transport) balancing routes by IP/port; Layer 7 (application) can route by URL path, header, or cookie.",
          "Health checks are the safety mechanism — unhealthy backends are removed automatically.",
          "Sticky sessions pin a user to one backend when state lives there — but they undercut even balancing.",
        ],
      },
      {
        type: "note",
        text: "The load balancer can become the single point of failure it was meant to eliminate. Production setups run it redundantly (or use a managed one) so the traffic director itself isn't your weakest link.",
      },
    ],
    tradeoffs: {
      good: [
        "Enables horizontal scaling — add servers and traffic spreads automatically.",
        "Routes around failed servers via health checks, improving availability.",
        "Can do TLS termination, routing, and rate limiting in one place.",
      ],
      costs: [
        "Itself a potential single point of failure — must be made redundant.",
        "Sticky sessions or shared state complicate 'any server can handle any request.'",
        "Adds a network hop and a component to operate and monitor.",
        "Uneven request costs can still leave a backend hot despite 'balanced' counts.",
      ],
    },
    realWorld:
      "Every scaled web system has one: NGINX and HAProxy as software LBs, plus cloud offerings like AWS ELB/ALB and Google Cloud Load Balancing. It's the front door that makes 'we run 20 servers' invisible to users, who only ever see one address.",
    related: [
      {
        slug: "load-balancer-proxy",
        note: "The proxy/gateway component that does the balancing.",
      },
      {
        slug: "scalability",
        note: "Load balancing is what makes horizontal scaling actually work.",
      },
      {
        slug: "high-availability",
        note: "Health checks and rerouting keep the system up when servers die.",
      },
      {
        slug: "api-gateway",
        note: "Often combined with balancing as the single front door.",
      },
      {
        slug: "sessions-cookies",
        note: "Where sticky sessions and shared session state come in.",
      },
    ],
  },
  {
    slug: "high-availability",
    tagline:
      "Designing a system to keep running even when individual parts fail.",
    problem:
      "Your service runs on one server, one database, in one data center. Any of them can fail — a disk dies, a deploy goes wrong, a whole region has an outage — and when one does, your users see downtime, sometimes for hours. In a system with a single copy of anything critical, that thing is a single point of failure, and its failure is your outage. How do you stay up when parts inevitably break?",
    how: [
      {
        type: "para",
        text: "High availability (HA) means eliminating single points of failure so the system as a whole keeps serving even when components fail. The core technique is redundancy — run more than one of everything critical — combined with automatic failover, so when one instance dies, another takes over without human intervention. Availability is measured in 'nines': 99.9% ('three nines') is about 8.7 hours of downtime a year; 99.99% is under an hour.",
      },
      {
        type: "points",
        items: [
          "Redundancy: multiple app servers, replicated databases, spread across availability zones or regions.",
          "Failover: detect a failure and shift traffic/promote a standby automatically, ideally in seconds.",
          "No single point of failure: audit every component and ask 'what if this one dies?'",
          "Health checks and monitoring are what make failure detectable in the first place.",
        ],
      },
      {
        type: "note",
        text: "Each extra nine costs far more than the last. Going from 99.9% to 99.99% might mean multi-region deployment and automated failover — a large jump in cost and complexity for that one extra nine. Match your target to what the business actually needs.",
      },
    ],
    tradeoffs: {
      good: [
        "The system survives individual component failures without downtime.",
        "Enables maintenance and deploys without taking the service offline.",
        "Protects revenue and reputation that outages would damage.",
      ],
      costs: [
        "Redundant everything roughly multiplies infrastructure cost.",
        "Failover logic is complex and can misfire (or cause split-brain).",
        "Every added nine gets disproportionately more expensive.",
        "More moving parts means more that can itself break.",
      ],
    },
    realWorld:
      "SLAs are promises about availability, and cloud providers structure their whole offering around it: availability zones, multi-region deployments, auto-scaling groups that replace dead instances. The discipline of asking 'what's my single point of failure?' about every component is the heart of HA design.",
    related: [
      {
        slug: "fault-tolerance",
        note: "The broader discipline of surviving failures gracefully.",
      },
      {
        slug: "replication",
        note: "Redundant data copies are the foundation of a highly available database.",
      },
      {
        slug: "load-balancing",
        note: "Health checks and rerouting keep traffic on healthy servers.",
      },
      {
        slug: "failure-retries-timeouts",
        note: "The client-side tactics that ride on top of HA infrastructure.",
      },
      {
        slug: "observability",
        note: "You can't fail over from a failure you can't detect.",
      },
    ],
  },
  {
    slug: "scalability",
    tagline:
      "A system's ability to handle growing load by adding resources, without falling over.",
    problem:
      "Your app is snappy with a thousand users. You hit the news, a hundred thousand arrive in an hour, and everything grinds to a crawl — pages time out, the database maxes out, users leave. The design that was perfectly fine at small scale simply can't absorb the growth. The question isn't 'is it fast?' but 'what happens when load multiplies by 100 — can I add capacity, or do I have to rebuild?'",
    how: [
      {
        type: "para",
        text: "Scalability is how well a system copes with more load — more users, requests, or data — by adding resources. There are two directions. Vertical scaling (scaling up) means a bigger machine: more CPU, RAM, faster disk. It's simple but hits a hard ceiling and gets expensive fast. Horizontal scaling (scaling out) means more machines working together; it scales much further but demands that your system be designed for it.",
      },
      {
        type: "points",
        items: [
          "Vertical (up): bigger box — easy, but capped by the largest machine you can buy.",
          "Horizontal (out): more boxes — near-unlimited, but requires distribution.",
          "Stateless services scale out trivially: any instance can handle any request behind a load balancer.",
          "The bottleneck usually migrates to shared state — the database — which is why replication, sharding, and caching follow.",
        ],
      },
      {
        type: "note",
        text: "Keeping application servers stateless is the single most important design choice for horizontal scaling. Push session and user state into a shared store (a database or Redis) so you can add and remove servers freely.",
      },
    ],
    tradeoffs: {
      good: [
        "Handles growth by adding capacity rather than rewriting.",
        "Horizontal scaling can absorb enormous load and add redundancy too.",
        "Lets you match capacity (and cost) to demand, especially in the cloud.",
      ],
      costs: [
        "Vertical scaling hits a hard, expensive ceiling.",
        "Horizontal scaling adds distributed-systems complexity (consistency, coordination).",
        "Stateful components (the database) are the hard part and often the real limit.",
        "Premature scaling wastes effort on problems you don't have yet.",
      ],
    },
    realWorld:
      "This is the arc of a growing product: start on one big server (vertical), then split into stateless app servers behind a load balancer, then scale the data layer with read replicas, caching, and eventually sharding. Auto-scaling in the cloud adds and removes horizontal capacity automatically as load changes.",
    related: [
      {
        slug: "load-balancing",
        note: "The mechanism that makes horizontal scaling work.",
      },
      {
        slug: "sharding",
        note: "How you scale the data layer past one machine.",
      },
      {
        slug: "replication",
        note: "Scales reads and adds redundancy as you grow.",
      },
      {
        slug: "caching-cdn",
        note: "Often the cheapest scaling move — serve less load to the origin.",
      },
      {
        slug: "message-queues",
        note: "Decouple and scale producers and consumers independently.",
      },
    ],
  },
  {
    slug: "fault-tolerance",
    tagline:
      "Building systems that keep working correctly even when parts of them fail.",
    problem:
      "In a distributed system, something is always broken: a network call times out, a downstream service is down, a disk is corrupt, a machine reboots. At scale, failure isn't an exception — it's the steady state. If one failing dependency can take down your whole service, you'll be down constantly. How do you keep functioning, at least partially, when the pieces you depend on are failing right now?",
    how: [
      {
        type: "para",
        text: "Fault tolerance means designing so that failures are expected and contained rather than catastrophic. The goal isn't to prevent failure — you can't — but to degrade gracefully: keep serving what you can, isolate the broken part, and recover automatically. It combines several patterns that assume every call might fail.",
      },
      {
        type: "points",
        items: [
          "Retries with backoff and timeouts: don't wait forever, and retry transient failures without hammering.",
          "Circuit breakers: after repeated failures, stop calling a dead dependency for a while so you fail fast and let it recover.",
          "Bulkheads: isolate resources per dependency so one slow service can't consume all your threads and sink everything.",
          "Graceful degradation and fallbacks: serve stale cache or a reduced feature instead of a hard error.",
        ],
      },
      {
        type: "note",
        text: "Retries need idempotency: if you retry a request that actually succeeded but whose response was lost, you must not charge the card twice. This is why fault tolerance and idempotency always travel together.",
      },
    ],
    tradeoffs: {
      good: [
        "The system survives partial failures instead of collapsing entirely.",
        "Failures stay contained rather than cascading across services.",
        "Automatic recovery reduces middle-of-the-night pages.",
        "Users see degraded service, not an outage.",
      ],
      costs: [
        "Every fallback and failure path is more code to write, test, and maintain.",
        "Retries can amplify load and cause cascading failure if unbounded.",
        "Testing failure modes is hard — you must inject faults deliberately.",
        "More complexity means more subtle ways to be wrong.",
      ],
    },
    realWorld:
      "Netflix popularized this with libraries like Hystrix and its Chaos Monkey, which kills production instances on purpose to prove the system survives. Service meshes and resilience libraries (Resilience4j, Polly) bake in retries, timeouts, and circuit breakers so every service call assumes failure is normal.",
    related: [
      {
        slug: "failure-retries-timeouts",
        note: "The core tactics — the how-to of tolerating faults.",
      },
      {
        slug: "high-availability",
        note: "The infrastructure side of staying up through failures.",
      },
      {
        slug: "idempotency",
        note: "What makes retries safe rather than dangerous.",
      },
      {
        slug: "microservices",
        note: "Where circuit breakers and bulkheads matter most — many calls across the network.",
      },
      {
        slug: "message-queues",
        note: "Decoupling via queues contains failures so they don't cascade.",
      },
    ],
  },
];
