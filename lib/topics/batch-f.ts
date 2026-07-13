import type { TopicContent } from "@/lib/topics";

export const batchF: TopicContent[] = [
  {
    slug: "auth-vs-authz",
    tagline:
      "The difference between proving who you are and being allowed to do a thing.",
    problem:
      "A logged-in user changes the id in the URL from their own to someone else's and suddenly sees another person's invoices. The system correctly checked that they were signed in — but never checked whether they were allowed to see that particular record. Confusing 'who are you?' with 'what may you do?' is behind a huge share of real breaches.",
    how: [
      {
        type: "para",
        text: "Authentication (authn) establishes identity: it answers 'who is this?' by verifying something the user knows, has, or is — a password, a one-time code, a device. Authorization (authz) happens after, and decides 'is this identity allowed to perform this action on this resource?'. They are separate steps, and both must pass.",
      },
      {
        type: "points",
        items: [
          "Authentication first, authorization second — you can't decide what someone may do until you know who they are.",
          "Authentication runs once per session; authorization must be checked on every sensitive action and every resource.",
          "Authorization models range from simple roles (admin, user) to fine-grained per-object ownership checks.",
        ],
      },
      {
        type: "note",
        text: "The classic mistake is checking only authentication. 'The user is logged in' does not imply 'the user owns this record' — you must still verify they may touch the specific thing they asked for.",
      },
    ],
    tradeoffs: {
      good: [
        "Separating the two lets you reason about identity and permission independently.",
        "Clear authorization checks stop users from reaching each other's data.",
        "Role and ownership models scale from a small app to an enterprise.",
      ],
      costs: [
        "Every sensitive endpoint needs its own authorization check — easy to forget one.",
        "Fine-grained permission systems get complex and hard to audit.",
        "A missed object-level check (accessing by id) is invisible until exploited.",
      ],
    },
    realWorld:
      "Broken object-level authorization — letting one user read or edit another's data by guessing an id — is one of the most common API vulnerabilities in the wild. It happens precisely because authentication passed and everyone assumed the request was therefore safe.",
    related: [
      {
        slug: "broken-auth",
        note: "What goes wrong when authentication itself is weak.",
      },
      {
        slug: "sessions-cookies",
        note: "How a proven identity is remembered across requests.",
      },
      { slug: "jwt", note: "A common way to carry identity and claims." },
      {
        slug: "api-auth",
        note: "Where both checks get enforced on API requests.",
      },
      {
        slug: "input-validation",
        note: "Never trust an id from the client without an ownership check.",
      },
    ],
  },
  {
    slug: "sessions-cookies",
    tagline:
      "How a website remembers you're logged in across stateless HTTP requests.",
    problem:
      "You log in once, then click around ten pages without re-entering your password. But HTTP is stateless — the server treats each request as if it had never seen you before. Something has to carry proof of your login from one request to the next, without letting an attacker forge or steal that proof. How does the site remember you?",
    how: [
      {
        type: "para",
        text: "After you log in, the server creates a session — a record of who you are — and hands the browser a session id, usually stored in a cookie. The browser automatically attaches that cookie to every later request to the site, so the server can look up the session and know it's still you.",
      },
      {
        type: "para",
        text: "The session id must be long, random, and unguessable, because whoever holds it is treated as you. The server stores the real session data (server-side sessions); the cookie holds only the opaque id. Cookies carry flags that control their safety.",
      },
      {
        type: "points",
        items: [
          "HttpOnly — JavaScript can't read the cookie, limiting theft via XSS.",
          "Secure — the cookie is only sent over HTTPS, not plaintext HTTP.",
          "SameSite — restricts sending the cookie on cross-site requests, blunting CSRF.",
          "Sessions should expire and be invalidated server-side on logout.",
        ],
      },
      {
        type: "note",
        text: "A stolen session id is as good as a stolen password until it expires. That's why HTTPS, HttpOnly, and rotating/expiring session ids matter so much.",
      },
    ],
    tradeoffs: {
      good: [
        "Server-side sessions can be revoked instantly — just delete the record.",
        "The cookie is opaque, so it reveals nothing and can't be tampered into new privileges.",
        "Cookie flags give layered defenses against theft and cross-site abuse.",
      ],
      costs: [
        "The server must store and look up session state, which complicates scaling across many servers.",
        "Cookies are attached automatically, which is the root of CSRF.",
        "A stolen or fixated session id grants full access until it's invalidated.",
      ],
    },
    realWorld:
      "Almost every website you stay logged into uses session cookies. Shared session stores (like Redis) exist precisely so a fleet of servers can all validate the same session id. Getting the cookie flags wrong is a recurring source of account-takeover bugs.",
    related: [
      {
        slug: "jwt",
        note: "The stateless alternative — identity carried in the token itself.",
      },
      {
        slug: "headers-cookies",
        note: "The HTTP mechanism cookies ride on.",
      },
      {
        slug: "csrf",
        note: "The attack that exploits cookies being sent automatically.",
      },
      {
        slug: "xss",
        note: "How session cookies get stolen when HttpOnly is missing.",
      },
      {
        slug: "broken-auth",
        note: "Weak session handling is a core cause of broken authentication.",
      },
    ],
  },
  {
    slug: "jwt",
    tagline:
      "A signed token that carries a user's identity so the server doesn't have to look it up.",
    problem:
      "With server-side sessions, every request means a lookup in a shared session store, and scaling across many servers or services means they all share that store. What if the request could carry a tamper-proof proof of identity that any server can verify on its own, no database hit required? That's the promise — and the trap — of JWTs.",
    how: [
      {
        type: "para",
        text: "A JSON Web Token has three parts: a header, a payload of claims (like user id, roles, expiry), and a signature. The server signs the header and payload with a secret key. Any server holding the key can verify the signature and trust the claims without contacting a database — the token is self-contained.",
      },
      {
        type: "para",
        text: "Crucially, a JWT is signed, not encrypted — the payload is only base64-encoded and fully readable by anyone. The signature stops tampering, not reading. Never put secrets in a JWT payload.",
      },
      {
        type: "points",
        items: [
          "The signature proves the claims haven't been altered — change one byte and verification fails.",
          "Keep an expiry (exp) short, because a valid token can't easily be revoked before it expires.",
          "Always verify the algorithm server-side; reject 'none' and don't let the token dictate the algorithm.",
          "Store secrets and signing keys server-side; never trust claims from an unverified token.",
        ],
      },
      {
        type: "note",
        text: "Revocation is the hard part. Because the server doesn't track them, a stolen JWT stays valid until it expires. Short lifetimes plus a separate refresh token, or a revocation list, are the usual mitigations.",
      },
    ],
    tradeoffs: {
      good: [
        "Stateless — any server with the key can verify without a shared session store.",
        "Fits distributed systems and APIs where services must check identity independently.",
        "The signature makes claims tamper-evident.",
      ],
      costs: [
        "Hard to revoke before expiry — logout doesn't truly kill a token.",
        "The payload is readable, so it must never hold secrets.",
        "Misconfiguration (accepting 'none', weak keys, no expiry check) leads to full forgery.",
      ],
    },
    realWorld:
      "JWTs are everywhere in APIs and single-sign-on, often as the access token in OAuth flows. The recurring failure is treating them as encrypted, or skipping proper signature/algorithm verification — both let attackers read or forge claims.",
    related: [
      {
        slug: "sessions-cookies",
        note: "The stateful alternative you're trading against.",
      },
      {
        slug: "oauth-oidc",
        note: "OIDC issues identity as a signed JWT (the id token).",
      },
      {
        slug: "password-hashing",
        note: "Signing is one-way like hashing but serves a different purpose.",
      },
      {
        slug: "api-auth",
        note: "JWTs are a common bearer credential for APIs.",
      },
      {
        slug: "encryption",
        note: "The contrast — JWTs are signed for integrity, not encrypted for secrecy.",
      },
    ],
  },
  {
    slug: "oauth-oidc",
    tagline:
      "Letting an app act on your behalf, or log you in, without ever seeing your password.",
    problem:
      "A calendar app wants to read your Google contacts. You could hand it your Google password — but then it has full access to everything forever, and you can't take it back without changing your password. You want to grant one app limited, revocable access to specific data, without sharing your credentials. That's the problem OAuth solves.",
    how: [
      {
        type: "para",
        text: "OAuth 2.0 is a delegated authorization framework. Instead of giving the app your password, you authenticate directly with the provider (Google), which then issues the app a scoped access token. The app uses that token to call the API within the limits you approved — and you can revoke it at any time.",
      },
      {
        type: "para",
        text: "OAuth alone is about authorization (access to resources). OpenID Connect (OIDC) is a thin identity layer on top: it adds an id token (a signed JWT) that proves who you are, which is what powers 'Sign in with Google/Apple/GitHub'.",
      },
      {
        type: "points",
        items: [
          "The Authorization Code flow (with PKCE) is the recommended flow for web and mobile apps.",
          "Access tokens are scoped and short-lived; refresh tokens obtain new ones without re-prompting.",
          "OAuth = delegated authorization; OIDC = authentication (login) built on top.",
          "The app never sees your password — only tokens the provider issues.",
        ],
      },
      {
        type: "note",
        text: "OAuth is for authorization; using a raw OAuth access token as proof of identity is a classic mistake. If you want login, use OIDC's id token, which is designed for that.",
      },
    ],
    tradeoffs: {
      good: [
        "Users never share their password with third-party apps.",
        "Access is scoped to specific permissions and can be revoked.",
        "OIDC gives users one trusted login across many sites.",
      ],
      costs: [
        "The flows are intricate and easy to implement insecurely (redirect handling, state/PKCE).",
        "You depend on the identity provider's availability and policies.",
        "Token storage and refresh add moving parts and their own attack surface.",
      ],
    },
    realWorld:
      "Every 'Sign in with Google/Apple/GitHub' button is OIDC over OAuth. Every 'app X wants permission to access your Y' consent screen is an OAuth scope grant. Most breaches here come from mishandled redirect URIs or skipping the state/PKCE checks that prevent code interception.",
    related: [
      {
        slug: "jwt",
        note: "OIDC's id token is a signed JWT.",
      },
      {
        slug: "auth-vs-authz",
        note: "OAuth is authorization; OIDC adds authentication.",
      },
      {
        slug: "api-auth",
        note: "Access tokens are how the delegated app calls the API.",
      },
      {
        slug: "sessions-cookies",
        note: "After OIDC login, the app usually starts its own session.",
      },
      {
        slug: "csrf",
        note: "The state parameter exists to prevent CSRF on the callback.",
      },
    ],
  },
  {
    slug: "password-hashing",
    tagline:
      "How to store passwords so a database breach doesn't hand over everyone's password.",
    problem:
      "You must check a user's password at login, but if you store passwords as plain text, a single database leak exposes every account — and people reuse passwords everywhere. How do you verify a password without ever keeping the password itself?",
    how: [
      {
        type: "para",
        text: "You store a one-way hash, not the password. A slow, salted hash function (bcrypt, argon2, scrypt) turns the password into a value you can't reverse. At login you hash the input the same way and compare against the stored hash — the original password is never kept anywhere.",
      },
      {
        type: "points",
        items: [
          "A per-user random salt stops attackers reusing precomputed tables across accounts.",
          "Deliberately slow, memory-hard hashing makes mass guessing expensive.",
          "Never use fast hashes like MD5 or plain SHA-256 for passwords — they guess too cheaply.",
          "Compare hashes in constant time and let the algorithm handle salting for you.",
        ],
      },
      {
        type: "note",
        text: "Argon2id is the current recommended default; bcrypt and scrypt remain solid. Tune the cost parameters so hashing takes a noticeable fraction of a second on your hardware.",
      },
    ],
    tradeoffs: {
      good: [
        "A breach leaks hashes, not usable passwords.",
        "Salts defeat rainbow tables and stop identical passwords sharing a hash.",
        "Tunable cost keeps pace with faster hardware over time.",
      ],
      costs: [
        "Hashing is intentionally slow, costing CPU on every login.",
        "Get the algorithm or parameters wrong and it's weak.",
        "Doesn't help if the password itself is weak or reused — pair it with rate limiting and MFA.",
      ],
    },
    realWorld:
      "Every login system needs this. Leaked-password dumps that show up in credential-stuffing attacks almost always trace back to plaintext or fast-hash (MD5/SHA-1) storage — the exact failure salted slow hashing prevents.",
    related: [
      {
        slug: "encryption",
        note: "Related but different — hashing is one-way and can't be reversed.",
      },
      {
        slug: "auth-vs-authz",
        note: "Hashing is part of authentication.",
      },
      {
        slug: "broken-auth",
        note: "Weak or missing hashing is a headline cause of broken auth.",
      },
      {
        slug: "rate-limiting-defense",
        note: "Limits guessing at the login even before the hash slows attackers.",
      },
    ],
  },
  {
    slug: "owasp-top-10",
    tagline:
      "A widely used checklist of the most common, most damaging web security risks.",
    problem:
      "Security is enormous and a small team can't chase every possible flaw. Where do you even start, and how do you know you're covering the risks that actually get exploited rather than exotic ones that don't? You need a prioritized, evidence-based list of what goes wrong most often. That's what the OWASP Top 10 provides.",
    how: [
      {
        type: "para",
        text: "The OWASP Top 10 is a periodically updated, community-driven list of the most critical web application security risks, ranked by real-world prevalence and impact. It's not a standard to certify against — it's a baseline awareness document and starting checklist for developers and reviewers.",
      },
      {
        type: "points",
        items: [
          "Broken access control — users reaching data or actions they shouldn't (often ranked #1).",
          "Injection — SQL, command, and similar, where untrusted input becomes code.",
          "Cryptographic failures — weak or missing encryption/hashing of sensitive data.",
          "Security misconfiguration and vulnerable/outdated components — insecure defaults and unpatched dependencies.",
          "Identification and authentication failures — the weak-login and session problems.",
        ],
      },
      {
        type: "note",
        text: "The exact ranking shifts between editions, so treat it as a living guide, not gospel. Use it to prioritize, then go deeper with fuller resources like the OWASP ASVS and Cheat Sheets.",
      },
    ],
    tradeoffs: {
      good: [
        "Focuses limited effort on the risks that are actually exploited most.",
        "Shared vocabulary between developers, reviewers, and security teams.",
        "A practical on-ramp to security for teams without a specialist.",
      ],
      costs: [
        "It's awareness, not a complete or certifiable standard — passing it isn't 'secure'.",
        "Rankings change, so treat it as guidance, not a fixed rulebook.",
        "Web-app focused; it won't cover every threat in your specific system.",
      ],
    },
    realWorld:
      "Most security checklists, training, and code-review guides start from the OWASP Top 10. When a pentest report or a bug bounty finding lands, it's usually categorized against these items — which is why knowing the list makes those reports legible.",
    related: [
      {
        slug: "sql-injection",
        note: "The canonical injection risk on the list.",
      },
      {
        slug: "broken-auth",
        note: "Identification and authentication failures.",
      },
      {
        slug: "auth-vs-authz",
        note: "Broken access control is consistently ranked at or near the top.",
      },
      {
        slug: "input-validation",
        note: "The general defense underpinning several list items.",
      },
      {
        slug: "encryption",
        note: "Cryptographic failures are a dedicated category.",
      },
    ],
  },
  {
    slug: "sql-injection",
    tagline:
      "When user input is glued into a query as code, letting attackers rewrite it.",
    problem:
      "Your login checks a query built like \"SELECT * FROM users WHERE name = '\" + input + \"'\". A user types their name as ' OR '1'='1 and the query now matches every row — they're logged in as someone else, or worse, they append a command that dumps or deletes the whole table. Any time input is concatenated into SQL, the input can become code.",
    how: [
      {
        type: "para",
        text: "SQL injection happens when data and code share the same channel: the database can't tell your intended query from the attacker's injected fragment because they arrived as one string. The fix is to keep them separate — send the query and the data on different tracks so input is always treated as a value, never as SQL.",
      },
      {
        type: "points",
        items: [
          "Use parameterized queries (prepared statements): the query has placeholders, and values are bound separately so they can never change its structure.",
          "Prefer a vetted ORM or query builder that parameterizes by default.",
          "Validate and constrain input, and apply least-privilege DB accounts so a breach can do less.",
          "Never build SQL by string concatenation with user input — this is the root cause.",
        ],
      },
      {
        type: "note",
        text: "Escaping input by hand is fragile and easy to get wrong across edge cases and encodings. Parameterization is the reliable fix because the driver, not your string logic, guarantees the separation.",
      },
    ],
    tradeoffs: {
      good: [
        "Parameterized queries eliminate the entire class of bug reliably.",
        "They're usually simpler to write than manual escaping.",
        "Often a small performance win too, since the plan can be reused.",
      ],
      costs: [
        "One overlooked concatenated query reopens the hole.",
        "Dynamic SQL (variable table/column names) needs extra care — those can't be parameters.",
        "Legacy code full of string-built queries is tedious to retrofit.",
      ],
    },
    realWorld:
      "SQL injection is decades old and still causes major breaches, because a single legacy endpoint that concatenates input is enough. It's the textbook example of the broader injection category on the OWASP Top 10.",
    related: [
      {
        slug: "input-validation",
        note: "The general principle — never trust input; here, keep it out of query structure.",
      },
      {
        slug: "select-where",
        note: "The queries that get injected into.",
      },
      {
        slug: "owasp-top-10",
        note: "Injection is a long-standing top-ranked category.",
      },
      {
        slug: "xss",
        note: "The same data-as-code flaw, but in the browser instead of the database.",
      },
      {
        slug: "broken-auth",
        note: "Injection on a login is a direct path to bypassing authentication.",
      },
    ],
  },
  {
    slug: "xss",
    tagline:
      "When a site renders attacker-supplied input as live code in another user's browser.",
    problem:
      "A comment box lets users post text, and you show comments to everyone. An attacker posts <script>steal(document.cookie)</script> as their comment. Now every visitor who views that page runs the attacker's JavaScript in their own session — reading their cookies, acting as them, or redirecting them. The page treated attacker data as code.",
    how: [
      {
        type: "para",
        text: "Cross-site scripting (XSS) is injection in the browser: untrusted input is written into a page without being neutralized, so the browser executes it as HTML or JavaScript. The defense is contextual output encoding — when you place data into a page, encode it for that spot so it renders as inert text, not markup.",
      },
      {
        type: "points",
        items: [
          "Encode on output based on context (HTML body, attribute, URL, JavaScript) — the rules differ per context.",
          "Prefer frameworks (React, Angular, etc.) that auto-escape by default; be wary of escape hatches like dangerouslySetInnerHTML.",
          "Set a Content Security Policy (CSP) as defense-in-depth to limit what injected scripts can do.",
          "Set HttpOnly on session cookies so injected script can't read them.",
        ],
      },
      {
        type: "note",
        text: "Types worth knowing: stored XSS (payload saved on the server, like the comment), reflected XSS (payload bounced back from a request), and DOM-based XSS (unsafe handling in client-side JS). All share the same root — data rendered as code.",
      },
    ],
    tradeoffs: {
      good: [
        "Correct output encoding neutralizes the payload wherever it lands.",
        "Modern frameworks make the safe path the default path.",
        "CSP and HttpOnly cookies contain the damage even if something slips through.",
      ],
      costs: [
        "Encoding is context-dependent — the right escape in HTML is wrong in a URL or script.",
        "Rich-text/HTML features need careful sanitization, not just escaping.",
        "A single unescaped sink anywhere reintroduces the risk.",
      ],
    },
    realWorld:
      "XSS is one of the most reported web vulnerabilities, especially anywhere user content is displayed to others — comments, profiles, chat, support tickets. It's how session cookies get stolen in the wild, which is exactly why HttpOnly and CSP matter.",
    related: [
      {
        slug: "input-validation",
        note: "The same data-as-code discipline, applied to browser output.",
      },
      {
        slug: "sql-injection",
        note: "The sibling injection flaw, one layer down in the database.",
      },
      {
        slug: "sessions-cookies",
        note: "Session cookies are the prime target — HttpOnly is the counter.",
      },
      {
        slug: "csrf",
        note: "A related client-side attack, but exploiting trust rather than injecting code.",
      },
      {
        slug: "owasp-top-10",
        note: "XSS sits under the injection family on the list.",
      },
    ],
  },
  {
    slug: "csrf",
    tagline:
      "Tricking a logged-in user's browser into making a request they never intended.",
    problem:
      "You're logged into your bank in one tab. In another tab you open a malicious page that quietly submits a hidden form to transfer money from your account. Because your browser attaches your bank session cookie to every request to that domain automatically, the bank sees a fully authenticated request — and processes the transfer. You never clicked anything meaningful.",
    how: [
      {
        type: "para",
        text: "Cross-site request forgery (CSRF) abuses the fact that browsers send cookies automatically. The attacker's site can't read your bank's responses, but it can cause your browser to send an authenticated request. The defense is to require proof that the request came from your own site, not a forged cross-site one.",
      },
      {
        type: "points",
        items: [
          "Anti-CSRF tokens: a secret, per-session token embedded in your forms that the attacker's page can't know or read.",
          "SameSite cookies (Lax or Strict): the browser withholds the cookie on cross-site requests, blocking most CSRF.",
          "Check the Origin/Referer header on state-changing requests as a secondary signal.",
          "Only mutate state on POST/PUT/DELETE, never on a plain GET.",
        ],
      },
      {
        type: "note",
        text: "CSRF targets requests authenticated by cookies. Token-based auth sent via a custom Authorization header (like a bearer JWT) isn't attached automatically, so it's largely immune — the exposure is specifically automatic credentials.",
      },
    ],
    tradeoffs: {
      good: [
        "SameSite cookies block most CSRF with a single cookie flag.",
        "Anti-CSRF tokens give strong, explicit protection for form-based apps.",
        "Defenses are well understood and built into most web frameworks.",
      ],
      costs: [
        "Token handling adds plumbing to every state-changing form and request.",
        "SameSite can break legitimate cross-site flows (embeds, some redirects, SSO).",
        "GET endpoints that change state quietly bypass token protections.",
      ],
    },
    realWorld:
      "CSRF drove the invention of the anti-forgery tokens now standard in every web framework, and the SameSite cookie default that browsers adopted. It's why 'change email/password' and money-moving endpoints always require a token or a fresh confirmation.",
    related: [
      {
        slug: "sessions-cookies",
        note: "The automatic cookie behavior CSRF depends on.",
      },
      {
        slug: "xss",
        note: "A different client-side attack — note XSS can defeat CSRF tokens.",
      },
      {
        slug: "headers-cookies",
        note: "SameSite and Origin checks live in HTTP headers.",
      },
      {
        slug: "http-methods",
        note: "Why state changes must not ride on GET.",
      },
      {
        slug: "jwt",
        note: "Header-based tokens sidestep CSRF since they aren't auto-sent.",
      },
    ],
  },
  {
    slug: "ssrf",
    tagline:
      "Tricking a server into making requests to places the attacker can't reach directly.",
    problem:
      "Your app has a feature that fetches a URL the user provides — say, to generate a link preview or import an image. An attacker gives it http://169.254.169.254/ or http://localhost/admin. Your server, sitting inside a trusted network, happily fetches internal services, cloud metadata endpoints, and databases the attacker could never reach from outside — and hands back the results.",
    how: [
      {
        type: "para",
        text: "Server-side request forgery (SSRF) turns your server into a proxy: because it's trusted inside the network, requests it makes on the attacker's behalf can reach internal-only resources. The defense is to strictly control what outbound requests the server is allowed to make from user input.",
      },
      {
        type: "points",
        items: [
          "Allowlist permitted destinations (specific hosts/domains) rather than trying to blocklist bad ones.",
          "Block requests to private/internal IP ranges and the cloud metadata address (169.254.169.254).",
          "Resolve the hostname and validate the resolved IP — and re-check after redirects to stop rebinding tricks.",
          "Disable unneeded URL schemes (file://, gopher://) and require the response type you expect.",
        ],
      },
      {
        type: "note",
        text: "Cloud metadata endpoints are a prime SSRF target because they can hand out credentials. Enforce the metadata service's hardened mode (e.g. requiring a session token) so a bare SSRF can't harvest secrets.",
      },
    ],
    tradeoffs: {
      good: [
        "An allowlist plus IP validation shuts down the common attack paths.",
        "Cheap to add on the few endpoints that fetch user-supplied URLs.",
        "Network-level egress rules give a strong second layer.",
      ],
      costs: [
        "Redirects and DNS rebinding make validation tricky — you must re-check after each hop.",
        "Blocklists of 'bad' IPs are easy to bypass; allowlisting is stricter but limits features.",
        "Legitimate use cases (arbitrary user webhooks) are genuinely hard to secure.",
      ],
    },
    realWorld:
      "SSRF has caused major cloud breaches, most famously by reaching the metadata service to steal IAM credentials. Any feature that fetches a user-supplied URL — webhooks, previews, imports, PDF renderers — is a candidate, which earned SSRF its own spot on the OWASP Top 10.",
    related: [
      {
        slug: "input-validation",
        note: "A user-supplied URL is untrusted input that needs strict validation.",
      },
      {
        slug: "cloud-networking-iam",
        note: "The metadata service and internal network SSRF targets.",
      },
      {
        slug: "dns",
        note: "DNS rebinding is a key way SSRF checks get bypassed.",
      },
      {
        slug: "owasp-top-10",
        note: "SSRF is a named category on the list.",
      },
      {
        slug: "http-request-response",
        note: "SSRF is the server making its own outbound HTTP requests.",
      },
    ],
  },
  {
    slug: "broken-auth",
    tagline:
      "The many ways a login and session system fails and lets attackers in as someone else.",
    problem:
      "An attacker doesn't need to break your encryption if they can just log in as your users. They try leaked passwords across your login (credential stuffing), guess weak ones at high speed, reuse a session id that never expired, or reset a password through a sloppy 'forgot password' flow. Any weakness in how you prove and maintain identity is a direct route to account takeover.",
    how: [
      {
        type: "para",
        text: "'Broken authentication' covers the whole cluster of failures in verifying identity and keeping sessions safe. There's no single fix — it's a set of practices that together make impersonation hard, from the password itself through the session lifecycle to recovery flows.",
      },
      {
        type: "points",
        items: [
          "Store passwords with slow, salted hashing; enforce reasonable strength and check against known-breached lists.",
          "Rate-limit and lock/slow down repeated login attempts to blunt guessing and credential stuffing.",
          "Offer multi-factor authentication — it defeats stolen passwords on its own.",
          "Generate strong random session ids, expire them, rotate on login, and invalidate on logout.",
          "Harden password reset: expiring single-use tokens, no account enumeration, notify the user.",
        ],
      },
      {
        type: "note",
        text: "Don't reveal whether the username or the password was wrong, and keep response timing uniform — otherwise you leak which accounts exist (account enumeration), making targeted attacks easier.",
      },
    ],
    tradeoffs: {
      good: [
        "MFA alone stops the vast majority of automated account takeovers.",
        "Proper session and reset handling closes the most common takeover routes.",
        "Most defenses are well-supported by existing libraries and identity providers.",
      ],
      costs: [
        "It's a broad surface — one weak link (say, the reset flow) undoes the rest.",
        "Stronger auth adds user friction, and teams are tempted to cut corners.",
        "Rolling your own auth is risky; a subtle mistake becomes a takeover.",
      ],
    },
    realWorld:
      "Credential stuffing against sites with no rate limiting or MFA is one of the most common real attacks, precisely because so many users reuse passwords. This whole category — 'identification and authentication failures' — is a perennial OWASP Top 10 entry.",
    related: [
      {
        slug: "password-hashing",
        note: "The storage half of doing authentication safely.",
      },
      {
        slug: "sessions-cookies",
        note: "Session mishandling is a core part of broken auth.",
      },
      {
        slug: "auth-vs-authz",
        note: "This is the authentication side failing.",
      },
      {
        slug: "rate-limiting-defense",
        note: "The main brake on password guessing and stuffing.",
      },
      {
        slug: "owasp-top-10",
        note: "Its own category on the list.",
      },
    ],
  },
  {
    slug: "input-validation",
    tagline:
      "Treating everything from outside your system as hostile until proven safe.",
    problem:
      "Your code assumes the age field is a small positive number, the file upload is really an image, and the quantity in an order is at least one. Then a request arrives with age = -1, a script disguised as an image, and quantity = -5 that credits the attacker money. Every input from a client, another service, or a file is a chance for someone to feed you something you never expected.",
    how: [
      {
        type: "para",
        text: "Input validation means checking, at your system's boundary, that incoming data matches what you actually expect — type, range, length, format — and rejecting what doesn't. The strongest form is allowlisting: define what's valid and refuse everything else, rather than trying to enumerate every bad case.",
      },
      {
        type: "points",
        items: [
          "Validate on the server; client-side checks are for UX only and are trivially bypassed.",
          "Prefer allowlists (what's permitted) over blocklists (what's forbidden).",
          "Check type, length, range, and format; normalize/canonicalize before checking.",
          "Validation is separate from output encoding — you still escape data for its destination (SQL, HTML, shell).",
        ],
      },
      {
        type: "note",
        text: "Validation reduces bad input but is not by itself a defense against injection. You still parameterize queries and encode output — validation and context-specific escaping are complementary layers, not substitutes.",
      },
    ],
    tradeoffs: {
      good: [
        "Catches malformed and malicious input early, before it reaches sensitive logic.",
        "Reduces the attack surface for whole classes of bugs.",
        "Also improves plain data quality and error messages, not just security.",
      ],
      costs: [
        "Over-strict rules reject legitimate input (valid names, addresses, unicode).",
        "It's easy to validate in one place and forget another entry point.",
        "It doesn't replace parameterization or output encoding — a common false comfort.",
      ],
    },
    realWorld:
      "Nearly every injection and data-integrity bug involves input that was trusted when it shouldn't have been. 'Validate at the boundary, escape at the sink' is the discipline that underlies defenses against SQL injection, XSS, SSRF, and more.",
    related: [
      {
        slug: "sql-injection",
        note: "One place unvalidated input turns into code.",
      },
      {
        slug: "xss",
        note: "Another — untrusted input rendered in the browser.",
      },
      {
        slug: "ssrf",
        note: "A user-supplied URL is input that must be strictly validated.",
      },
      {
        slug: "error-handling",
        note: "Rejecting bad input cleanly is part of robust error handling.",
      },
      {
        slug: "owasp-top-10",
        note: "The common thread behind several list categories.",
      },
    ],
  },
  {
    slug: "encryption",
    tagline:
      "Scrambling data so only someone with the key can read it.",
    problem:
      "Data travels across networks you don't control and sits on disks that can be stolen or seized. If it's stored and sent as plain readable text, anyone who intercepts the traffic or grabs the drive reads everything — passwords in transit, customer records at rest. How do you make data useless to whoever gets their hands on it, yet readable to the intended party?",
    how: [
      {
        type: "para",
        text: "Encryption transforms readable data (plaintext) into unreadable ciphertext using an algorithm and a key; only holding the right key reverses it. Unlike hashing, it's reversible by design — the whole point is to get the original back. There are two families:",
      },
      {
        type: "points",
        items: [
          "Symmetric (e.g. AES): one shared key encrypts and decrypts — fast, used for bulk data.",
          "Asymmetric (e.g. RSA, elliptic curve): a public key encrypts, a private key decrypts — solves key exchange and enables signatures.",
          "In practice they combine: asymmetric to exchange a symmetric key, then symmetric for the actual data (as in TLS).",
          "Encrypt data in transit (TLS) and at rest (disk/field encryption); protect keys separately.",
        ],
      },
      {
        type: "note",
        text: "Never invent your own cryptography. Use vetted libraries and standard algorithms with correct modes, and treat key management — generation, storage, rotation — as the hard part, because a leaked key makes the strongest cipher pointless.",
      },
    ],
    tradeoffs: {
      good: [
        "Intercepted or stolen data is useless without the key.",
        "Enables trust over untrusted networks (TLS) and secure storage at rest.",
        "Asymmetric crypto also underpins signatures and identity, not just secrecy.",
      ],
      costs: [
        "Key management is genuinely hard, and a leaked key defeats everything.",
        "Adds CPU cost and complexity, especially asymmetric operations.",
        "Encrypted-at-rest data still sits decrypted in memory while in use.",
      ],
    },
    realWorld:
      "Every HTTPS connection is encryption in action (TLS), and 'encryption at rest' is table stakes for storing sensitive data. Cryptographic failures — no encryption, weak algorithms, or mishandled keys — are their own category on the OWASP Top 10.",
    related: [
      {
        slug: "tls-https",
        note: "The most common encryption you rely on daily — data in transit.",
      },
      {
        slug: "password-hashing",
        note: "The contrast — hashing is one-way, encryption is reversible.",
      },
      {
        slug: "jwt",
        note: "JWTs are signed for integrity, not encrypted for secrecy — a common confusion.",
      },
      {
        slug: "owasp-top-10",
        note: "Cryptographic failures are a dedicated category.",
      },
    ],
  },
  {
    slug: "rate-limiting-defense",
    tagline:
      "Capping how often a client can act, to blunt abuse and protect resources.",
    problem:
      "An attacker points a script at your login endpoint and tries thousands of passwords a second, or hammers your 'send verification email' route to spam users and run up your bill, or floods an expensive API until it falls over for everyone. Without a cap on how fast a single client can act, one abuser can guess credentials, exhaust resources, or take the service down.",
    how: [
      {
        type: "para",
        text: "Rate limiting sets a ceiling on how many requests a client may make in a time window, then rejects or delays the excess (typically with HTTP 429 Too Many Requests). As a security control, it turns cheap, high-volume attacks — brute force, credential stuffing, scraping — into slow, expensive ones that are far easier to detect and block.",
      },
      {
        type: "points",
        items: [
          "Common algorithms: token bucket and sliding window balance burst tolerance against a steady cap.",
          "Key limits by the right identifier — user, API key, or IP — knowing IPs can be shared or spoofed.",
          "Apply tighter limits to sensitive, expensive endpoints (login, password reset, sign-up, search).",
          "Return 429 with a Retry-After header, and pair with lockouts/backoff on repeated auth failures.",
        ],
      },
      {
        type: "note",
        text: "Rate limiting is one defensive layer, not a complete one. It slows brute force but doesn't fix weak passwords or missing MFA, and a large distributed (botnet) attack needs dedicated DDoS protection upstream.",
      },
    ],
    tradeoffs: {
      good: [
        "Makes brute force and credential stuffing slow and costly.",
        "Protects resources and cost from scraping and floods.",
        "Cheap to add and useful for fairness, not just security.",
      ],
      costs: [
        "Tune it wrong and you block legitimate bursty users.",
        "IP-based limits misfire behind shared NATs/proxies and are dodged by rotating IPs.",
        "Distributed attacks from many IPs slip past per-client limits.",
      ],
    },
    realWorld:
      "Nearly every public API and login page has rate limiting; a 429 response is you hitting it. It's a standard mitigation against the brute-force and stuffing attacks that drive broken-authentication breaches, and a first line against abuse and cost blowups.",
    related: [
      {
        slug: "broken-auth",
        note: "The main brake on password guessing and credential stuffing.",
      },
      {
        slug: "rate-limiting",
        note: "The same mechanism viewed as an API design/traffic-shaping tool.",
      },
      {
        slug: "status-codes",
        note: "429 Too Many Requests is how a limit is signaled.",
      },
      {
        slug: "password-hashing",
        note: "Complementary — one slows guessing at the door, the other at storage.",
      },
      {
        slug: "high-availability",
        note: "Limiting abusive load helps keep the service up for everyone.",
      },
    ],
  },
];
