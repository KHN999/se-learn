import type { TopicContent } from "@/lib/topics";

export const batchD: TopicContent[] = [
  {
    slug: "http-request-response",
    tagline:
      "The ask-and-answer format two machines use to exchange web content they've never met over.",
    problem:
      "Your browser needs the pricing page from a server it has never spoken to before. It can't just reach across and grab the file — the two programs run on different machines and need an agreed way to say 'here's exactly what I want' and 'here's what you get.' Without a shared format, every website would speak its own language and no single browser could read them all. What's the common protocol they all agree on?",
    demo: "http-exchange",
    how: [
      {
        type: "para",
        text: "HTTP is a text-based request/response protocol. The client sends one request; the server sends back exactly one response, and that exchange is complete. A request carries a method (like GET), a path (/pricing), headers (metadata), and an optional body. A response carries a status code, headers, and usually a body — the HTML, JSON, or image you asked for.",
      },
      {
        type: "code",
        code: "GET /pricing HTTP/1.1          ← request line: method + path\nHost: shop.example.com\nAccept: text/html               ← request headers (a GET has no body)\n\nHTTP/1.1 200 OK                 ← response: a status code\nContent-Type: text/html         ← response headers\n\n<h1>Pricing</h1> …             ← response body",
        caption: "A request is method + path + headers + optional body; a response is a status code + headers + body.",
      },
      {
        type: "para",
        text: "The defining trait is that HTTP is stateless: the server keeps no memory of your previous request. Each request must carry everything needed to serve it. That's what lets HTTP scale — any server in a pool can handle any request — but it's also why cookies and tokens exist, to stitch a series of independent requests into something that feels continuous.",
      },
      {
        type: "points",
        items: [
          "Request = method + path + headers + optional body.",
          "Response = status code + headers + optional body.",
          "One request produces exactly one response.",
          "Stateless by design: the server forgets you the instant a request ends.",
        ],
      },
      {
        type: "note",
        text: "HTTP is only the message format. It rides on top of a connection (usually TCP, secured by TLS). The words you send are HTTP; how the bytes actually travel is a lower layer's job.",
      },
    ],
    tradeoffs: {
      good: [
        "Universal — every language, browser, and tool speaks it.",
        "Human-readable, so requests and responses are easy to inspect and debug.",
        "Stateless design scales horizontally across many identical servers.",
        "A simple mental model: you ask, you receive.",
      ],
      costs: [
        "Statelessness means you re-send auth and context on every request.",
        "One-request-one-response is awkward when the server wants to push updates.",
        "Text framing adds per-request overhead (later versions compress it).",
        "No built-in memory, so sessions have to be bolted on with cookies or tokens.",
      ],
    },
    realWorld:
      "Every API call, page load, and image fetch is an HTTP request/response. Open your browser's Network tab and each row is one of these exchanges — understanding them is the single most useful skill for debugging why a page or app misbehaves.",
    related: [
      { slug: "http-methods", note: "The verb that says what a request wants done." },
      { slug: "status-codes", note: "The number that reports how the response went." },
      { slug: "headers-cookies", note: "The metadata carried on both request and response." },
      { slug: "tcp-vs-udp", note: "The connection HTTP actually rides on." },
      { slug: "rest", note: "An API style built directly on these exchanges." },
    ],
  },
  {
    slug: "http-methods",
    tagline:
      "The verb that says what you want done to a resource — read it, create it, replace it, or delete it.",
    problem:
      "A single URL like /users/42 could mean several things: show me this user, update them, or delete them. The path names the thing; something else has to say what to do with it. If every action needed its own separate URL, a simple API would sprawl into thousands of one-off endpoints. How do you express intent cleanly on top of a plain address?",
    demo: "http-verbs",
    how: [
      {
        type: "para",
        text: "HTTP methods (verbs) name the action to perform on the resource the URL identifies. GET /users/42 reads it; DELETE /users/42 removes it — same address, different intent. The common ones map neatly onto the basic data operations.",
      },
      {
        type: "code",
        code: "GET    /users/42     # read user 42        (safe, idempotent)\nPOST   /users        # create a new user   (neither safe nor idempotent)\nPUT    /users/42     # replace user 42     (idempotent)\nPATCH  /users/42     # update part of it\nDELETE /users/42     # remove user 42      (idempotent)\n\n# retrying a POST can create two users; retrying PUT/DELETE is harmless",
        caption: "Same resource, different verbs — and which are safe to retry after a flaky network.",
      },
      {
        type: "points",
        items: [
          "GET — read a resource, with no side effects.",
          "POST — create something or trigger an action (not safe, not idempotent).",
          "PUT — replace a resource wholesale (idempotent).",
          "PATCH — update part of a resource.",
          "DELETE — remove a resource (idempotent).",
        ],
      },
      {
        type: "para",
        text: "Two properties matter. A safe method (GET, HEAD) changes nothing, so it can be cached and retried freely. An idempotent method (GET, PUT, DELETE) gives the same result whether you call it once or five times — vital when a flaky network forces a retry. POST is neither, which is exactly why double-submitting a form can charge you twice.",
      },
      {
        type: "note",
        text: "These are conventions, not rules the wire enforces. Nothing stops a server from deleting data on a GET — but doing so breaks caches, crawlers, and every reasonable expectation. Respect the semantics.",
      },
    ],
    tradeoffs: {
      good: [
        "One URL can support several actions, keeping APIs small and predictable.",
        "Safe and idempotent semantics let clients cache and retry without fear.",
        "Maps cleanly onto create/read/update/delete.",
        "Understood by every browser, proxy, and cache in the chain.",
      ],
      costs: [
        "Semantics are conventions and are easy to violate.",
        "The create-vs-replace-vs-update split (POST/PUT/PATCH) confuses even experienced developers.",
        "Not every action fits a verb neatly — 'send email' or 'search' are awkward.",
        "Plain HTML forms only send GET and POST, so other methods need JavaScript.",
      ],
    },
    realWorld:
      "Every REST API is organized around these verbs. Idempotency is why a payment API asks you to use PUT with a client-generated key — so a retry after a timeout doesn't charge the card a second time.",
    related: [
      { slug: "http-request-response", note: "The method is one field of every request." },
      { slug: "rest", note: "Builds its entire design on these standard verbs." },
      { slug: "status-codes", note: "The response reports whether the action succeeded." },
      { slug: "idempotency", note: "Why safe retries depend on the method's guarantees." },
      { slug: "rate-limiting", note: "Write methods are often throttled harder than reads." },
    ],
  },
  {
    slug: "status-codes",
    tagline:
      "The three-digit number that tells the client, at a glance, how a request turned out.",
    problem:
      "A client fires off a request and gets back... something. Did it work? Was the page missing? Did the server crash, or was the client itself at fault? Reading the whole response body to figure that out is slow, and every app would parse it differently. There needs to be a single, standard signal for the outcome that any client can act on instantly.",
    demo: "status-codes",
    how: [
      {
        type: "para",
        text: "Every HTTP response begins with a three-digit status code. The first digit sorts it into a class, so a client can react correctly even without understanding the exact specifics.",
      },
      {
        type: "code",
        code: "2xx  success       200 OK   201 Created   204 No Content\n3xx  redirect      301 Moved Permanently   304 Not Modified\n4xx  client error  400 Bad Request  401 Unauthorized  404 Not Found  429 Too Many\n5xx  server error  500 Internal Error   502 Bad Gateway   503 Unavailable\n\n# 4xx = fix your request.   5xx = the server failed (a retry may help).",
        caption: "The first digit is the class — that alone drives caching, redirects, and retry logic.",
      },
      {
        type: "points",
        items: [
          "2xx success — 200 OK, 201 Created, 204 No Content.",
          "3xx redirection — 301 Moved Permanently, 304 Not Modified.",
          "4xx client error — 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests.",
          "5xx server error — 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.",
        ],
      },
      {
        type: "para",
        text: "The 4xx-versus-5xx split is the one to internalize: 4xx means the request was wrong (fix the request), 5xx means the server failed (a retry might help, or it's their bug). Confusing the two — returning 200 for an error, or 500 for bad input — is a common source of misleading dashboards and broken retry logic.",
      },
      {
        type: "note",
        text: "The status line is a summary, not the whole story. Well-designed APIs also return a body explaining the error, but the code is what monitoring, caches, and retry logic act on automatically.",
      },
    ],
    tradeoffs: {
      good: [
        "An instant, standard outcome signal every client understands.",
        "The class (first digit) lets clients handle whole categories generically.",
        "Drives caching (304), redirects (301), and retry logic (429/503) for free.",
        "Makes monitoring simple — count the 5xx rate.",
      ],
      costs: [
        "Easy to misuse: returning 200 on failure hides real errors.",
        "The exact code for a situation is often debatable (401 vs 403, 400 vs 422).",
        "A code alone rarely says why — you still need a body or logs.",
        "Some codes are widely misunderstood or simply ignored.",
      ],
    },
    realWorld:
      "Dashboards, alerts, and log searches are built around these numbers. A spike in 500s pages the on-call engineer; a wall of 404s means a broken link or a bad deploy. Returning the right code is what makes your service debuggable by everyone downstream.",
    related: [
      { slug: "http-request-response", note: "The code leads off every response." },
      { slug: "headers-cookies", note: "Travel alongside the status in the response." },
      { slug: "rate-limiting", note: "429 is the code it uses to say 'slow down.'" },
      { slug: "failure-retries-timeouts", note: "Which codes are safe to retry on." },
      { slug: "rest", note: "Proper status codes are part of good REST design." },
    ],
  },
  {
    slug: "headers-cookies",
    tagline:
      "The metadata carried alongside every request and response — including the trick that lets a stateless protocol remember you.",
    problem:
      "HTTP forgets you the instant a request ends, so how does a site keep you logged in across dozens of page loads? And how does a request say 'I can read JSON, I speak English, here's my auth token' without cramming all of that into the URL? The body carries the content; something else has to carry the context and the memory.",
    demo: "cookies",
    how: [
      {
        type: "para",
        text: "Headers are key-value lines attached to every request and response, carrying metadata the body doesn't. Requests send things like Authorization (your token), Accept (formats you understand), and Content-Type. Responses send Content-Type, Cache-Control (how long to cache), and Set-Cookie.",
      },
      {
        type: "para",
        text: "A cookie is how the server plants a small piece of state in your browser to work around HTTP's forgetfulness. The server replies with Set-Cookie: session=abc; the browser stores it and automatically attaches Cookie: session=abc to every later request to that site. That thread of identity across requests is what a login session actually is.",
      },
      {
        type: "code",
        code: "# response — the server plants the cookie once\nHTTP/1.1 200 OK\nSet-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax\n\n# every later request — the browser attaches it automatically\nGET /account HTTP/1.1\nCookie: session=abc123          ← this thread of identity IS the login session",
        caption: "Set-Cookie plants it; the browser auto-sends Cookie on every later request to that site.",
      },
      {
        type: "points",
        items: [
          "Request headers describe the client and what it wants.",
          "Response headers describe the content and how to treat it.",
          "Set-Cookie (response) plus Cookie (request) create continuity across requests.",
          "Flags like HttpOnly, Secure, and SameSite harden cookies against theft and abuse.",
        ],
      },
      {
        type: "note",
        text: "Because cookies ride on every request automatically, they're the vector for CSRF attacks — and HttpOnly (JavaScript can't read it) plus SameSite (not sent cross-site) are the standard defenses.",
      },
    ],
    tradeoffs: {
      good: [
        "Carry context cleanly, keeping URLs and bodies focused on content.",
        "Cookies turn stateless HTTP into stateful sessions transparently.",
        "Drive caching, content negotiation, and compression.",
        "Security flags give fine-grained control over cookie exposure.",
      ],
      costs: [
        "Cookies auto-sent on every request add overhead and enable CSRF if unguarded.",
        "Headers are easy to get subtly wrong — CORS, caching, and content-type bugs are notorious.",
        "Cookies have size limits and carry privacy and consent implications.",
        "Sensitive data in headers or cookies can leak through logs or insecure transport.",
      ],
    },
    realWorld:
      "Almost every auth system, cache strategy, and CORS error you'll debug lives in the headers. When 'I'm logged in on one page but not the next' or a CORS block appears, the headers section of the Network tab is where you look first.",
    related: [
      { slug: "http-request-response", note: "Headers are part of both halves of the exchange." },
      { slug: "sessions-cookies", note: "The login pattern built on top of cookies." },
      { slug: "api-auth", note: "The Authorization header carries API credentials." },
      { slug: "csrf", note: "The attack that auto-sent cookies make possible." },
      { slug: "caching-perf", note: "Cache-Control headers are what drive it." },
    ],
  },
  {
    slug: "dns",
    tagline:
      "The internet's phone book — turning a name people can remember into an address routers can actually reach.",
    problem:
      "You type example.com. But the network doesn't route to names — it routes to numeric IP addresses like 93.184.216.34. Nobody can memorize a number for every site they visit, and those numbers change when a site moves servers. Something has to translate the name into a current address, fast, billions of times a day. That something is DNS.",
    demo: "dns-resolve",
    how: [
      {
        type: "para",
        text: "DNS is a distributed, hierarchical lookup system. When you request example.com, your machine asks a resolver (often your ISP's, or one like 1.1.1.1). If the resolver doesn't have the answer cached, it walks the hierarchy: root servers point it to the .com servers, which point it to example.com's authoritative server, which finally returns the IP.",
      },
      {
        type: "para",
        text: "Answers are cached at every level for a duration set by the domain's TTL (time to live). That's why the first lookup takes tens of milliseconds and the next is instant — but it's also why changing where a domain points takes hours to spread, as old cached answers slowly expire.",
      },
      {
        type: "points",
        items: [
          "Hierarchy: root, then TLD (.com), then the domain's authoritative server.",
          "The resolver does the walking and caches the result.",
          "TTL controls how long an answer is trusted before it's re-checked.",
          "Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification).",
        ],
      },
      {
        type: "code",
        code: "$ dig shop.example.com\n\n;; QUESTION    shop.example.com   A\n;; ANSWER      shop.example.com   A   93.184.216.34   (TTL 300)\n\n# record types:  A → IPv4   AAAA → IPv6   CNAME → alias   MX → mail   TXT → verify",
        caption: "A lookup returns an address and a TTL — how long the answer may be cached before re-checking.",
      },
      {
        type: "note",
        text: "DNS is the very first network step of loading a page — nothing else can happen until the name resolves. It's also a frequent outage cause: 'it's always DNS' is a running joke among engineers for a reason.",
      },
    ],
    tradeoffs: {
      good: [
        "Human-friendly names instead of memorizing raw IP addresses.",
        "Caching plus hierarchy make it fast and massively scalable.",
        "Decouples name from address, so you can move servers without renaming.",
        "Enables load balancing and CDN routing by returning different IPs.",
      ],
      costs: [
        "TTL caching means changes propagate slowly across the world.",
        "A classic outage source, and painful to debug when stale answers linger.",
        "Plain DNS is unencrypted and spoofable (mitigated by DNSSEC and DNS-over-HTTPS).",
        "Adds an extra round trip before the real request can even begin.",
      ],
    },
    realWorld:
      "DNS is the first stop when you type a URL, and 'is it DNS?' is one of the first questions in any outage. Configuring records is also how you point a domain at a new host, set up email, or prove ownership of a site.",
    related: [
      { slug: "http-request-response", note: "DNS resolves the host before the request is sent." },
      { slug: "tcp-vs-udp", note: "DNS traditionally runs over UDP for speed." },
      { slug: "caching-cdn", note: "DNS often routes you to the nearest edge server." },
      { slug: "load-balancing", note: "DNS can hand out different IPs to spread load." },
      { slug: "tls-https", note: "Comes right after, once you have the IP." },
    ],
  },
  {
    slug: "tcp-vs-udp",
    tagline:
      "Two ways to send data over a network — one reliable and ordered, one fast and best-effort.",
    problem:
      "The network can lose packets, deliver them out of order, or duplicate them. If you're loading a web page, a single missing byte corrupts it — you need every byte, in order. But on a video call, waiting to re-send a packet lost half a second ago is worse than just skipping it. No single transport is ideal for both, so there are two.",
    demo: "tcp-udp",
    how: [
      {
        type: "para",
        text: "TCP and UDP both sit on top of IP and both use ports to reach the right program. The difference is what they guarantee. TCP is a connection: it does a handshake, numbers every byte, acknowledges what arrived, re-sends what was lost, and delivers everything in order. UDP just fires off independent packets (datagrams) with no handshake, no acknowledgments, and no ordering — fast, but best-effort.",
      },
      {
        type: "points",
        items: [
          "TCP — reliable, ordered, connection-based; costs a handshake and re-send delay.",
          "UDP — unreliable, unordered, connectionless; no setup, no waiting.",
          "TCP fits when every byte must arrive: web, email, file transfer.",
          "UDP fits when timeliness beats completeness: voice, video, gaming, DNS.",
        ],
      },
      {
        type: "code",
        code: "TCP   handshake: SYN → SYN-ACK → ACK    then: numbered · acked · re-sent · in order\nUDP   (no handshake)                    just: fire datagrams, best-effort\n\n# TCP → web, email, file transfer   (every byte must arrive)\n# UDP → voice, video, games, DNS     (timeliness beats completeness)",
        caption: "TCP sets up a reliable, ordered stream; UDP just sends independent datagrams.",
      },
      {
        type: "para",
        text: "TCP's guarantees aren't free: the handshake adds a round trip before any data flows, and its wait-and-re-send behavior causes head-of-line blocking — one lost packet stalls everything queued behind it. That exact drawback is why HTTP/3 moved off TCP onto a UDP-based protocol called QUIC.",
      },
      {
        type: "note",
        text: "'Reliable' versus 'unreliable' is about delivery guarantees, not quality. UDP isn't broken — for real-time media, dropping a stale packet is precisely the correct behavior.",
      },
    ],
    tradeoffs: {
      good: [
        "TCP guarantees complete, in-order delivery, so apps don't handle loss.",
        "UDP has no setup cost and the lowest possible latency.",
        "UDP lets the application define its own reliability rules when it needs them.",
        "Both use ports to run many connections on one machine at once.",
      ],
      costs: [
        "TCP's handshake and re-transmission add latency.",
        "TCP head-of-line blocking stalls a whole stream on one lost packet.",
        "UDP gives you nothing for free — reliability is your problem if you need it.",
        "UDP is easier to spoof and abuse for amplification attacks.",
      ],
    },
    realWorld:
      "Almost all web traffic runs over TCP (HTTP/1 and HTTP/2), while calls, live video, and games use UDP. HTTP/3's switch to QUIC-over-UDP is the biggest recent shift — chosen specifically to escape TCP's head-of-line blocking.",
    related: [
      { slug: "http-request-response", note: "HTTP rides on top of a TCP connection." },
      { slug: "tls-https", note: "TLS handshakes on top of the TCP connection." },
      { slug: "http2-http3", note: "HTTP/3 abandons TCP for UDP-based QUIC." },
      { slug: "dns", note: "A classic example of a UDP user." },
      { slug: "latency-vs-throughput", note: "The tradeoff these two transports embody." },
    ],
  },
  {
    slug: "tls-https",
    tagline:
      "The encryption layer that turns plain HTTP into HTTPS — private, tamper-proof, and sure who you're talking to.",
    problem:
      "Plain HTTP sends everything as readable text across a chain of networks you don't control — your router, your ISP, every hop in between. Anyone on that path can read your password, see the page, or quietly alter the response to inject ads or malware. And you have no proof the server that answered is really the one you asked for. How do you get privacy and authenticity over an untrusted network?",
    demo: "tls-handshake",
    how: [
      {
        type: "para",
        text: "TLS wraps the connection in encryption before any HTTP is sent — HTTPS is simply HTTP running inside a TLS tunnel. When you connect, client and server perform a TLS handshake: they agree on a cipher, and the server presents a certificate proving its identity, signed by a Certificate Authority your browser already trusts.",
      },
      {
        type: "para",
        text: "The handshake uses asymmetric cryptography (a public/private key pair) just long enough to securely agree on a shared symmetric key, then switches to that faster symmetric key for the actual data. This delivers three things at once: confidentiality (eavesdroppers see gibberish), integrity (tampering is detected), and authentication (the certificate proves the server is who it claims).",
      },
      {
        type: "points",
        items: [
          "The certificate and its CA chain prove the server's identity.",
          "The handshake negotiates keys before any data flows.",
          "Asymmetric crypto exchanges the key; fast symmetric crypto protects the data after.",
          "The padlock means encrypted and authenticated — not 'this site is honest.'",
        ],
      },
      {
        type: "code",
        code: "Client → ClientHello         (supported ciphers + a random)\nServer → ServerHello + Certificate  (public key, signed by a trusted CA)\nClient → verifies the cert, agrees a shared secret  (asymmetric crypto)\nboth   → derive one symmetric session key\n──────── from here on: fast symmetric encryption ────────\nClient ⇄ Server: encrypted HTTP   (confidential · tamper-proof · authenticated)",
        caption: "Asymmetric crypto verifies identity and agrees a key; fast symmetric crypto protects the data after.",
      },
      {
        type: "note",
        text: "The handshake costs a round trip or two on top of TCP, which is part of why connections feel slow to set up — and why TLS 1.3 and HTTP/3 work so hard to cut that setup time.",
      },
    ],
    tradeoffs: {
      good: [
        "Eavesdroppers on the network can't read the traffic.",
        "Any tampering in transit is detected and rejected.",
        "Certificates authenticate the server, blocking impersonation.",
        "Now effectively free and expected (Let's Encrypt, browser warnings on plain HTTP).",
      ],
      costs: [
        "The handshake adds latency to connection setup.",
        "Certificate management — issuance, renewal, expiry — is real operational work.",
        "Only secures data in transit, not at rest or inside the app.",
        "The padlock proves encryption, not trustworthiness — phishing sites have valid certs too.",
      ],
    },
    realWorld:
      "Every https:// URL and every expired-certificate browser warning is TLS at work. Setting up certificates, renewing them before they lapse, and terminating TLS at a load balancer are routine tasks — an expired cert taking down a site is a classic and entirely avoidable incident.",
    related: [
      { slug: "http-request-response", note: "TLS wraps the whole HTTP exchange." },
      { slug: "tcp-vs-udp", note: "TLS handshakes on top of the TCP connection." },
      { slug: "dns", note: "Resolves the host just before TLS begins." },
      { slug: "encryption", note: "The cryptography TLS is built on." },
      { slug: "http2-http3", note: "Newer versions cut TLS setup cost." },
    ],
  },
  {
    slug: "websockets",
    tagline:
      "A persistent two-way channel so the server can push data the instant it happens, not only when asked.",
    problem:
      "A chat app needs new messages to appear the moment someone sends one. But with plain HTTP the server can only answer requests — it can't speak first. So the client is stuck asking 'anything new?' every second (polling), which is wasteful, laggy, and hammers the server. How do you let the server push updates the instant they happen?",
    demo: "ws-push",
    how: [
      {
        type: "para",
        text: "A WebSocket starts as an ordinary HTTP request carrying an 'Upgrade' header. If the server agrees, the same TCP connection is switched from request/response to a persistent, full-duplex channel: both sides can send messages at any time, in either direction, until one of them closes it.",
      },
      {
        type: "para",
        text: "After the upgrade there's no more request/response overhead — no re-sending headers, no new connection per message. Either side simply writes a message whenever it has one. That's what makes live, low-latency, bidirectional features practical.",
      },
      {
        type: "points",
        items: [
          "Begins with an HTTP handshake, then upgrades the connection.",
          "Full-duplex — client and server can both send at will.",
          "The connection stays open, so there's no per-message setup cost.",
          "Ideal for chat, live feeds, multiplayer, collaborative editing, and notifications.",
        ],
      },
      {
        type: "code",
        code: "GET /chat HTTP/1.1\nUpgrade: websocket             ← starts as an ordinary HTTP request…\nConnection: Upgrade\n\nHTTP/1.1 101 Switching Protocols   ← …then the connection is upgraded\n\n# now either side sends messages any time, over the SAME open connection:\nserver → { \"msg\": \"Ada joined\" }\nclient → { \"msg\": \"hello!\" }",
        caption: "An HTTP Upgrade turns one connection into a persistent, two-way channel.",
      },
      {
        type: "note",
        text: "A long-lived connection is also a cost: the server holds open state for every connected client, which complicates load balancing and scaling compared to stateless HTTP. Handling reconnection after a drop is your responsibility.",
      },
    ],
    tradeoffs: {
      good: [
        "True real-time, server-initiated push with minimal latency.",
        "No polling waste — data flows only when there's something to send.",
        "Low per-message overhead once the connection is open.",
        "Full-duplex fits interactive, collaborative applications.",
      ],
      costs: [
        "Every open connection consumes server memory and state, complicating scale.",
        "Stateful connections don't fit the stateless load-balancing model well.",
        "You must handle reconnection, back-off, and missed-message recovery yourself.",
        "Overkill when simple polling or server-sent events would do the job.",
      ],
    },
    realWorld:
      "Chat, live dashboards, collaborative editors, trading tickers, and multiplayer games use WebSockets. When you see updates arrive without a page refresh, it's often a WebSocket — or its lighter, one-way cousin, server-sent events.",
    related: [
      { slug: "http-request-response", note: "The model WebSockets exist to escape." },
      { slug: "tcp-vs-udp", note: "Rides on the same long-lived TCP connection." },
      { slug: "http2-http3", note: "Also tackle multiplexing and server-initiated data." },
      { slug: "load-balancing", note: "Long-lived connections make it harder." },
      { slug: "headers-cookies", note: "The Upgrade handshake and auth ride on headers." },
    ],
  },
  {
    slug: "http2-http3",
    tagline:
      "Newer HTTP versions that fix the slowness of sending many resources over one old-style connection.",
    problem:
      "A modern page pulls in a hundred files — scripts, styles, images. Under HTTP/1.1 each connection handles one request at a time, so browsers open several connections and still queue requests, and a single slow response blocks everything behind it (head-of-line blocking). Re-sending nearly identical headers on every request wastes bandwidth too. How do you move many resources over one connection without them getting in each other's way?",
    demo: "multiplexing",
    how: [
      {
        type: "para",
        text: "HTTP/2 keeps the same methods, status codes, and headers but changes how they travel. It multiplexes many requests over a single connection as independent streams, so responses can arrive interleaved and out of order — no more queuing. It also compresses headers and can push resources it knows the client will need.",
      },
      {
        type: "para",
        text: "HTTP/2 still runs on TCP, so one lost packet still stalls every stream (TCP-level head-of-line blocking). HTTP/3 fixes this by moving to QUIC, a new transport built on UDP: streams are independent all the way down, so a lost packet only stalls its own stream. QUIC also folds the TLS handshake into connection setup, cutting round trips.",
      },
      {
        type: "points",
        items: [
          "HTTP/2 — multiplexed streams on one connection, header compression, still on TCP.",
          "HTTP/3 — the same ideas over QUIC/UDP, so no TCP-level head-of-line blocking.",
          "QUIC merges transport and TLS setup, so connections start faster.",
          "All three keep identical HTTP semantics — methods, status codes, headers are unchanged.",
        ],
      },
      {
        type: "code",
        code: "HTTP/1.1  one request at a time per connection   → head-of-line blocking\nHTTP/2    many streams multiplexed over ONE TCP connection + header compression\n          (but one lost TCP packet still stalls every stream)\nHTTP/3    the same streams over QUIC/UDP → a lost packet stalls only its own stream\n\n# identical HTTP semantics (methods, status codes, headers) across all three",
        caption: "Same HTTP, different transport — each version removes more head-of-line blocking.",
      },
      {
        type: "note",
        text: "The application-level model — a request, a response, a status code — is identical across all three versions. Only how the bytes travel changes, which is why you can upgrade transparently without touching app code.",
      },
    ],
    tradeoffs: {
      good: [
        "Many resources share one connection without blocking each other.",
        "Header compression cuts repeated overhead.",
        "HTTP/3 removes TCP head-of-line blocking and starts connections faster.",
        "Same HTTP semantics, so apps upgrade without code changes.",
      ],
      costs: [
        "HTTP/2's TCP head-of-line blocking persisted until HTTP/3 arrived.",
        "QUIC/UDP is newer, and some networks and firewalls handle it poorly.",
        "More complex to implement and debug than plain HTTP/1.1.",
        "The gains are mostly at the transport layer — app code sees little difference.",
      ],
    },
    realWorld:
      "Most major sites serve HTTP/2 or HTTP/3 today, and your browser negotiates the version automatically during the handshake. You'll mainly meet these as a performance setting on a CDN or load balancer, and in the 'Protocol' column of the Network tab.",
    related: [
      { slug: "http-request-response", note: "The semantics these versions preserve." },
      { slug: "tcp-vs-udp", note: "HTTP/3 abandons TCP for UDP-based QUIC." },
      { slug: "tls-https", note: "HTTP/3 folds the TLS handshake into setup." },
      { slug: "websockets", note: "Another answer to HTTP/1's request/response limits." },
      { slug: "caching-cdn", note: "Where you usually turn these on." },
    ],
  },
  {
    slug: "rest",
    tagline:
      "A convention for designing web APIs around resources and standard HTTP verbs, so they're predictable without a manual.",
    problem:
      "Two teams build APIs. One has endpoints like /getUserData, /updateUserInfo, and /removeAccount — each named differently, each with its own quirks. Every new endpoint is a thing you must look up. Multiply that across a company and nothing is guessable. Is there a consistent way to structure an API so that once you know the pattern, you can predict the rest?",
    demo: "rest-resource",
    how: [
      {
        type: "para",
        text: "REST organizes an API around resources (nouns) identified by URLs, and uses HTTP's own verbs to act on them. Instead of inventing a verb per action, you point a standard method at a resource: GET /users/42 reads it, DELETE /users/42 removes it, POST /users creates one. The URL says what; the method says how.",
      },
      {
        type: "code",
        code: "GET    /users/42        → 200  read one user\nPOST   /users           → 201  created a new user\nPATCH  /users/42        → 200  updated some fields\nDELETE /users/42        → 204  removed it\nGET    /users/42/orders → 200  that user's orders",
        caption: "The URL names the resource (a noun); the method is the verb; the status code is the outcome.",
      },
      {
        type: "points",
        items: [
          "Resources are nouns in the URL (/orders/42), not actions.",
          "HTTP methods supply the verb (GET/POST/PUT/PATCH/DELETE).",
          "Status codes report the outcome.",
          "Stateless — each request carries its own auth and context.",
          "Data is usually exchanged as JSON.",
        ],
      },
      {
        type: "para",
        text: "Because it leans on HTTP's existing semantics, a REST API is largely predictable: knowing the resource and the method, you can guess the call. It also inherits HTTP's caching, and its statelessness means any server in a pool can handle any request.",
      },
      {
        type: "demo",
        demo: "rest-resource",
      },
      {
        type: "note",
        text: "'REST' is used loosely. Strict REST (as Roy Fielding defined it) includes constraints like HATEOAS that almost nobody fully implements; in practice 'REST API' usually just means resource URLs plus HTTP verbs plus JSON.",
      },
    ],
    tradeoffs: {
      good: [
        "Predictable and self-consistent once you know the pattern.",
        "Reuses HTTP caching, methods, and status codes rather than reinventing them.",
        "Stateless design scales horizontally.",
        "Language-agnostic, with tooling available everywhere.",
      ],
      costs: [
        "Fetching related data often takes several round trips (over- and under-fetching).",
        "No single strict standard, so 'RESTful' APIs vary widely in quality.",
        "Mapping every action onto a noun and verb is awkward for some operations.",
        "JSON over HTTP is heavier than a binary protocol like gRPC.",
      ],
    },
    realWorld:
      "REST is the default for public and internal web APIs — the style behind most 'we have an API' offerings. Most day-to-day API work is calling or building REST endpoints, and its limits are exactly what GraphQL and gRPC were created to address.",
    related: [
      { slug: "http-methods", note: "The verbs REST is built around." },
      { slug: "status-codes", note: "How REST reports outcomes." },
      { slug: "http-request-response", note: "The exchange REST gives structure to." },
      { slug: "graphql", note: "The alternative aimed at over- and under-fetching." },
      { slug: "api-auth", note: "How REST endpoints are secured." },
    ],
  },
  {
    slug: "api-auth",
    tagline:
      "How a server knows which client is calling and whether to trust it — without a login form on every request.",
    problem:
      "Your API sits on the public internet, so anyone can send it a request. But only the right users should read their own data, and only your own app should hit certain endpoints. There's no browser login screen for a program calling an API — so how does each request prove who it is and that it's allowed, given HTTP forgets you after every call?",
    demo: "api-auth",
    how: [
      {
        type: "para",
        text: "Because HTTP is stateless, every API request must carry its own proof of identity, usually in the Authorization header. The server checks that credential before doing anything. The common approaches trade simplicity against security and flexibility.",
      },
      {
        type: "code",
        code: "GET /v1/charges HTTP/1.1\nAuthorization: Bearer sk_live_a1b2c3…    ← API key: which app is calling\n\nGET /me HTTP/1.1\nAuthorization: Bearer eyJhbGci….sig      ← JWT: which user, signed and verifiable\n\n// Always over HTTPS, never in a URL or a log; scoped and revocable",
        caption: "The credential rides in the Authorization header — a key names the app, a signed token names the user.",
      },
      {
        type: "points",
        items: [
          "API keys — a single secret string identifying the caller; simple but coarse.",
          "Bearer tokens / JWT — a signed token sent on each request; the server verifies the signature without a database lookup.",
          "OAuth / OIDC — a flow letting a user grant an app limited access without sharing their password.",
          "mTLS — both sides present certificates, common for service-to-service calls.",
        ],
      },
      {
        type: "para",
        text: "Two ideas underpin all of them. Authentication answers 'who are you' (verifying identity); authorization answers 'what are you allowed to do' (checking permissions). A request can be perfectly authenticated and still forbidden. Keeping the two distinct is essential to getting access control right.",
      },
      {
        type: "demo",
        demo: "api-auth",
      },
      {
        type: "note",
        text: "Whatever the scheme, a credential is only as safe as its transport and storage — always over HTTPS, never in a URL or a log, and scoped to the least access the caller actually needs.",
      },
    ],
    tradeoffs: {
      good: [
        "Each stateless request proves itself, with no server-side session needed (with tokens).",
        "Tokens and keys can be scoped, rotated, and revoked.",
        "OAuth lets users delegate access without handing over passwords.",
        "Standard schemes are widely supported by libraries and gateways.",
      ],
      costs: [
        "A leaked key or token is a leaked identity until it's revoked or expires.",
        "Token revocation is genuinely hard — a JWT is valid until it expires.",
        "OAuth flows are complex and easy to implement insecurely.",
        "Getting authorization (not just authentication) right is subtle and a top source of breaches.",
      ],
    },
    realWorld:
      "Every API you integrate with hands you a key or walks you through an OAuth flow. 'Log in with Google', a Stripe secret key, a GitHub token — all are this topic, and broken access control (auth done wrong) sits at the top of the OWASP list of web risks.",
    related: [
      { slug: "auth-vs-authz", note: "The who-versus-what distinction underneath it all." },
      { slug: "jwt", note: "A common self-contained token format." },
      { slug: "oauth-oidc", note: "The delegated-access flow." },
      { slug: "headers-cookies", note: "Where the credential actually rides." },
      { slug: "rate-limiting", note: "Paired with auth to curb abuse." },
    ],
  },
  {
    slug: "grpc",
    tagline:
      "A fast, contract-first way for services to call each other's functions over the network as if they were local.",
    problem:
      "You've split your system into services that call each other constantly, thousands of times a second. Sending verbose JSON over HTTP for each call wastes CPU parsing text and bandwidth carrying field names, and there's no enforced contract — one team renames a field and the caller breaks at runtime. For internal, high-volume service-to-service traffic, is there something tighter than REST plus JSON?",
    demo: "grpc",
    how: [
      {
        type: "para",
        text: "gRPC lets you define your service's methods and message types once, in a .proto file (Protocol Buffers). From that single contract it generates client and server code in many languages, so calling a remote method looks like calling a local function — the framework handles serialization and transport for you.",
      },
      {
        type: "code",
        code: '// user.proto — the one shared contract\nsyntax = "proto3";\n\nmessage GetUserRequest { int32 id = 1; }\nmessage User          { int32 id = 1; string name = 2; }\n\nservice UserService {\n  rpc GetUser(GetUserRequest) returns (User);        // one call, one reply\n  rpc ListUsers(Empty)        returns (stream User); // server streaming\n}',
        caption: "One .proto defines the messages and methods; codegen turns it into typed clients and servers in any language.",
      },
      {
        type: "points",
        items: [
          "Contract-first — the .proto file is the shared, enforced schema.",
          "Messages are Protocol Buffers, a compact binary format that's smaller and faster to parse than JSON.",
          "Runs over HTTP/2, gaining multiplexing and streaming.",
          "Supports streaming in either or both directions, not just request/response.",
          "Generates typed client and server stubs, so mismatches are caught at build time.",
        ],
      },
      {
        type: "para",
        text: "The payoff is speed and safety for internal traffic: binary payloads and HTTP/2 make calls cheap, and the generated types mean a changed contract breaks the build rather than production. The cost is that it's far less friendly to browsers and humans than plain JSON over HTTP.",
      },
      {
        type: "demo",
        demo: "grpc",
      },
      {
        type: "note",
        text: "gRPC isn't a natural fit for direct browser use (it needs a proxy like gRPC-Web) or for public APIs where consumers expect readable JSON. It shines between your own back-end services.",
      },
    ],
    tradeoffs: {
      good: [
        "Compact binary payloads and HTTP/2 make calls fast and cheap.",
        "The generated, typed contract catches breaking changes at build time.",
        "Native streaming in client, server, or both directions.",
        "One .proto file generates clients in many languages.",
      ],
      costs: [
        "The binary format isn't human-readable, so it's harder to debug by eye.",
        "Awkward for browsers and public APIs (needs gRPC-Web or a gateway).",
        "More tooling and build steps than plain REST.",
        "Overkill for simple or low-volume APIs.",
      ],
    },
    realWorld:
      "gRPC is common for internal microservice communication where performance and strict contracts matter — the calls happening behind an API gateway that itself speaks plain REST and JSON to the outside world.",
    related: [
      { slug: "rest", note: "The JSON-over-HTTP alternative it improves on internally." },
      { slug: "http2-http3", note: "The transport gRPC relies on." },
      { slug: "microservices", note: "Its primary use case." },
      { slug: "graphql", note: "Another modern API style, aimed at clients rather than services." },
      { slug: "api-gateway", note: "Often translates external REST into internal gRPC." },
    ],
  },
  {
    slug: "graphql",
    tagline:
      "A query language that lets the client ask for exactly the data it needs in one request — no more, no less.",
    problem:
      "Your mobile screen needs a user's name, their last three orders, and each order's total. A REST API makes you call /users/42, then /users/42/orders, then loop for the details — several round trips, and each returns far more fields than the screen uses. Over a slow phone connection that's painfully wasteful. Can the client just describe the exact shape of data it wants and get it back in one go?",
    demo: "graphql",
    how: [
      {
        type: "para",
        text: "GraphQL exposes a single endpoint and a typed schema of everything available. The client sends a query describing precisely the fields and relationships it wants, nested as deeply as needed, and the server returns exactly that shape — usually in one round trip. No more over-fetching unused fields or under-fetching and calling again.",
      },
      {
        type: "code",
        code: '# one endpoint, one request — ask for exactly these fields\nquery {\n  user(id: 42) {\n    name\n    orders(last: 3) { total }\n  }\n}\n\n# the response mirrors that shape — no extra fields\n{ "user": { "name": "Ada", "orders": [ { "total": 42.0 } ] } }',
        caption: "The client dictates the response shape — a name plus the last three order totals, in a single round trip.",
      },
      {
        type: "points",
        items: [
          "One endpoint, one request — the query's shape defines the response's shape.",
          "Ask for exactly the fields you need, following relationships in the same query.",
          "A strongly-typed schema documents and validates every query.",
          "Mutations handle writes; subscriptions handle real-time updates.",
        ],
      },
      {
        type: "para",
        text: "This shifts power to the client: front-end teams can build new screens without waiting for new back-end endpoints. But the cost moves to the server, which must resolve arbitrary query shapes efficiently — and a naively resolved nested query is a fast route to the N+1 problem and expensive, hard-to-cache requests.",
      },
      {
        type: "demo",
        demo: "graphql",
      },
      {
        type: "note",
        text: "GraphQL's flexibility is also its risk: a client can request a hugely expensive nested query, so servers need query-cost limits and careful resolvers. And because everything is one POST endpoint, HTTP's built-in caching no longer helps for free.",
      },
    ],
    tradeoffs: {
      good: [
        "Clients get exactly the data they need in one request — no over- or under-fetching.",
        "The typed schema is self-documenting and validates queries.",
        "Front-end teams iterate without waiting for new back-end endpoints.",
        "A single endpoint serves many different screens with different needs.",
      ],
      costs: [
        "The server must resolve arbitrary shapes, inviting N+1 queries if done naively.",
        "HTTP caching doesn't apply to one POST endpoint the way it does to REST URLs.",
        "Expensive nested queries need cost limits to prevent abuse.",
        "More upfront setup and a steeper learning curve than plain REST.",
      ],
    },
    realWorld:
      "GraphQL is popular where many different clients — web, iOS, Android — hit the same data with different needs; it started at Facebook for exactly that. You'll meet it as an alternative to REST, and its classic pitfall, the N+1 query, is a rite of passage.",
    related: [
      { slug: "rest", note: "The model GraphQL positions itself against." },
      { slug: "n-plus-1", note: "Its classic performance trap on the server." },
      { slug: "http-request-response", note: "Every query rides on one POST." },
      { slug: "caching-perf", note: "Harder to get than with cacheable REST URLs." },
      { slug: "api-auth", note: "Securing a single, flexible endpoint." },
    ],
  },
  {
    slug: "rate-limiting",
    tagline:
      "Capping how many requests a client can make in a window, to protect a service from overload and abuse.",
    problem:
      "One buggy client stuck in a retry loop, or one deliberate attacker, can fire thousands of requests a second at your API — enough to exhaust your servers and take the service down for everyone else. A single free-tier user could also run up your bill scraping data all day. How do you stop any one caller from consuming more than its fair share?",
    demo: "token-bucket",
    how: [
      {
        type: "para",
        text: "Rate limiting counts each client's requests over a time window and rejects those beyond a set threshold, usually returning status 429 (Too Many Requests) with a header telling the client when to try again. The client is identified by API key, user ID, or IP address.",
      },
      {
        type: "code",
        code: "GET /v1/search HTTP/1.1\nAuthorization: Bearer sk_live_…\n\nHTTP/1.1 429 Too Many Requests\nRetry-After: 30              ← wait 30s before retrying\nX-RateLimit-Limit: 100       ← your cap for the window\nX-RateLimit-Remaining: 0     ← none left right now",
        caption: "Over the limit, the server returns 429 and uses headers to say how much quota is left and when to try again.",
      },
      {
        type: "points",
        items: [
          "Fixed window — simple, but bursty right at the window's edges.",
          "Sliding window — smoother, spreading the limit across time.",
          "Token bucket — allows short bursts up to a cap, then refills at a steady rate.",
          "Typical response: 429 plus a Retry-After or rate-limit header.",
        ],
      },
      {
        type: "para",
        text: "It's both a stability tool and a security control. For stability, it keeps one heavy user from degrading the service for everyone and helps prevent cascading failure. For security, it blunts brute-force logins, credential stuffing, and scraping — which is why login and password endpoints are usually limited the hardest.",
      },
      {
        type: "demo",
        demo: "token-bucket",
      },
      {
        type: "note",
        text: "Rate limiting is often enforced at the edge — an API gateway or load balancer — so abusive traffic is rejected before it ever reaches your application servers.",
      },
    ],
    tradeoffs: {
      good: [
        "Protects the service from overload, traffic spikes, and cascading failure.",
        "Blunts brute-force, credential-stuffing, and scraping attacks.",
        "Enforces fair usage and tiered plans (free versus paid).",
        "Cheap to run at the gateway, before requests reach app code.",
      ],
      costs: [
        "Too strict and it blocks legitimate bursts, frustrating real users.",
        "Hard to coordinate across many servers, since the count must be shared.",
        "Attackers can rotate IPs or keys to slip past simple limits.",
        "Adds a small amount of per-request tracking overhead.",
      ],
    },
    realWorld:
      "Every serious public API publishes rate limits, and handling a 429 with a Retry-After header is a routine part of integrating one. On the defense side, it's a front-line control against brute-force login attacks and scrapers.",
    related: [
      { slug: "status-codes", note: "429 is the code it uses to push back." },
      { slug: "api-auth", note: "Limits are usually keyed to identity." },
      { slug: "api-gateway", note: "Where limits are commonly enforced." },
      { slug: "rate-limiting-defense", note: "The security-focused view of the same tool." },
      { slug: "failure-retries-timeouts", note: "Clients must back off when they hit a limit." },
    ],
  },
];
