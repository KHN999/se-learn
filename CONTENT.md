# SE-Map — Detailed Content Spec

Three zoom levels, like a real map:

- **Area** — a district of the map (~15 of them).
- **Topic** — one deep-dive *page*. Each answers the same 7 questions. This is a
  node in the graph. (~150 pages total for the full map.)
- **Concept** — the sections *inside* a page (the bullets after each topic).

Ordered along the practical learning path (foundations first, distributed
systems last). This is the **territory map / table of contents**, NOT the build
queue — see ROADMAP.md for the phased build order. We still build a vertical
slice first; this is the destination.

Legend: ✅ built · ◻ planned page

---

## Area 1 — Programming Fundamentals

- ◻ **Variables & types** — what a variable is, primitive vs reference types, mutability, scope
- ◻ **Control flow** — conditionals, for/while loops, break/continue
- ◻ **Functions** — parameters, return values, pure vs side effects, scope/closures
- ◻ **Classes & objects** — fields, methods, constructors, instances, `this`
- ◻ **Error handling** — exceptions, try/catch/finally, propagation, fail fast
- ◻ **Collections** — List/Array, Map/Dictionary, Set — when to use each
- ◻ **File I/O** — reading/writing, streams, buffers, text vs binary

## Area 2 — Data Structures

- ◻ **Array** — contiguous memory, O(1) index, O(n) insert/delete
- ◻ **Linked list** — nodes & pointers, singly/doubly, vs array
- ◻ **Stack** — LIFO, push/pop, the call stack
- ◻ **Queue** — FIFO, enqueue/dequeue, deque
- ◻ **Hash map** — hashing, buckets, collisions, load factor, O(1) average
- ◻ **Tree** — binary tree, BST, balancing, traversals
- ◻ **Heap** — priority queue, min/max heap, heapify
- ◻ **Graph** — nodes & edges, directed/undirected, adjacency list vs matrix

## Area 3 — Algorithms

- ◻ **Searching** — linear vs binary search
- ◻ **Sorting** — bubble/insertion (teaching), merge/quick, when it matters
- ◻ **Recursion** — base case, call stack, recursion vs iteration
- ◻ **Dynamic programming (basic)** — overlapping subproblems, memoization
- ◻ **Greedy algorithms** — local vs global optimum, when greedy is safe

## Area 4 — Complexity (Big-O)

- ◻ **Big-O notation** — what it measures, why we drop constants
- ◻ **The common classes** — O(1), O(log n), O(n), O(n log n), O(n²) with real examples
- ◻ **Time vs space** — trading memory for speed

## Area 5 — Computer Science Fundamentals

- ◻ **Stack vs heap memory** — where `int a = 5` lives vs `new User()`, lifetimes
- ◻ **Pointers & references** — what a reference really is, aliasing
- ◻ **Garbage collection** — automatic vs manual memory, leaks
- ◻ **Process vs thread** — address space, what is shared
- ◻ **Context switching** — its cost, why too many threads hurt
- ◻ **Single vs multi-threaded** — concurrency vs parallelism
- ◻ **OS: scheduling** — how the CPU is shared
- ◻ **OS: virtual memory** — paging, the illusion of infinite RAM
- ◻ **OS: file systems & permissions** — files, inodes, read/write/execute
- ◻ **OS: locking & synchronization** — mutexes at the OS level

## Area 6 — Git & Version Control

- ◻ **The Git model** — commits as snapshots, the commit graph
- ◻ **Everyday flow** — clone, add, commit, push, pull
- ◻ **Branching & merging** — branches, merge, fast-forward
- ◻ **Rebase** — replaying commits, rebase vs merge
- ◻ **Conflict resolution** — what a conflict is, how to resolve it
- ◻ **Pull requests & code review** — the collaboration loop

## Area 7 — Databases: SQL

