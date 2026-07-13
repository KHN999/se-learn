import type { Flow } from "@/lib/types";

// ---------------------------------------------------------------------------
// Flow: What happens when you run a search query?
//
// Search is a matching problem wearing a ranking problem's clothes. Finding the
// documents that contain your words is the easy half — an index built ahead of
// time turns it into a lookup. The hard half is deciding which of thousands of
// matches you actually meant, and doing it fast enough that the results feel
// instant. Along the way the engine has to agree with itself about what a
// "word" even is, and refuse to show you things you're not allowed to see.
//
// Latencies are rough, order-of-magnitude figures. The lesson of the numbers:
// the lookup is cheap, the ranking is where the time goes, and the cache is how
// popular queries skip almost all of it.
// ---------------------------------------------------------------------------

export const searchFlow: Flow = {
  slug: "search",
  title: "A search query",
  question: "You type two words — how does it find and rank the right matches?",
  summary:
    "You type a couple of words and, before you've let go of the keyboard, a ranked list appears. Between the keystroke and the results, your query is cleaned up into a form the index understands, each term is looked up to find the documents that contain it, and those candidates are scored against each other so the best rise to the top — all filtered down to what you're allowed to see. Follow it stop by stop; each step trades some cost for speed or relevance.",
  outcome:
    "The most relevant results you're allowed to see — ranked, highlighted, and on screen in milliseconds.",
  unit: "ms",
  stages: [
    {
      id: "type-query",
      label: "You type a query",
      icon: "TextCursorInput",
      oneLiner:
        "You enter a few words and the raw text is handed to the search engine.",
      problem:
        "You know what you're looking for in your head, but the engine only receives a short, messy string — maybe with typos, odd capitalization, or extra spaces. Everything downstream depends on turning that raw text into something the index can match against.",
      how: "The search box captures exactly what you typed and sends it as the query. Many engines also add hints here — the language, any active filters, and sometimes as-you-type suggestions — but at its core this step just delivers a plain string of characters to be interpreted.",
      input: "The characters you typed into the search box.",
      output: "A raw query string, e.g. \"Red Shoes\".",
      tradeoff:
        "The raw string carries no meaning yet — capitalization, punctuation, and word forms are all still noise, which is exactly why the next step has to normalize before it can match anything reliably.",
      latencyMs: 4,
      related: [
        { label: "Autocomplete", note: "Suggests queries as you type, from popular past searches." },
        { label: "Query understanding", note: "Detecting intent, language, and entities behind the words." },
        { label: "Spell correction", note: "\"Did you mean\" fixes typos before they reach the index." },
      ],
    },
    {
      id: "normalize-tokenize",
      label: "Normalize & tokenize",
      icon: "Filter",
      oneLiner:
        "The query is lowercased, split into words, and reduced to root forms so it matches how documents were indexed.",
      problem:
        "\"Red Shoes\", \"red shoes\", and \"red shoe\" all mean the same thing to you, but as raw strings they're three different things. Unless the query and the documents are cleaned up in exactly the same way, matches will be missed for no good reason.",
      how: "The engine tokenizes the string — splitting it into individual terms — then normalizes each one: lowercasing, stripping punctuation, and often stemming or lemmatizing to a root (\"running\" and \"runs\" both become \"run\"). Very common words (\"the\", \"a\") may be dropped as stop words. Crucially, the identical pipeline was applied to every document when it was indexed, so the two sides speak the same language.",
      input: "The raw query string.",
      output: "A list of normalized terms, e.g. [\"red\", \"shoe\"].",
      tradeoff:
        "Aggressive stemming boosts recall but can blur meaning — collapsing \"universe\" and \"university\" to the same root — so the pipeline is a constant balance between matching more and matching wrongly.",
      latencyMs: 3,
      related: [
        { label: "Tokenization", note: "Splitting text into terms — harder for languages without spaces." },
        { label: "Stemming vs lemmatization", note: "Crude root-chopping versus dictionary-aware root forms." },
        { label: "Stop words", note: "Dropping ultra-common words to shrink the index and noise." },
      ],
    },
    {
      id: "inverted-index",
      label: "Look up the index",
      icon: "Hash",
      oneLiner:
        "Each normalized term is looked up in an inverted index to find which documents contain it.",
      problem:
        "Scanning every document in the collection for your words would be hopelessly slow once there are millions of them. You need to jump straight to the documents that contain each term instead of reading them all.",
      how: "An inverted index maps each term to a postings list — the set of documents that contain it — built ahead of time as documents are added. When your query arrives, the engine does a direct lookup for each term (\"red\" and \"shoe\") and pulls back their postings lists, rather than touching any document text.",
      input: "The list of normalized terms.",
      output: "One postings list per term — the documents containing each term.",
      tradeoff:
        "The index has to be built and kept current as documents change, costing storage and write work on every update — you pay at write time to make reads fast.",
      latencyMs: 8,
      related: [
        { label: "Inverted index", note: "Term to list-of-documents — the core structure of search." },
        { label: "Database indexes", note: "The same jump-straight-to-it idea, applied to text." },
        { label: "Elasticsearch / Lucene", note: "Engines built around the inverted index." },
      ],
    },
    {
      id: "gather-candidates",
      label: "Gather candidates",
      icon: "FileText",
      oneLiner:
        "The postings lists are combined into the set of documents worth scoring.",
      problem:
        "Each term on its own may match huge numbers of documents, but you almost certainly want the ones that match your words together. Something has to combine the per-term lists into a single candidate set before any ranking happens.",
      how: "The engine merges the postings lists according to the query logic — intersecting them for an AND (documents containing both \"red\" and \"shoe\"), or unioning for an OR. Because postings lists are stored in sorted order, this merge is fast, and the engine can skip ahead through long lists rather than reading every entry.",
      input: "The postings lists for each term.",
      output: "A candidate set of documents that satisfy the query.",
      tradeoff:
        "Strict AND matching keeps results tight but can return nothing for longer queries; loosening toward OR rescues recall at the cost of flooding in weakly related documents the ranker must then sort out.",
      latencyMs: 12,
      related: [
        { label: "Boolean retrieval", note: "AND / OR / NOT logic over the postings lists." },
        { label: "Postings list merge", note: "Intersecting sorted lists quickly by skipping ahead." },
        { label: "Recall vs precision", note: "Casting a wide net versus keeping only strong matches." },
      ],
    },
    {
      id: "score-rank",
      label: "Score & rank",
      icon: "ListOrdered",
      oneLiner:
        "Each candidate is scored for relevance and the documents are sorted best-first.",
      problem:
        "The candidate set can hold thousands of documents that all technically match. Handing them over in arbitrary order would be useless — you need the ones most likely to be what you meant at the very top.",
      how: "The engine assigns each candidate a relevance score using a ranking function such as TF-IDF or BM25: broadly, a term counts for more when it appears often in a document but is rare across the whole collection, with longer documents discounted so they don't win just by being big. Modern systems layer on extra signals — freshness, popularity, personalization, or a machine-learned model — then sort by the combined score.",
      input: "The candidate set of matching documents.",
      output: "The same documents, each with a relevance score, sorted best-first.",
      tradeoff:
        "Ranking is where most of the query's time is spent, and richer signals mean better results but slower, more complex scoring — so engines often rank in stages, cheaply cutting the field before an expensive model reranks only the survivors.",
      latencyMs: 45,
      related: [
        { label: "TF-IDF", note: "Rewards rare terms, discounts words that appear everywhere." },
        { label: "BM25", note: "The standard tuned successor to TF-IDF." },
        { label: "Learning to rank", note: "ML models that combine many relevance signals." },
      ],
    },
    {
      id: "filter-permissions",
      label: "Filter & permissions",
      icon: "ShieldCheck",
      oneLiner:
        "Results the user isn't allowed to see, or that don't match their filters, are removed.",
      problem:
        "A document can be a perfect textual match and still be one the user must never see — someone else's private file, a draft, a paid document. Relevance is not the same as permission, and showing a forbidden result even briefly is a leak.",
      how: "The engine applies filters and access checks against the ranked results: structured filters (price, date, category) narrow the set, while permission checks drop anything the user isn't authorized for. For speed this is often folded into retrieval itself — permissions and filter fields are indexed alongside the text so forbidden documents are excluded before scoring, not after.",
      input: "The ranked list of documents, plus the user's identity and active filters.",
      output: "A ranked list containing only documents this user may see.",
      tradeoff:
        "Filtering after ranking is simplest but wastes work scoring documents that get thrown away — and risks disclosing hidden results through counts or timing — so correctness pushes the check as early as possible, at the cost of a more complex index.",
      latencyMs: 10,
      related: [
        { label: "Access control", note: "Search must honor the same permissions as the rest of the app." },
        { label: "Faceted filtering", note: "Narrowing by structured fields like price or category." },
        { label: "Early vs late filtering", note: "Excluding during retrieval versus after ranking." },
      ],
    },
    {
      id: "cache",
      label: "Cache & return",
      icon: "Zap",
      oneLiner:
        "The top results are returned — and for popular queries, served straight from cache.",
      problem:
        "The most common queries are run over and over by different people, and repeating the full tokenize-lookup-rank-filter pipeline every single time is wasteful when the answer barely changes. Doing that work again for a query you just handled is pure overhead.",
      how: "The engine keeps only the top slice of results — the first page — and returns them rather than the entire ranked set. Popular queries are cached: the results (or intermediate pieces) are stored keyed on the normalized query, so a repeat request skips most of the pipeline and answers almost instantly. Caches carry a short expiry so results don't drift too far from the live index.",
      input: "The filtered, ranked results.",
      output: "The top results — freshly computed, or served from cache.",
      tradeoff:
        "Caching trades freshness for speed: a cached result can lag behind newly added or newly permitted documents, so cache lifetimes must be tuned per query and personalized results often can't be shared across users at all.",
      latencyMs: 6,
      related: [
        { label: "Result caching", note: "Reusing answers for repeated popular queries." },
        { label: "Pagination", note: "Returning one page at a time instead of every match." },
        { label: "Cache invalidation", note: "Deciding when a cached result has gone stale." },
      ],
    },
    {
      id: "highlight-render",
      label: "Highlight & render",
      icon: "MonitorPlay",
      oneLiner:
        "The matched terms are highlighted in each result and the page is drawn on screen.",
      problem:
        "A bare list of titles doesn't tell you why anything matched or which result to trust. You need to see your words in context — enough to scan the page and pick the right one without opening each in turn.",
      how: "For each result the engine builds a snippet: it locates where the query terms appear in the document, extracts the surrounding text, and marks the matched words so the browser can bold them. The client renders these snippets into the results list, and the page you see is the end of the pipeline.",
      input: "The top results and the original query terms.",
      output: "A rendered results page with matches highlighted in context.",
      tradeoff:
        "Generating good snippets means re-examining each document's text, which adds work right at the end — so snippets are built only for the handful of results actually shown, never for the whole candidate set.",
      latencyMs: 18,
      related: [
        { label: "Snippet generation", note: "Extracting the best matching passage to preview." },
        { label: "Highlighting", note: "Marking query terms so you see why a result matched." },
        { label: "Search analytics", note: "Which results get clicked feeds back into ranking." },
      ],
    },
  ],
};
