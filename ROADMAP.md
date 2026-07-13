# SE-Map — Content Roadmap

Two kinds of content:

- **Flows** — end-to-end stories you follow stop by stop (like the web request).
  They teach how the pieces connect.
- **Topic deep-dives** — one concept per page, always answering the same seven
  questions (where it fits, what happens, why it exists, how it works, in/out,
  the tradeoff, what connects to it). These are the nodes of the map. Flows link
  down into them; topics link across to each other.

The list below is the *whole map* on purpose — seeing the big scope is the point
of the site. But we build it in phases, smallest-complete-thing first.
**Content quality is the real constraint, not topic count.** A strong, fully
interlinked vertical slice of ~15 pages is already a real product; the full map
is a long-term destination, not a launch requirement.

---

## Flows (the stories)

1. **A web request, end to end** — DONE. What happens when you type a URL.
2. **What happens when you log in** — where your password goes, how you stay
   logged in.
3. **Saving data when two people edit at once** — the classic lost-update bug
   and how transactions/locks fix it.
4. **Why the site got slow at scale** — the "watch it grow" story: one server at
   100 users, what breaks at 100,000, and each fix in turn.
5. **From your laptop to production** — how code becomes a running, live service.
6. **A chat message, delivered in real time** — real-time delivery and fan-out.
7. **A search query returns results** — how search finds and ranks matches.

---

## Topic deep-dives, by district

### 1. The Network — how bytes move
- DNS
- TCP vs UDP
- TLS / HTTPS & certificates
- HTTP methods & status codes
- HTTP/2 & HTTP/3
- CDN
- WebSockets

### 2. The Backend — handling a request
- What a server actually does (request lifecycle)
- REST APIs
- Reverse proxy & load balancing
- Health checks & horizontal scaling
- gRPC & GraphQL (the alternatives, and when)
- Rate limiting

### 3. Data — storing and retrieving
- Tables, rows & SQL basics
- Indexes
- Transactions & ACID
- Locks & isolation levels
- Normalization
- SQL vs NoSQL
- Replication & sharding

### 4. Speed — making it fast
- Caching: why and where
- Redis
- Cache invalidation & staleness
- The N+1 query problem
- Latency vs throughput
- Compression

### 5. Async & Concurrency
- Synchronous vs asynchronous
- Message queues (Kafka / RabbitMQ)
- Background workers
- Race conditions
- Mutexes & locks
- Deadlocks

### 6. Identity & Security
- Authentication vs authorization
- Sessions & cookies
- JWT
- OAuth / OpenID Connect
- Password hashing (bcrypt / argon2)
- Common attacks (SQL injection, XSS, CSRF)

### 7. Design & Code Quality
- SOLID principles
- Design patterns (the useful few)
- Clean code & naming
- Coupling & cohesion
- Monolith vs microservices

### 8. Shipping — code to production
- The Git model (branch / merge / rebase)
- The testing pyramid (unit / integration / e2e)
- CI/CD
- Containers & Docker
- Environments & configuration
- Observability (logs, metrics, traces)

### 9. Scaling & Distributed Systems
- Vertical vs horizontal scaling
- Statelessness
- Consistency models & CAP
- Eventual consistency
- Idempotency
- Failure, retries & timeouts

### 10. Foundations — the CS underneath
- Core data structures (array, map, tree, graph, heap)
- Big-O notation
- Memory: stack vs heap
- Processes vs threads

---

## Recommended build order

### Phase 1 — Complete the first vertical slice ← start here
Turn the 9 stops of the web-request flow into real, linked deep-dive pages.
Proves the flow → topic → related-topic navigation loop end to end.
- DNS · TCP · TLS/HTTPS · HTTP methods & status codes · Load balancing ·
  SQL & indexes · Caching/Redis · Browser render
- ~8 topic pages (introduces MDX) + the flow (done)

### Phase 2 — Second flow: "What happens when you log in"
- Flow + deep dives: auth vs authz · sessions & cookies · JWT ·
  password hashing · OAuth
- Introduces the Identity district

### Phase 3 — Story mode: "Why the site got slow at scale"
- The evolution flow + deep dives: caching · load balancing · queues & workers ·
  replication · horizontal scaling
- This is the signature "watch it grow" feature

### Phase 4+ — Fill the remaining districts
Data internals → Concurrency → Security → Design → Shipping →
Distributed systems → Foundations, roughly in that order of leverage.

### Later — The knowledge graph view
Once there are ~20+ nodes worth connecting, add the zoomable map (React Flow)
that shows all topics and their prerequisites/relationships.

---

## Rough scope

~7 flows + ~55 topic pages ≈ 60 pieces of content for the *full* map.
We do not need all of it to launch. Phases 1–3 (~20 pages, 3 flows) make a
genuinely useful, coherent product.
