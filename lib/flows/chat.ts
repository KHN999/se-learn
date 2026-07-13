import type { Flow } from "@/lib/types";

// ---------------------------------------------------------------------------
// Flow: A real-time message
//
// The web request flow answers a question and closes the connection. Chat is
// the opposite shape: the interesting part is the server *pushing* to you when
// something happens elsewhere, with no request from your side at all. That one
// inversion is why this flow leans on persistent connections (WebSockets),
// durable storage, fan-out to many recipients, and push notifications for the
// people who aren't even online.
//
// Latencies are rough, order-of-magnitude figures for a healthy real-time
// system. They exist to show that delivery is dominated by the network hops,
// not the work in between.
// ---------------------------------------------------------------------------

export const chatFlow: Flow = {
  slug: "chat",
  title: "A real-time message",
  question: "You hit send — how does it appear on someone else's screen instantly?",
  summary:
    "You type a line and it shows up on your friend's screen a heartbeat later, even though you never touched their device. Behind that instant are two hard problems: the server has to reach out to people instead of waiting to be asked, and the message has to survive so nobody misses it. Follow it stop by stop — from your keyboard, across an always-open connection, into storage, and back out to everyone in the conversation.",
  outcome:
    "It appears on their screen almost instantly — and waits safely for anyone who was offline.",
  unit: "ms",
  stages: [
    {
      id: "compose",
      label: "You hit send",
      icon: "Send",
      oneLiner:
        "The app packages your text into a small message and shows it to you immediately.",
      problem:
        "The moment you press enter, you expect to see your own message right away — waiting for a network round trip before it appears would feel broken, even on a slow connection.",
      how: "The client bundles the text with a conversation id, a timestamp, and a client-generated id it made up locally. It renders the bubble instantly in a \"sending\" state (optimistic UI) and hands the message off to be sent. If confirmation comes back, the tick turns solid; if it fails, it can retry using that same id without creating a duplicate.",
      input: "The text you typed and the conversation you're in.",
      output: "A message object with a client id, ready to travel.",
      tradeoff:
        "Showing the message before the server confirms it feels fast, but you must reconcile later — handling the rare failure, and making sure a retry doesn't post the same line twice.",
      latencyMs: 2,
      related: [
        { label: "Optimistic UI", note: "Show the result now, confirm with the server after." },
        { label: "Idempotency keys", note: "The client id that stops a retry becoming a duplicate." },
      ],
    },
    {
      id: "socket",
      label: "WebSocket",
      icon: "Cable",
      oneLiner:
        "The message travels over an already-open WebSocket, not a fresh request each time.",
      problem:
        "Chat needs the server to push messages the instant they arrive, but plain HTTP only lets the client ask. To keep up you'd have to poll constantly — mostly asking \"anything new?\" and being told no.",
      how: "When the app loads it opens a WebSocket: one connection that starts as an HTTP request, then upgrades into a persistent, two-way channel. After that either side can send at any time with no new handshake, so your message goes up the pipe and incoming messages come down the same pipe.",
      input: "The message object from the client.",
      output: "The message streamed to the server over the open socket.",
      tradeoff:
        "Holding millions of connections open costs server memory and makes load balancing harder — and when a connection drops (phone sleeps, tunnel through a wall), the client has to notice and reconnect.",
      latencyMs: 15,
      related: [
        { label: "WebSockets", note: "The persistent, two-way connection this relies on." },
        { label: "Polling vs push", note: "Why asking repeatedly wastes work compared to being pushed to." },
        { label: "Heartbeats", note: "Small pings that detect a dead connection so it can reconnect." },
      ],
    },
    {
      id: "receive",
      label: "Server receives",
      icon: "Server",
      oneLiner:
        "A realtime server accepts the message, checks who you are, and validates it.",
      problem:
        "The server can't trust raw input from a socket. It has to confirm this connection really belongs to you, that you're allowed to post in this conversation, and that the message is well-formed — before it does anything permanent.",
      how: "The connection was authenticated when it opened (a token proves who you are), so the server already knows the sender. It checks you're a member of the conversation, sanitises the content, and stamps the message with a server-authoritative id and timestamp — the versions everyone else will trust over the client's guess.",
      input: "The raw message off the socket.",
      output: "A validated, authenticated message with a server id.",
      tradeoff:
        "Every hop of checking adds a little latency, but skipping it lets someone post as another user or into a room they're not in — the difference between a chat app and a security hole.",
      latencyMs: 8,
      related: [
        { label: "Authentication", note: "Proving the connection belongs to the claimed user." },
        { label: "Authorization", note: "Deciding whether that user may post in this conversation." },
        { label: "Input validation", note: "Rejecting malformed or malicious content early." },
      ],
    },
    {
      id: "persist",
      label: "Saved to store",
      icon: "Database",
      oneLiner:
        "The message is written to durable storage before it's delivered anywhere.",
      problem:
        "A message that only lives in memory vanishes if a server restarts, and can never be re-read — no scrollback, no history on a new device, no delivery to anyone who was offline. It has to survive.",
      how: "The server writes the message to a database, ordered within its conversation so history reads back in the right sequence. Persisting first, then delivering, means the stored copy is the source of truth: if delivery fails or the recipient reconnects later, they can always fetch what they missed.",
      input: "The validated message.",
      output: "A durably stored message with a confirmed order in the conversation.",
      tradeoff:
        "Writing before delivering adds a few milliseconds to every message, but it's what turns a fragile live stream into a reliable record — and at scale the chat history becomes one of the largest, fastest-growing datastores you own.",
      latencyMs: 25,
      related: [
        { label: "Durability", note: "Data that survives crashes and restarts." },
        { label: "Message ordering", note: "Keeping a conversation readable in the sequence it happened." },
        { label: "Write-then-fan-out", note: "Store the truth first, then push copies out." },
      ],
    },
    {
      id: "fanout",
      label: "Fan-out",
      icon: "Users",
      oneLiner:
        "The server works out everyone who should receive this message.",
      problem:
        "A message isn't for one person — it's for the whole conversation. In a group of fifty, one send has to become fifty deliveries, and each recipient may have several devices open at once.",
      how: "The server looks up the conversation's membership, then for each member finds which of their devices currently hold an open connection — and which don't. This split matters: online recipients get a live push, while everyone else needs a different path. Copying one message out to many recipients like this is called fan-out.",
      input: "The stored message and its conversation id.",
      output: "A recipient list, sorted into online connections and offline devices.",
      tradeoff:
        "Fan-out cost grows with group size: a message to a huge group multiplies into a huge number of deliveries, which is why very large broadcast-style rooms need a different design than small chats.",
      latencyMs: 10,
      related: [
        { label: "Fan-out", note: "Turning one write into many deliveries." },
        { label: "Presence", note: "Tracking who is online and on which device." },
        { label: "Group scale", note: "Why huge rooms can't fan out the same way small ones do." },
      ],
    },
    {
      id: "push-online",
      label: "Push to online",
      icon: "Radio",
      oneLiner:
        "The message is pushed straight down each online recipient's open connection.",
      problem:
        "The recipients who are online right now expect the message to just appear — no refresh, no polling. The server has to reach out to them, not wait for them to ask.",
      how: "For each online device, the server pushes the message down its already-open WebSocket. If recipients are spread across many realtime servers, an internal channel — often a pub/sub bus like Redis — relays the message to whichever server holds each connection, so a recipient on a different machine still gets it live.",
      input: "The message plus the list of online connections.",
      output: "The message streamed down to every connected recipient device.",
      tradeoff:
        "Pushing to a moving target is unreliable: a socket can die mid-send. The system needs delivery receipts and a way to resync, so a message the server thought it delivered isn't silently lost.",
      latencyMs: 20,
      related: [
        { label: "Pub/sub", note: "The internal bus that routes a message to the right server." },
        { label: "Delivery receipts", note: "Confirming a pushed message actually arrived." },
        { label: "Reconnect & resync", note: "Fetching anything missed while briefly disconnected." },
      ],
    },
    {
      id: "push-offline",
      label: "Offline push",
      icon: "Bell",
      oneLiner:
        "Recipients who are offline get a queued push notification instead of a live message.",
      problem:
        "You can't stream to a phone that's asleep or an app that's closed — there's no open connection to push down. But the person still needs to know a message arrived, and to see it when they come back.",
      how: "For offline recipients the server hands a notification to a platform push service (Apple's APNs, Google's FCM), which wakes the device and shows the banner. The full message stays safely in storage; when the app reopens it authenticates, reconnects its socket, and fetches everything it missed since it was last online.",
      input: "The message plus the list of offline devices.",
      output: "A queued push notification, and a message waiting in storage to be synced.",
      tradeoff:
        "Push services are best-effort and outside your control — notifications can be delayed, coalesced, or dropped — so they're a nudge, never the source of truth. Storage-plus-resync is what actually guarantees delivery.",
      latencyMs: 40,
      related: [
        { label: "APNs / FCM", note: "The OS push services that can wake a sleeping device." },
        { label: "Offline queue", note: "Messages held in storage until the recipient returns." },
        { label: "Best-effort delivery", note: "Why notifications can't be trusted to always arrive." },
      ],
    },
    {
      id: "render",
      label: "Recipient sees it",
      icon: "MessageSquare",
      oneLiner:
        "The recipient's app receives the message and draws it into the conversation.",
      problem:
        "The delivered message has to slot into the right conversation, in the right order, without duplicating anything the recipient already has — even if it arrived twice or out of sequence.",
      how: "The app receives the message off its socket (or fetches it on resync), dedupes it by its server id, inserts it into the conversation in timestamp order, and renders the bubble. It scrolls into view if the user is at the bottom, and sends a read receipt back so the sender's ticks turn blue.",
      input: "The delivered message.",
      output: "The new message on the recipient's screen, and a read receipt on its way back.",
      tradeoff:
        "Deduping and ordering on the client add complexity, but they're what stop the janky bugs users notice most — a doubled message, or one that lands in the wrong spot.",
      latencyMs: 12,
      related: [
        { label: "Deduplication", note: "Using the server id so a resent message isn't shown twice." },
        { label: "Read receipts", note: "Telling the sender their message was seen." },
        { label: "Client-side ordering", note: "Placing a late message where it belongs in the thread." },
      ],
    },
  ],
};
