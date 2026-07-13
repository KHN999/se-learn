import type { Flow } from "@/lib/types";

// ---------------------------------------------------------------------------
// Flow: What happens when you log in?
//
// Login is the moment a stranger becomes a known user. It is a security story
// first and a plumbing story second: a secret travels across the network, is
// checked against something the server deliberately cannot reverse, and is
// then replaced by a portable proof of identity that rides along on every
// request that follows.
//
// Latencies are rough, order-of-magnitude figures. The one that looks "too
// slow" — password hashing — is slow on purpose, and that is the whole point.
// ---------------------------------------------------------------------------

export const loginFlow: Flow = {
  slug: "login",
  title: "Logging in",
  question: "Where does your password go, and how does the site remember you?",
  summary:
    "You type a password once, click a button, and from then on the site just knows who you are. Between that click and being recognized, your secret crosses the network, gets checked against something the server can't reverse, and is swapped for a token that travels with you. Follow it stop by stop — each step is a deliberate defense, and each one has a cost.",
  outcome:
    "You're logged in — and stay recognized on every request that follows, without ever re-sending your password.",
  unit: "ms",
  stages: [
    {
      id: "submit",
      label: "Submit credentials",
      icon: "Send",
      oneLiner:
        "The browser packages your email and password into a request and sends it to the server.",
      problem:
        "The server has no idea who you are yet. To prove your identity, you have to hand over something only you should know — your password — and the browser needs to deliver it in a form the server expects.",
      how: "When you click Sign in, the browser gathers the form fields and sends them in the body of an HTTPS POST request to a login endpoint. It uses POST, not GET, so the password lives in the request body rather than the URL, where it would otherwise be logged and bookmarked.",
      input: "The email and password you typed into the form.",
      output: "A POST request headed for the server's /login endpoint.",
      tradeoff:
        "The password now has to leave your device at all — which is exactly why every remaining step exists to protect it, and why passwordless methods try to avoid sending a reusable secret in the first place.",
      latencyMs: 5,
      related: [
        { label: "HTTP methods", note: "POST keeps the password out of the URL and server logs." },
        { label: "Password managers", note: "Fill the field so users can afford long, unique secrets." },
        { label: "Passwordless / passkeys", note: "Avoid sending a reusable secret across the wire." },
      ],
    },
    {
      id: "tls",
      label: "Encrypted in transit",
      icon: "Lock",
      oneLiner:
        "TLS wraps the request so no one between you and the server can read your password.",
      problem:
        "The request crosses networks you don't control — cafe wifi, your ISP, unknown routers. In plain text, your password would be readable by anyone on that path, and they could simply replay it.",
      how: "The connection is already secured by a TLS handshake: the server proved its identity with a certificate, and both sides derived a shared encryption key. The password travels as ciphertext and is decrypted only inside the server. The padlock in the address bar is this protection.",
      input: "The plaintext POST request from your browser.",
      output: "An encrypted byte stream only the real server can decrypt.",
      tradeoff:
        "TLS protects the password on the wire but not on either end — a compromised device or server still sees it in the clear, so encryption in transit is necessary but never sufficient.",
      latencyMs: 40,
      related: [
        { label: "TLS handshake", note: "How the encrypted channel is set up and the server authenticated." },
        { label: "Certificates & CAs", note: "Proof you're talking to the real site, not an impostor." },
        { label: "HSTS", note: "Forces HTTPS so the login can't be silently downgraded to plaintext." },
      ],
    },
    {
      id: "validate",
      label: "Validate & rate-limit",
      icon: "ShieldCheck",
      oneLiner:
        "The server checks the request is well-formed and refuses to let anyone guess passwords endlessly.",
      problem:
        "An attacker can send login attempts far faster than any human, trying millions of passwords or spraying one common password across many accounts. Without a limit, weak passwords fall in seconds.",
      how: "Before touching any secret, the endpoint validates the input shape and then consults a rate limiter keyed on IP, account, or both. Too many failures trigger backoff, temporary lockout, or a CAPTCHA. Responses stay deliberately vague — \"invalid email or password\" — so attackers can't tell which half was wrong.",
      input: "The decrypted login request.",
      output: "A request that has passed sanity and abuse checks, allowed to proceed.",
      tradeoff:
        "Aggressive limits frustrate real users who mistype, and can be weaponized to lock out a victim's account — so the thresholds are a constant balance between security and usability.",
      latencyMs: 8,
      related: [
        { label: "Brute-force & credential stuffing", note: "The attacks rate limiting is built to blunt." },
        { label: "CAPTCHA / bot detection", note: "Raises the cost of automated guessing." },
        { label: "Account enumeration", note: "Vague errors keep attackers from confirming which emails exist." },
      ],
    },
    {
      id: "verify",
      label: "Verify the password",
      icon: "KeyRound",
      oneLiner:
        "The server looks up the user and checks the password against a stored hash, never a stored password.",
      problem:
        "The server must confirm you know the password without ever keeping the password itself — because databases leak, and a leaked file of plaintext passwords would compromise every account instantly.",
      how: "At signup the password was run through a slow, salted hash (bcrypt, scrypt, or Argon2) and only that hash was stored. Now the server applies the same function to the submitted password and compares the results. The salt makes every hash unique, and the deliberate slowness makes mass guessing painfully expensive.",
      input: "The candidate password and the account's email.",
      output: "A yes/no: the password matches the stored hash, or it doesn't.",
      tradeoff:
        "Slow hashing is the defense and the cost at once — it adds real latency to every honest login, and the work factor must keep rising as hardware gets faster.",
      latencyMs: 120,
      related: [
        { label: "Salted hashing", note: "A per-user salt defeats precomputed rainbow tables." },
        { label: "bcrypt / Argon2", note: "Slow-by-design functions that make guessing expensive." },
        { label: "Constant-time compare", note: "Comparing hashes without leaking timing about the match." },
      ],
    },
    {
      id: "identity",
      label: "Establish identity",
      icon: "Fingerprint",
      oneLiner:
        "With the password confirmed, the server mints a credential that stands in for it from now on.",
      problem:
        "You proved who you are once, but HTTP forgets everything between requests. Re-sending the password on every click would be slow and reckless, so the server needs a reusable proof of identity that isn't the password.",
      how: "The server either creates a server-side session — a random unguessable ID pointing to your identity stored server-side — or issues a signed token (like a JWT) that carries your identity and is verified by signature. This may also be where a second factor is required before identity is considered fully established.",
      input: "A verified user, confirmed to own the account.",
      output: "A session ID or a signed token representing the logged-in user.",
      tradeoff:
        "Sessions are easy to revoke but require server-side lookup; self-contained tokens scale without lookups but are hard to cancel before they expire — a genuine architectural fork.",
      latencyMs: 15,
      related: [
        { label: "Sessions vs JWT", note: "Server-side state versus a self-contained signed token." },
        { label: "Two-factor auth (2FA)", note: "A second proof, so a stolen password isn't enough." },
        { label: "Token revocation", note: "The hard part of stateless tokens: cancelling them early." },
      ],
    },
    {
      id: "setcookie",
      label: "Return the cookie",
      icon: "Cookie",
      oneLiner:
        "The server sends the credential back to the browser, flagged so scripts and other sites can't steal it.",
      problem:
        "The browser needs to hold onto the proof of identity, but that proof is as good as the password now — if a rogue script or another site can read or reuse it, your account is theirs.",
      how: "The response carries a Set-Cookie header with the session ID or token. Protective flags do the heavy lifting: HttpOnly hides it from JavaScript, Secure restricts it to HTTPS, and SameSite limits when other sites can send it. Tokens are sometimes returned in the body for the app to store instead.",
      input: "The session ID or signed token from the server.",
      output: "A Set-Cookie response header travelling back to the browser.",
      tradeoff:
        "Cookies are automatic and convenient, but that automatic sending is exactly what enables CSRF — so the SameSite flag and anti-CSRF tokens exist to rein it back in.",
      latencyMs: 5,
      related: [
        { label: "HttpOnly & Secure", note: "Keep the cookie away from scripts and off plaintext connections." },
        { label: "SameSite / CSRF", note: "Controls cross-site sending to prevent forged requests." },
        { label: "localStorage vs cookies", note: "Where tokens live, and the XSS risk of each choice." },
      ],
    },
    {
      id: "store",
      label: "Store & attach",
      icon: "RefreshCw",
      oneLiner:
        "The browser saves the credential and automatically attaches it to every future request to the site.",
      problem:
        "Being logged in only matters if it persists. The next page, the next click, the next tab all need to carry the proof — without asking you to do anything.",
      how: "The browser writes the cookie into its cookie jar and, on every subsequent request to that domain, adds it back in a Cookie header without you lifting a finger. It stays until it expires or you log out, which is why closing a tab doesn't sign you out.",
      input: "The Set-Cookie header from the response.",
      output: "A stored cookie, auto-attached to each later request to the site.",
      tradeoff:
        "Longer-lived credentials mean fewer logins but a bigger prize if one is stolen — so real systems pair short access tokens with refresh tokens, or expiring sessions, to shrink that window.",
      latencyMs: 3,
      related: [
        { label: "Cookie expiry & sessions", note: "How long you stay signed in before re-authenticating." },
        { label: "Refresh tokens", note: "Renew a short-lived access token without a full re-login." },
        { label: "Logout & revocation", note: "Clearing the cookie and invalidating it server-side." },
      ],
    },
    {
      id: "recognized",
      label: "Recognized",
      icon: "Users",
      oneLiner:
        "On the next request the server reads the credential and treats you as logged in — no password needed.",
      problem:
        "Every request has to answer \"who is this, and what are they allowed to do?\" all over again, since HTTP itself remembers nothing between them.",
      how: "The server reads the cookie, then either looks up the session ID to find your identity or verifies the token's signature and expiry. If it checks out, the request runs as you, with your permissions. If it's missing, expired, or tampered with, you're bounced back to the login page.",
      input: "A later request carrying the stored cookie or token.",
      output: "A request handled as an authenticated, authorized user.",
      tradeoff:
        "Trusting the credential means a stolen one grants full access until it expires — so sensitive actions often re-prompt for the password or a second factor even while you're logged in.",
      latencyMs: 10,
      related: [
        { label: "Authentication vs authorization", note: "Knowing who you are versus what you may do." },
        { label: "Session hijacking", note: "The risk that a stolen credential impersonates you." },
        { label: "Step-up authentication", note: "Re-proving identity for high-stakes actions mid-session." },
      ],
    },
  ],
};