- ◻ **Tables, rows & schema** — the relational model
- ◻ **SELECT & WHERE & ORDER BY** — reading data
- ◻ **INSERT / UPDATE / DELETE** — writing data
- ◻ **JOINs** — inner/left/right, why relationships exist
- ◻ **GROUP BY & aggregates** — counting and summarizing
- ◻ **Foreign keys & relationships** — integrity between tables

## Area 8 — Databases: Internals

- ◻ **Indexes** — B-tree, why fast, composite & covering indexes, cost on writes
- ◻ **Transactions & ACID** — atomicity, consistency, isolation, durability
- ◻ **Locks** — row vs table, shared vs exclusive
- ◻ **Isolation levels** — read committed, repeatable read, serializable, the anomalies
- ◻ **Normalization** — 1NF/2NF/3NF and the denormalization tradeoff
- ◻ **Query planning** — how the DB chooses, reading EXPLAIN

## Area 9 — Databases: NoSQL & alternatives

- ◻ **SQL vs NoSQL** — when relational isn't the right fit
- ◻ **MongoDB (document)** — shape and when to reach for it
- ◻ **Redis (key-value / cache)** — in-memory speed, when to use
- ◻ **Elasticsearch (search)** — full-text search and when

## Area 10 — The Web & Networking

- ◻ **HTTP request/response** — the fundamental exchange
- ◻ **HTTP methods** — GET/POST/PUT/PATCH/DELETE, idempotency
- ◻ **Status codes** — 2xx/3xx/4xx/5xx families (200, 201, 400, 401, 403, 404, 500)
- ◻ **Headers & cookies** — metadata and how state is carried
- ◻ **DNS** — names to IP addresses (also stop 2 of the request flow)
- ◻ **TCP vs UDP** — reliable ordered vs fast and loose
- ◻ **TLS/SSL & HTTPS** — certificates, the handshake, trust
- ◻ **WebSockets** — real-time two-way vs polling
- ◻ **HTTP/2 & HTTP/3** — multiplexing, QUIC
- ✅ **Flow: what happens when you type a URL** — ties the above together

## Area 11 — APIs

- ◻ **REST** — resources, endpoints, JSON, statelessness
- ◻ **API authentication** — keys, bearer tokens
- ◻ **gRPC** — protobuf, when it beats REST
- ◻ **GraphQL** — over/under-fetching, when it helps
- ◻ **Rate limiting** — protecting an API from abuse

## Area 12 — Architecture

- ◻ **Monolith** — one deployable, the default start
- ◻ **Modular monolith** — boundaries without the network cost
- ◻ **Microservices** — the promise and the real tradeoffs
- ◻ **API gateway** — one front door for many services
- ◻ **Service discovery** — how services find each other
- ◻ **Load balancer & reverse proxy** — spreading and fronting traffic

## Area 13 — Software Design & Clean Code

- ◻ **OOP pillars** — encapsulation, inheritance, polymorphism, abstraction
- ◻ **Naming** — the cheapest big win in readability
- ◻ **Functions do one thing** — size, single responsibility in the small
- ◻ **DRY / avoid duplication** — and when duplication is actually fine
- ◻ **Coupling & cohesion** — the two forces behind most design advice
- ◻ **SOLID** — SRP, OCP, LSP, ISP, DIP, each as the problem it solves
- ◻ **Design patterns** — Factory, Singleton, Observer, Strategy, Repository, Adapter, Decorator

## Area 14 — Authentication & Identity

- ◻ **Authentication vs authorization** — who you are vs what you may do
- ◻ **Sessions & cookies** — server-side state
- ◻ **JWT** — access vs refresh tokens, stateless auth
- ◻ **OAuth & OpenID Connect** — logging in with someone else
- ◻ **Password hashing** — bcrypt/argon2, salts, never plaintext

## Area 15 — Security

- ◻ **OWASP Top 10** — the map of common risks
- ◻ **SQL injection** — and parameterized queries
- ◻ **XSS** — and output escaping
- ◻ **CSRF** — and tokens/SameSite
- ◻ **SSRF** — tricking the server into making requests
- ◻ **Broken authentication** — session and credential mistakes
- ◻ **Input validation** — never trust the client
- ◻ **Encryption** — at rest vs in transit
- ◻ **Rate limiting as defense** — throttling abuse

## Area 16 — Testing & Debugging

- ◻ **Why testing matters** — confidence to change code
- ◻ **Unit tests** — small, fast, isolated
- ◻ **Integration tests** — parts working together
- ◻ **End-to-end tests** — the whole system as a user
- ◻ **Mocking** — faking dependencies, and its dangers
- ◻ **Test coverage** — the number and its limits
- ◻ **Debugging: reading logs & stack traces** — following the trail
- ◻ **Debugging: breakpoints & profiling** — inspecting a live program

## Area 17 — Performance

- ◻ **Latency vs throughput** — speed vs volume
- ◻ **CPU & memory usage** — finding the bottleneck
- ◻ **Caching** — why and where (also a system-design topic)
- ◻ **Compression** — gzip/brotli
- ◻ **Connection pooling** — reusing expensive connections
- ◻ **N+1 queries** — the most common hidden slowdown

## Area 18 — Concurrency

- ◻ **Synchronous vs asynchronous** — blocking vs not, async/await
- ◻ **Race conditions** — when timing changes the answer
- ◻ **Mutex** — one at a time
- ◻ **Semaphore** — at most N at a time
- ◻ **Deadlock** — when everyone waits forever
- ◻ **Atomic operations** — indivisible steps
- ◻ **Thread pools** — reusing threads
- ◻ **Channels (Go)** — communicating instead of sharing

## Area 19 — System Design

- ◻ **Caching & CDN** — serving from close and fast
- ◻ **Message queues** — Kafka, RabbitMQ, decoupling work
- ◻ **Database replication** — copies for reads and safety
- ◻ **Sharding** — splitting data across machines
- ◻ **Load balancing** — spreading requests
- ◻ **High availability** — surviving failures
- ◻ **Scalability** — vertical vs horizontal
- ◻ **Fault tolerance** — degrading gracefully

## Area 20 — Distributed Systems

- ◻ **CAP theorem** — consistency, availability, partition tolerance
- ◻ **Consistency models** — strong vs eventual and in between
- ◻ **Eventual consistency** — living with lag
- ◻ **Idempotency** — safe to retry
- ◻ **Failure, retries & timeouts** — assuming things break
- ◻ **Consensus (basic)** — how machines agree (Raft idea)

## Area 21 — Cloud & DevOps

- ◻ **What the cloud is** — compute, storage, managed databases
- ◻ **Serverless** — functions without servers to manage
- ◻ **Cloud networking & IAM** — VPCs, permissions, least privilege
- ◻ **Docker & containers** — packaging an app with its environment
- ◻ **Docker Compose** — many containers together locally
- ◻ **CI/CD** — GitHub Actions, automated build/test/deploy
- ◻ **Kubernetes (basic)** — orchestrating containers at scale
- ◻ **Observability** — logs, metrics, traces

## Area 22 — Working as an Engineer

- ◻ **Agile / Scrum / Kanban** — how teams organize work
- ◻ **Sprints & story points** — planning and estimating
- ◻ **Technical debt & refactoring** — paying down shortcuts
- ◻ **Documentation** — writing for the next person
- ◻ **Soft skills** — questions, breaking down problems, communication, feedback
- ◻ **Domain knowledge** — why finance, healthcare, e-commerce each differ

---

## Flows that stitch areas together

1. ✅ A web request, end to end
2. ◻ What happens when you log in
3. ◻ Saving data when two people edit at once
4. ◻ Why the site got slow at scale
5. ◻ From your laptop to production
6. ◻ A chat message, delivered in real time
7. ◻ A search query returns results

---

## Totals (be honest)

~22 areas · ~150 topic pages · 7 flows. This is the *whole territory*.
Phases 1–3 in ROADMAP.md (~20 pages + 3 flows) are the launchable slice.
