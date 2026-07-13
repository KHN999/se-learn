import type { TopicContent } from "@/lib/topics";

export const batchC: TopicContent[] = [
  {
    slug: "git-model",
    tagline:
      "How Git actually stores history — snapshots, commits, and branches as pointers.",
    problem:
      "You have a folder of code and a familiar mess: project_final, project_final_v2, project_final_ACTUAL. You can't tell what changed between them, you can't safely undo one edit without risking the rest, and when a teammate emails you their copy you have to merge it by hand. You need a system that remembers every version, who made it and why, and lets several people work on the same files at once.",
    how: [
      {
        type: "para",
        text: "Git stores your project as a series of snapshots. Every time you commit, Git records the complete state of your tracked files and gives that snapshot an ID — a SHA hash computed from its contents. Each commit also points back to the commit (or commits) that came before it, so the history forms a chain: commit → parent → parent, all the way back to the first.",
      },
      {
        type: "para",
        text: "A branch is not a copy of your files. It is just a lightweight, movable label pointing at one commit. HEAD is another pointer that marks where you are right now. Creating a branch is instant because it only writes a new label; switching branches just moves HEAD and updates the files on disk to match that commit.",
      },
      {
        type: "points",
        items: [
          "Working directory: the files you actually edit.",
          "Staging area (index): the set of changes you've marked to go into the next commit.",
          "Repository: the committed history — the snapshots that are saved for good.",
          "Because a commit's ID comes from its content, history is tamper-evident: change anything and every later ID changes too.",
        ],
      },
      {
        type: "note",
        text: "The staging area is what trips up beginners. Editing a file does not put it in the next commit — you must 'git add' it first. This lets you commit some changes now and leave others for later.",
      },
    ],
    tradeoffs: {
      good: [
        "Complete, permanent history — you can inspect or return to any past state.",
        "Branching and switching are cheap, so experiments cost almost nothing.",
        "Content hashing makes corruption and tampering detectable.",
        "It's distributed: every clone is a full copy of the history, so there's no single point of failure.",
      ],
      costs: [
        "The mental model (working dir vs staging vs repo) is genuinely confusing at first.",
        "Rewriting history that others have pulled causes painful problems.",
        "Large binary files bloat the repo because every version is stored.",
        "The command-line interface is famously inconsistent and unforgiving.",
      ],
    },
    realWorld:
      "Almost every software team on earth uses Git. Understanding that a branch is just a pointer — not a folder full of files — is the single insight that makes the everyday commands stop feeling like magic.",
    related: [
      { slug: "git-everyday", note: "The commands you run on this model daily." },
      {
        slug: "branching-merging",
        note: "How branch pointers diverge and come back together.",
      },
      {
        slug: "tree",
        note: "Commit history is a directed graph of parent links, related to tree structures.",
      },
      { slug: "hash-map", note: "Commits are addressed by a content hash." },
    ],
  },
  {
    slug: "git-everyday",
    tagline:
      "The handful of commands that make up 95% of your daily Git usage.",
    problem:
      "You've made some changes and you want them saved and shared with your team. But Git has dozens of commands and cryptic error messages, and you're not sure which few you actually need to get through a normal workday without breaking anything. What's the minimal loop?",
    how: [
      {
        type: "para",
        text: "The daily loop is small: check what's changed, stage the changes you want, commit them with a message, then sync with the shared server. Most days you never touch the more advanced commands at all.",
      },
      {
        type: "points",
        items: [
          "git status — see what's changed and what's staged. Run it constantly.",
          "git add <file> — stage changes for the next commit (git add -p to stage piece by piece).",
          "git commit -m 'message' — save the staged changes as a snapshot with a description.",
          "git pull — fetch and integrate others' commits from the remote.",
          "git push — send your commits to the remote so others can see them.",
        ],
      },
      {
        type: "para",
        text: "Two more save you regularly: 'git log' shows the history so you can see what happened, and 'git diff' shows the exact lines you've changed but not yet committed. Getting into the habit of reading status and diff before every commit prevents most mistakes.",
      },
      {
        type: "note",
        text: "Write commit messages for the person reading them in six months — usually a future you. 'Fix bug' is useless; 'Fix crash when cart is empty' tells the story.",
      },
    ],
    tradeoffs: {
      good: [
        "The core loop is only about five commands.",
        "Small, frequent commits make history easy to read and mistakes easy to undo.",
        "Everything is local until you push, so you can work offline.",
      ],
      costs: [
        "Easy to fall into bad habits: giant commits, vague messages, committing secrets.",
        "'git pull' can surprise you with merge conflicts at the worst time.",
        "Undoing things (reset vs revert vs checkout) is a separate skill that takes practice.",
      ],
    },
    realWorld:
      "This is the rhythm of a working developer: pull in the morning, make small commits through the day, push when a piece is done. Almost everything else in Git is something you reach for occasionally.",
    related: [
      { slug: "git-model", note: "The snapshot-and-pointer model these commands act on." },
      { slug: "branching-merging", note: "Where your commits usually go before they reach main." },
      { slug: "pull-requests-review", note: "How pushed work gets reviewed and merged." },
      { slug: "conflict-resolution", note: "What to do when a pull won't merge cleanly." },
    ],
  },
  {
    slug: "branching-merging",
    tagline:
      "Working on a change in isolation, then folding it back into the main line.",
    problem:
      "You need to build a new feature, but you can't just edit the live codebase directly — half-finished work would break things for everyone, and if an urgent bug comes in you'd have no clean version to fix. You want a private line of development where you can commit freely, then combine it with everyone else's work when it's ready.",
    how: [
      {
        type: "para",
        text: "A branch is a separate line of commits that starts from some point in history. You create one, commit to it as much as you like, and the main branch is untouched the whole time. When the work is done, you merge the branch back in, combining its commits with whatever else has landed on main since you started.",
      },
      {
        type: "para",
        text: "There are two kinds of merge. If main hasn't moved since your branch split off, Git does a fast-forward — it just slides the main pointer up to your latest commit, no new work needed. If both branches have new commits, Git performs a three-way merge: it looks at your branch, the target branch, and their common ancestor, and creates a new merge commit that ties the two histories together.",
      },
      {
        type: "points",
        items: [
          "Fast-forward: target hasn't diverged; the pointer just moves forward.",
          "Three-way merge: both sides advanced; a merge commit joins them, preserving both histories.",
          "A conflict happens only when both sides changed the same lines — Git can't guess which to keep.",
        ],
      },
      {
        type: "note",
        text: "Short-lived branches are healthier than long ones. The longer a branch lives, the more main drifts away from it, and the bigger and scarier the eventual merge becomes.",
      },
    ],
    tradeoffs: {
      good: [
        "Isolation: unfinished or risky work never destabilizes the main line.",
        "Many people can work in parallel on the same repo without stepping on each other.",
        "Merge commits preserve the true history of when things branched and joined.",
      ],
      costs: [
        "Long-lived branches drift apart and produce painful merges.",
        "A history full of merge commits can be noisy and hard to read linearly.",
        "Overlapping edits still produce conflicts you have to resolve by hand.",
      ],
    },
    realWorld:
      "Most teams use a branch per feature or bug fix: branch off main, do the work, open a pull request, merge back. 'Merge hell' — a huge, conflict-ridden merge — is almost always the symptom of a branch that lived too long.",
    related: [
      { slug: "git-model", note: "Branches are just pointers into the commit graph." },
      { slug: "rebase", note: "An alternative to merging that rewrites history into a straight line." },
      { slug: "conflict-resolution", note: "What you do when a merge overlaps." },
      { slug: "pull-requests-review", note: "The usual gate before a branch merges to main." },
    ],
  },
  {
    slug: "rebase",
    tagline:
      "Replaying your commits on top of the latest main to keep history linear.",
    problem:
      "You branched off main a week ago and did five commits. Meanwhile main got ten new commits. If you merge, your history gets a tangled web of merge commits that's hard to read. What if you could pretend you'd started your work from today's main all along, so your five commits sit cleanly on top?",
    how: [
      {
        type: "para",
        text: "Rebase takes your branch's commits, sets them aside, moves your branch to the tip of the target (usually main), and then reapplies your commits one by one on top. The result is a straight line: main's history, then your commits, as if you'd written them last. There's no merge commit.",
      },
      {
        type: "para",
        text: "Crucially, rebasing does not move your original commits — it creates new ones with new IDs (because their parent changed, and the ID depends on the parent). The old commits are abandoned. This is why the golden rule exists: never rebase commits that others have already pulled, because you'd be rewriting shared history out from under them.",
      },
      {
        type: "points",
        items: [
          "git rebase main — replay the current branch's commits onto the tip of main.",
          "Interactive rebase (git rebase -i) lets you squash, reorder, edit, or drop commits before they land.",
          "Conflicts are resolved one commit at a time, then 'git rebase --continue'.",
        ],
      },
      {
        type: "note",
        text: "The rule of thumb: rebase your own private branch to tidy it up before sharing; merge when combining work others depend on. Rewriting public history is how you make teammates hate you.",
      },
    ],
    tradeoffs: {
      good: [
        "Produces a clean, linear, easy-to-read history with no merge-commit noise.",
        "Interactive rebase lets you polish messy work-in-progress commits before review.",
        "Makes tools like 'git bisect' and 'git log' easier to reason about.",
      ],
      costs: [
        "Rewrites history — dangerous on any branch others share.",
        "You may resolve the same conflict repeatedly, once per replayed commit.",
        "It hides the real chronology of when work actually happened.",
        "More conceptually demanding and easier to misuse than a plain merge.",
      ],
    },
    realWorld:
      "A common team convention: rebase your feature branch onto the latest main just before opening or updating a pull request, so it applies cleanly and reviewers see a tidy series of commits.",
    related: [
      { slug: "branching-merging", note: "The alternative approach that preserves both histories." },
      { slug: "conflict-resolution", note: "Rebasing surfaces conflicts commit by commit." },
      { slug: "git-model", note: "Rebase works by creating new commits with new parent links." },
      { slug: "git-everyday", note: "Where rebase fits into the daily push/pull rhythm." },
    ],
  },
  {
    slug: "conflict-resolution",
    tagline:
      "Deciding what the code should be when two people changed the same lines.",
    problem:
      "You finish your feature and try to merge. Git stops and reports a conflict: you and a teammate both edited the same function in the same file, in different ways. Git refuses to guess which version is right — it has put both versions into the file, marked with strange <<<<<<< symbols, and it's now your job to sort out.",
    how: [
      {
        type: "para",
        text: "A conflict happens only when the same lines were changed on both sides of a merge or rebase. Git can automatically combine changes to different parts of a file; it only gives up when the edits overlap. It marks the disputed region so you can see both versions and choose.",
      },
      {
        type: "points",
        items: [
          "<<<<<<< HEAD marks the start of your current branch's version.",
          "======= separates the two versions.",
          ">>>>>>> branch-name marks the end of the incoming version.",
          "You edit the region to the correct final result, delete the markers, then 'git add' the file.",
        ],
      },
      {
        type: "para",
        text: "Resolving a conflict is a judgment call, not a mechanical merge. Sometimes you keep yours, sometimes theirs, and often you write a new version combining both intents. After fixing every conflicted file and staging them, you complete the merge (or run 'git rebase --continue'). Always re-run the tests afterward — a conflict resolution that compiles can still be logically wrong.",
      },
      {
        type: "note",
        text: "The best conflict is the one that never happens. Small, frequent merges and short-lived branches keep changes small and overlaps rare. Merge tools and 'git diff' help, but nothing beats not letting branches drift for weeks.",
      },
    ],
    tradeoffs: {
      good: [
        "Forces a human to make the correct decision instead of silently losing someone's work.",
        "Conflicts are localized to exactly the overlapping lines, not the whole file.",
        "Resolving them is a normal, learnable part of collaboration.",
      ],
      costs: [
        "Manual, error-prone, and stressful under deadline pressure.",
        "A wrong resolution can silently reintroduce a bug or drop a needed change.",
        "Large or long-lived branches can produce dozens of conflicts at once.",
        "During a rebase you may hit the same conflict repeatedly.",
      ],
    },
    realWorld:
      "Every developer who collaborates hits conflicts regularly. The fear of them is why teams favor small pull requests merged often — it keeps each conflict tiny and understandable instead of a giant tangle.",
    related: [
      { slug: "branching-merging", note: "Merging is where most conflicts surface." },
      { slug: "rebase", note: "Rebasing resolves conflicts one commit at a time." },
      { slug: "git-everyday", note: "A 'git pull' is the usual moment a conflict appears." },
      { slug: "pull-requests-review", note: "PRs often must be conflict-free before merging." },
    ],
  },
  {
    slug: "pull-requests-review",
    tagline:
      "Proposing a change and having a human read it before it reaches main.",
    problem:
      "A teammate could push code straight to main that breaks the build, ignores a security check, or is simply hard to understand — and nobody would notice until it's live. You want a checkpoint: a place where a change is proposed, discussed, and approved before it becomes part of the shared codebase.",
    how: [
      {
        type: "para",
        text: "A pull request (PR) is a proposal to merge one branch into another. You push your feature branch, open a PR against main, and it shows the exact diff of what you're changing. Teammates read it, leave comments on specific lines, ask questions, and request changes. You push follow-up commits to address feedback, and once someone approves, the branch is merged.",
      },
      {
        type: "points",
        items: [
          "The PR shows the full diff, so reviewers see precisely what changes.",
          "Automated checks (tests, linters, builds) usually run and must pass before merge.",
          "Reviewers comment inline; the author responds with discussion or new commits.",
          "Branch protection can require approvals and green checks before merge is allowed.",
        ],
      },
      {
        type: "para",
        text: "Code review is as much about the humans as the code. It spreads knowledge (now two people understand this change), catches bugs early, and enforces shared standards. Good reviews are specific and kind; good PRs are small enough to actually review — a 2000-line PR gets a rubber-stamp, a 100-line PR gets real scrutiny.",
      },
      {
        type: "note",
        text: "Keep PRs small and focused on one thing. Reviewer attention is a finite resource: the larger the diff, the less carefully each line gets read.",
      },
    ],
    tradeoffs: {
      good: [
        "Catches bugs, security issues, and design problems before they reach main.",
        "Spreads knowledge across the team — no code is understood by only one person.",
        "Enforces consistent style and standards through discussion.",
        "Creates a written record of why a change was made.",
      ],
      costs: [
        "Reviews add latency — work waits on someone else's attention.",
        "Large PRs get shallow, rubber-stamp reviews that catch little.",
        "Can become a bottleneck or a venue for bikeshedding and ego.",
        "Quality depends entirely on reviewers actually engaging.",
      ],
    },
    realWorld:
      "On platforms like GitHub and GitLab, the PR (or merge request) is the central unit of collaboration. Most teams require at least one approval and passing CI before anything merges to main — it's the everyday gate your work passes through.",
    related: [
      { slug: "branching-merging", note: "A PR is the request to merge a branch." },
      { slug: "git-everyday", note: "You push a branch, then open a PR from it." },
      { slug: "ci-cd", note: "Automated checks that run on every PR before merge." },
      { slug: "conflict-resolution", note: "PRs usually must be conflict-free to merge." },
      { slug: "why-testing", note: "Tests are what CI runs to gate the PR." },
    ],
  },
  {
    slug: "tables-schema",
    tagline:
      "Deciding the columns, types, and structure your data must fit into.",
    problem:
      "You're storing users, and you start with a spreadsheet: one row per person, columns for name and email. But then some rows have three phone numbers crammed in one cell, one person's age is 'thirty-ish', and half the emails are missing. Without any rules about what a row must look like, the data rots. You need a structure that enforces shape.",
    how: [
      {
        type: "para",
        text: "A table is a set of rows, and every row has the same columns. Each column has a fixed data type — INTEGER, TEXT, TIMESTAMP, BOOLEAN — and the database rejects anything that doesn't fit. The schema is this whole definition: the tables, their columns, the types, and the constraints that keep data valid.",
      },
      {
        type: "points",
        items: [
          "Data types: the database refuses to store text where a number belongs.",
          "NOT NULL: this column must always have a value.",
          "UNIQUE: no two rows may share this value (e.g. one account per email).",
          "PRIMARY KEY: the column that uniquely identifies each row.",
          "DEFAULT: a value to use when none is given (e.g. created_at = now).",
        ],
      },
      {
        type: "para",
        text: "Designing the schema is deciding what shape your data has to be before you store any of it. This is the trade at the heart of relational databases: you pay up front by defining structure, and in return the database guarantees every row obeys it. Bad or missing data is rejected at the door rather than discovered later.",
      },
      {
        type: "note",
        text: "Schemas change over time — you add columns, change types. These changes are called migrations, and they must be applied carefully to a live database that already holds data.",
      },
    ],
    tradeoffs: {
      good: [
        "Guarantees every row has a known, valid shape — no surprises when you read.",
        "Constraints catch bad data at write time, before it spreads.",
        "A clear schema documents what the data means for everyone.",
        "The query planner uses the schema to run queries efficiently.",
      ],
      costs: [
        "You must design the structure up front, before you fully know the data.",
        "Changing the schema on a large live table (a migration) can be slow and risky.",
        "Rigid structure fits awkwardly around data that's genuinely irregular.",
      ],
    },
    realWorld:
      "Every relational database starts with schema design — the tables and columns are the foundation everything else queries against. Getting it roughly right early saves painful migrations later; getting it badly wrong means reshaping data you already depend on.",
    related: [
      { slug: "foreign-keys", note: "Constraints that link one table's rows to another's." },
      { slug: "normalization", note: "How to split data across tables to avoid duplication." },
      { slug: "insert-update-delete", note: "How rows enter and change within the schema." },
      { slug: "select-where", note: "How you read the rows back out." },
      { slug: "sql-vs-nosql", note: "The alternative of storing data without a fixed schema." },
    ],
  },
  {
    slug: "select-where",
    tagline:
      "Asking the database for exactly the rows you want, in the order you want.",
    problem:
      "Your orders table has a million rows, but right now you only care about one customer's unpaid orders from this month, newest first. You don't want the whole table dumped on you — you want the database to filter it down and sort it before it ever reaches your code. How do you describe precisely which rows you mean?",
    how: [
      {
        type: "para",
        text: "SELECT declares which columns you want. FROM names the table. WHERE filters the rows to only those matching a condition. ORDER BY sorts the result. You describe what you want, not how to fetch it — the database figures out the efficient way to get there.",
      },
      {
        type: "points",
        items: [
          "SELECT name, total — choose columns (SELECT * grabs all, handy but wasteful).",
          "WHERE status = 'unpaid' AND total > 100 — combine conditions with AND / OR.",
          "ORDER BY created_at DESC — sort, newest first.",
          "LIMIT 20 — return only the first N rows (essential for pagination).",
        ],
      },
      {
        type: "para",
        text: "The key idea is that SQL is declarative. You state the result you want and the database's query planner decides the strategy — which index to use, what order to apply filters. This is why an index on the WHERE column matters so much: it's what lets the planner skip the full-table scan and jump to the matching rows.",
      },
      {
        type: "note",
        text: "Never build a WHERE clause by pasting user input into the query string. That's how SQL injection happens. Use parameterized queries, where the value is sent separately from the query text.",
      },
    ],
    tradeoffs: {
      good: [
        "Declarative: you say what you want, the database optimizes how.",
        "Filtering and sorting happen in the database, close to the data, not in your app.",
        "The same query works whether the table has ten rows or ten million.",
      ],
      costs: [
        "A WHERE on an unindexed column forces a full table scan — slow at scale.",
        "SELECT * pulls columns you don't need, wasting bandwidth and memory.",
        "Sorting a huge unindexed result set is expensive.",
        "Naive string-building queries open the door to SQL injection.",
      ],
    },
    realWorld:
      "This is the most-run kind of query in almost every application — every page that shows a list of anything is a SELECT with a WHERE and probably an ORDER BY and LIMIT behind it.",
    related: [
      { slug: "indexes", note: "What makes a WHERE or ORDER BY fast at scale." },
      { slug: "query-planning", note: "Decides how your SELECT is actually executed." },
      { slug: "joins", note: "How you pull related rows from multiple tables in one query." },
      { slug: "sql-injection", note: "The attack that unsanitized WHERE clauses enable." },
      { slug: "group-by", note: "Aggregating the rows a WHERE selects." },
    ],
  },
  {
    slug: "insert-update-delete",
    tagline:
      "Adding, changing, and removing rows — the writes that change your data.",
    problem:
      "A customer places an order (a new row must appear), then changes the shipping address (an existing row must change), then cancels (a row must go away). Each of these is a write, and each one can go wrong — you could update every row instead of one, or delete data you can't get back. How do you change data precisely and safely?",
    how: [
      {
        type: "para",
        text: "Three statements cover writes. INSERT adds new rows. UPDATE changes values in rows that match a condition. DELETE removes rows that match a condition. UPDATE and DELETE both take a WHERE clause, and that clause is everything: it decides which rows are affected.",
      },
      {
        type: "points",
        items: [
          "INSERT INTO orders (customer_id, total) VALUES (7, 99.00) — add a row.",
          "UPDATE orders SET address = '...' WHERE id = 42 — change one specific row.",
          "DELETE FROM orders WHERE id = 42 — remove one specific row.",
          "Forget the WHERE on an UPDATE or DELETE and you hit every row in the table.",
        ],
      },
      {
        type: "para",
        text: "The classic disaster is 'UPDATE orders SET status = shipped' with no WHERE — every order in the system just got marked shipped. Because writes are hard to undo, wrap risky multi-step changes in a transaction, so either all of them happen or none do, and you can roll back if something looks wrong.",
      },
      {
        type: "note",
        text: "Many systems prefer a 'soft delete' — a deleted_at column — over a real DELETE, so the data isn't truly gone and can be recovered or audited.",
      },
    ],
    tradeoffs: {
      good: [
        "Precise: a WHERE clause targets exactly the rows you mean.",
        "Wrapped in a transaction, a batch of writes is all-or-nothing.",
        "Constraints (NOT NULL, UNIQUE, foreign keys) reject invalid writes automatically.",
      ],
      costs: [
        "A missing or wrong WHERE can corrupt or destroy huge amounts of data.",
        "DELETE is usually irreversible without a backup.",
        "Every write must also update every index on the table, costing time.",
        "Concurrent writes to the same rows can block each other or deadlock.",
      ],
    },
    realWorld:
      "Every 'save', 'edit', and 'delete' button in an app ultimately runs one of these. The habit of writing the WHERE clause first — and running a SELECT with it to preview which rows you'll hit — has saved countless engineers from a data catastrophe.",
    related: [
      { slug: "transactions-acid", note: "Making a group of writes all-or-nothing." },
      { slug: "select-where", note: "The same WHERE that filters reads targets writes." },
      { slug: "indexes", note: "Every write must keep the table's indexes in sync." },
      { slug: "locks", note: "Concurrent writes contend for locks on the same rows." },
      { slug: "foreign-keys", note: "Constraints that can block a delete or insert." },
    ],
  },
  {
    slug: "joins",
    tagline:
      "Combining rows from two tables that are linked by a shared value.",
    problem:
      "Your orders table stores a customer_id, not the customer's name — that lives in the customers table. To show 'Order #42, placed by Alice', you need data from both tables at once. You could query orders, then run a second query for each customer, but that's slow and clumsy. How do you stitch related rows together in a single query?",
    how: [
      {
        type: "para",
        text: "A JOIN matches rows from two tables using a condition — usually that a column in one equals a column in the other, like orders.customer_id = customers.id. For each matching pair, the database produces one combined row containing columns from both tables.",
      },
      {
        type: "points",
        items: [
          "INNER JOIN: keep only rows that have a match on both sides.",
          "LEFT JOIN: keep all rows from the left table; fill in NULLs where the right has no match.",
          "RIGHT JOIN: the mirror image — keep all of the right table.",
          "The ON clause defines what 'matching' means (usually a key equals a key).",
        ],
      },
      {
        type: "para",
        text: "The choice between INNER and LEFT is a real decision. INNER JOIN of orders and customers drops any order whose customer was deleted; LEFT JOIN keeps every order and leaves the customer columns NULL. Getting this wrong silently loses or invents rows. Joins are also where indexes matter enormously — joining on an unindexed column forces the database to scan.",
      },
      {
        type: "note",
        text: "A JOIN in the database usually beats fetching a list and then querying each item's details in a loop. That loop is the N+1 problem — one query becomes hundreds. One join does the whole job at once.",
      },
    ],
    tradeoffs: {
      good: [
        "Combine data from many tables in a single, efficient query.",
        "Lets you normalize (store each fact once) without paying at read time.",
        "The database optimizes the join far better than a hand-written loop of queries.",
      ],
      costs: [
        "Joining on unindexed columns is slow — it can scan whole tables.",
        "Many-table joins get hard to read and reason about.",
        "Choosing INNER vs LEFT wrongly silently drops or duplicates rows.",
        "Joins across huge tables can be memory- and CPU-heavy.",
      ],
    },
    realWorld:
      "Joins are the everyday tool for reading normalized data — nearly any report or list that mixes information from two entities is a join. They're also the first thing to check when a query is slow: an un-indexed join column is a classic cause.",
    related: [
      { slug: "foreign-keys", note: "The links between tables that joins follow." },
      { slug: "normalization", note: "Splits data into tables that joins reassemble." },
      { slug: "indexes", note: "What keeps join conditions fast." },
      { slug: "n-plus-1", note: "The looped-query anti-pattern a join avoids." },
      { slug: "select-where", note: "Joins extend the basic SELECT to multiple tables." },
    ],
  },
  {
    slug: "group-by",
    tagline:
      "Collapsing many rows into per-group summaries — counts, sums, averages.",
    problem:
      "You have a million individual sales rows, but the question is 'how much revenue did each region make last month?' You don't want a million rows back — you want one number per region. You need to fold all the rows of a group down into a single summary value.",
    how: [
      {
        type: "para",
        text: "GROUP BY partitions rows into groups that share a value — one group per region, say. Then an aggregate function collapses each group into a single value: COUNT how many, SUM the totals, AVG the average, MIN and MAX the extremes. The result has one row per group instead of one per original row.",
      },
      {
        type: "points",
        items: [
          "SELECT region, SUM(amount) FROM sales GROUP BY region — revenue per region.",
          "COUNT(*), AVG(x), MIN(x), MAX(x) — the common aggregates.",
          "Every non-aggregated column in the SELECT must appear in GROUP BY.",
          "HAVING filters groups after aggregation; WHERE filters rows before it.",
        ],
      },
      {
        type: "para",
        text: "The WHERE-versus-HAVING distinction matters. WHERE runs first and throws out individual rows before grouping (e.g. only this month's sales). HAVING runs after and throws out whole groups based on their aggregate (e.g. only regions with SUM(amount) > 10000). Using them in the right order is both a correctness and a performance question.",
      },
      {
        type: "note",
        text: "GROUP BY often needs to sort or hash all the rows to form groups, which is why aggregating a large table can be slow — and why it benefits from an index on the grouped column.",
      },
    ],
    tradeoffs: {
      good: [
        "Turns millions of rows into a handful of meaningful summary numbers.",
        "The heavy lifting happens in the database, not in your application code.",
        "Combines naturally with joins to summarize across related tables.",
      ],
      costs: [
        "Grouping a large table can require an expensive sort or hash.",
        "The WHERE/HAVING ordering trips people up and can change results.",
        "Every non-aggregated column must be in GROUP BY, which surprises beginners.",
      ],
    },
    realWorld:
      "Every dashboard, analytics report, and 'total by category' view is a GROUP BY under the hood. It's the bridge between raw transactional rows and the summarized numbers a business actually looks at.",
    related: [
      { slug: "select-where", note: "WHERE filters rows before they're grouped." },
      { slug: "joins", note: "Often combined to aggregate across related tables." },
      { slug: "indexes", note: "An index on the grouped column can speed aggregation." },
      { slug: "query-planning", note: "Decides whether to sort or hash to form the groups." },
    ],
  },
  {
    slug: "foreign-keys",
    tagline:
      "A rule that a value in one table must point to a real row in another.",
    problem:
      "Your orders table has a customer_id column. Nothing stops someone from inserting an order with customer_id = 9999 when no such customer exists — now you have an order belonging to a ghost. Later a customer is deleted, but their orders remain, pointing at nothing. How do you make the database guarantee these links stay valid?",
    how: [
      {
        type: "para",
        text: "A foreign key is a constraint declaring that a column's values must match an existing value in another table — usually that table's primary key. Once orders.customer_id is a foreign key referencing customers.id, the database rejects any order whose customer_id doesn't correspond to a real customer. The relationship is enforced, not just hoped for.",
      },
      {
        type: "points",
        items: [
          "Insert is blocked if the referenced row doesn't exist.",
          "By default, deleting a referenced row is blocked while children point to it.",
          "ON DELETE CASCADE: delete the parent and its children go too.",
          "ON DELETE SET NULL: delete the parent and children's link becomes NULL.",
        ],
      },
      {
        type: "para",
        text: "Foreign keys are what make 'referential integrity' real — the promise that every reference points to something that exists. They're also the natural columns to join on and, in many databases, deserve an index so those joins and the constraint checks stay fast.",
      },
      {
        type: "note",
        text: "The cascade behavior is a decision with teeth. ON DELETE CASCADE is convenient but can wipe out large amounts of related data from a single delete — make sure that's what you want.",
      },
    ],
    tradeoffs: {
      good: [
        "The database guarantees links are valid — no orphaned or dangling references.",
        "Documents the relationships between tables explicitly.",
        "Cascade rules automate cleanup of dependent rows.",
        "Foreign key columns are the natural, indexable join targets.",
      ],
      costs: [
        "Every insert and delete pays for a constraint check, slowing writes a little.",
        "Constraints can block operations in ways that surprise you mid-task.",
        "CASCADE can delete far more than you intended if you're not careful.",
        "They add coupling that can complicate sharding a database across machines.",
      ],
    },
    realWorld:
      "Foreign keys are how a relational schema stays trustworthy over years of writes. Some high-scale systems deliberately drop them and enforce integrity in application code instead, trading the safety guarantee for write speed and easier sharding.",
    related: [
      { slug: "tables-schema", note: "Foreign keys are part of the schema definition." },
      { slug: "joins", note: "You typically join tables on their foreign keys." },
      { slug: "normalization", note: "The design that splits data into tables linked by keys." },
      { slug: "insert-update-delete", note: "The writes these constraints guard." },
      { slug: "sharding", note: "Cross-table keys complicate splitting data across machines." },
    ],
  },
  {
    slug: "sql-vs-nosql",
    tagline:
      "Choosing between a rigid, relational store and a flexible, scalable one.",
    problem:
      "You're starting a new project and have to pick a database. One camp swears by PostgreSQL and tables; another insists you'll need MongoDB or a key-value store to 'scale'. The advice is contradictory and mostly cargo-cult. What actually differs between these two families, and which fits the problem in front of you?",
    how: [
      {
        type: "para",
        text: "SQL (relational) databases store data in tables with a fixed schema and connect them with joins and foreign keys. They're built around strong consistency and transactions: the classic ACID guarantees. NoSQL is an umbrella for everything else — document stores, key-value stores, wide-column, graph — that trade some of that rigidity for flexibility or horizontal scale.",
      },
      {
        type: "points",
        items: [
          "Relational (Postgres, MySQL): fixed schema, joins, ACID transactions, strong consistency.",
          "Document (MongoDB): flexible JSON-like documents, no enforced schema.",
          "Key-value (Redis, DynamoDB): dead-simple, extremely fast lookups by key.",
          "Search/analytics (Elasticsearch): built for full-text search and aggregation.",
        ],
      },
      {
        type: "para",
        text: "The honest default is relational. Decades of tooling, real transactions, and the query planner's ability to join arbitrary data make SQL a safe, powerful choice for most applications. Reach for NoSQL when you have a specific reason: massive write scale beyond one machine, genuinely schemaless data, a caching layer that needs microsecond lookups, or full-text search. 'It'll scale better' is not a reason on its own.",
      },
      {
        type: "note",
        text: "It's not either/or. Real systems commonly run Postgres as the source of truth, Redis as a cache, and Elasticsearch for search — each database doing the one thing it's best at.",
      },
    ],
    tradeoffs: {
      good: [
        "SQL: strong consistency, transactions, joins, and mature tooling.",
        "NoSQL document stores: flexible schema that evolves without migrations.",
        "NoSQL key-value/wide-column: horizontal scale and very high throughput.",
        "You can combine several, each handling what it's best at.",
      ],
      costs: [
        "SQL scales up more easily than out — sharding it is hard.",
        "NoSQL often gives up joins, transactions, or strong consistency.",
        "Schemaless flexibility pushes data-validation work into your application.",
        "Picking NoSQL for the wrong reason ('scale') buys complexity you don't need.",
      ],
    },
    realWorld:
      "This decision comes up at the start of most projects, and the common mistake is choosing NoSQL for scale you'll never reach while giving up transactions you'll miss on day one. Start relational unless you can name the specific need something else solves.",
    related: [
      { slug: "tables-schema", note: "The rigid structure SQL enforces and NoSQL relaxes." },
      { slug: "transactions-acid", note: "The consistency guarantee SQL is built around." },
      { slug: "mongodb", note: "The most common document-oriented NoSQL store." },
      { slug: "redis", note: "The archetypal key-value store." },
      { slug: "sharding", note: "The scaling approach NoSQL leans on and SQL struggles with." },
    ],
  },
  {
    slug: "mongodb",
    tagline:
      "A document database that stores flexible JSON-like records instead of rows.",
    problem:
      "Your product catalog is a mess for a relational schema: books have page counts, shirts have sizes and colors, electronics have voltage and warranty terms. Forcing them all into one wide table full of mostly-NULL columns — or a dozen joined tables — feels wrong. What if you could just store each product as the shape it naturally has?",
    how: [
      {
        type: "para",
        text: "MongoDB stores documents — nested, JSON-like structures (technically BSON) — grouped into collections. There's no enforced schema, so two documents in the same collection can have different fields. A whole product, with its nested variants and specs, lives in one document you fetch in one read, no joins required.",
      },
      {
        type: "points",
        items: [
          "Documents can nest arrays and sub-objects, matching how objects look in your code.",
          "No migrations to add a field — just start writing documents that have it.",
          "Related data is often embedded in one document rather than split and joined.",
          "It supports indexes, and modern versions support multi-document transactions.",
        ],
      },
      {
        type: "para",
        text: "The core trade is that the flexibility MongoDB gives you is flexibility it takes away from the database. Because there's no schema, nothing stops inconsistent or malformed documents — that validation moves into your application. And you model data by embedding rather than joining, which is fast to read but means duplicated data you must keep in sync yourself.",
      },
      {
        type: "note",
        text: "The 'schemaless' label is misleading. Your data still has a schema — it's just enforced (or not) by your application code instead of the database. Undisciplined, that becomes a collection full of inconsistent shapes.",
      },
    ],
    tradeoffs: {
      good: [
        "Flexible schema — evolve your data shape without migrations.",
        "Documents map naturally onto objects in application code.",
        "Reading a whole nested entity is one fast lookup, no joins.",
        "Built-in horizontal scaling via sharding across many machines.",
      ],
      costs: [
        "No enforced schema means validation is your application's job.",
        "Embedding duplicates data you must keep consistent by hand.",
        "Joins across collections are awkward and were historically weak.",
        "Easy to end up with messy, inconsistent documents over time.",
      ],
    },
    realWorld:
      "MongoDB fits well for content, catalogs, and rapidly-changing early-stage schemas where each record is largely self-contained. It fits poorly when your data is highly relational and you need to join and aggregate across it constantly — that's what relational databases do best.",
    related: [
      { slug: "sql-vs-nosql", note: "MongoDB is the flagship document-store alternative to SQL." },
      { slug: "tables-schema", note: "Contrast: the fixed schema MongoDB deliberately drops." },
      { slug: "normalization", note: "MongoDB favors embedding over normalized, joined tables." },
      { slug: "sharding", note: "How MongoDB scales writes horizontally." },
      { slug: "indexes", note: "Still essential in MongoDB for fast queries." },
    ],
  },
  {
    slug: "redis",
    tagline:
      "An in-memory key-value store used as a cache and for fast, simple data.",
    problem:
      "Your homepage runs the same expensive query on every visit — a database join that takes 200ms — even though the result barely changes minute to minute. Under load, that query becomes the bottleneck and the database strains. You need somewhere to stash the computed result so the next thousand visitors get it instantly without touching the database.",
    how: [
      {
        type: "para",
        text: "Redis keeps its data in memory (RAM), which is why it answers in microseconds rather than milliseconds. At its simplest it's a giant key-value map: SET a key to a value, GET it back. But it also has native data structures — lists, sets, sorted sets, hashes, counters — so it can do more than plain caching.",
      },
      {
        type: "points",
        items: [
          "Caching: store the result of an expensive query with an expiry (TTL).",
          "Counters and rate limiting: atomic INCR makes 'requests this minute' trivial.",
          "Session storage: fast, shared session state across many app servers.",
          "Sorted sets power leaderboards; lists and streams can act as simple queues.",
        ],
      },
      {
        type: "para",
        text: "The point of Redis is speed, and the source of that speed — living in RAM — is also its main limit. Memory is smaller and more expensive than disk, so you can't keep everything there. Redis can persist to disk and replicate for durability, but it's typically used as a fast layer in front of a real database, not as the single source of truth.",
      },
      {
        type: "note",
        text: "Caching's hard part isn't storing — it's invalidation. When the underlying data changes, the cached copy is now wrong. TTLs and careful cache-busting are how you keep stale data from being served.",
      },
    ],
    tradeoffs: {
      good: [
        "Extremely fast — in-memory reads and writes in microseconds.",
        "Takes crushing read load off your primary database.",
        "Rich data structures (counters, sorted sets, queues) beyond plain key-value.",
        "Atomic operations make counters and locks simple and correct.",
      ],
      costs: [
        "Limited by RAM — you can't store your whole dataset cheaply.",
        "Data can be lost on crash unless you configure persistence.",
        "Cache invalidation is genuinely hard and a common source of bugs.",
        "Adds an extra moving piece to your infrastructure to operate and monitor.",
      ],
    },
    realWorld:
      "Redis is one of the most common pieces of infrastructure in web systems: sitting in front of the database as a cache, holding session data, enforcing rate limits, and acting as a lightweight message broker. It's a workhorse you meet almost everywhere at scale.",
    related: [
      { slug: "caching-perf", note: "Redis is the go-to tool for the caching pattern." },
      { slug: "hash-map", note: "A key-value store is a hash map over the network." },
      { slug: "rate-limiting", note: "Redis counters commonly implement rate limits." },
      { slug: "sessions-cookies", note: "Session state is often kept in Redis." },
      { slug: "message-queues", note: "Redis lists and streams can serve as a simple queue." },
    ],
  },
  {
    slug: "elasticsearch",
    tagline:
      "A search engine built for fast full-text search and analytics over huge datasets.",
    problem:
      "Users type into your site's search box: 'blue runing shoes' — misspelled, partial, out of order. A SQL LIKE '%runing%' query finds nothing, can't rank results by relevance, and scans the whole table doing it. You need search that tolerates typos, ranks the best matches first, and stays fast over millions of documents.",
    how: [
      {
        type: "para",
        text: "Elasticsearch is built around an inverted index: instead of storing documents and scanning them, it stores, for every word, the list of documents that contain it. When you search 'running shoes', it looks up each word and instantly gets the matching documents, then ranks them by relevance. It also handles typos, synonyms, stemming (run/running), and partial matches.",
      },
      {
        type: "points",
        items: [
          "Inverted index: word to list of documents — the reverse of a normal index.",
          "Relevance scoring: results are ranked by how well they match, not just whether.",
          "Analyzers handle stemming, lowercasing, stop words, and typo tolerance.",
          "Aggregations make it strong for analytics and dashboards over large data, too.",
        ],
      },
      {
        type: "para",
        text: "Elasticsearch is not your primary database. It's a secondary system you feed a copy of your data into so it can be searched. That means data must be synced from the source of truth, and there's a lag — it's eventually consistent, not the authoritative record. It scales horizontally across nodes to handle large volumes and query load.",
      },
      {
        type: "note",
        text: "The common architecture: your real database (say Postgres) is the source of truth, and you index the searchable fields into Elasticsearch. The two must be kept in sync, and that sync pipeline is where bugs live.",
      },
    ],
    tradeoffs: {
      good: [
        "Fast, relevance-ranked full-text search that SQL can't match.",
        "Tolerates typos, synonyms, and word variations out of the box.",
        "Powerful aggregations make it strong for log and analytics dashboards.",
        "Scales horizontally across many nodes for big datasets.",
      ],
      costs: [
        "It's a second system to run — data must be synced from the source of truth.",
        "Eventually consistent — not authoritative, and search results can lag.",
        "Memory- and resource-hungry; operating a cluster is real work.",
        "Not a transactional store — don't use it as your primary database.",
      ],
    },
    realWorld:
      "You meet Elasticsearch behind almost any 'search this site' box, and just as often in the ELK stack (Elasticsearch, Logstash, Kibana) collecting and searching application logs. It's the default answer for full-text search and log analytics at scale.",
    related: [
      { slug: "sql-vs-nosql", note: "A specialized search/analytics engine, not a general database." },
      { slug: "indexes", note: "Elasticsearch's inverted index is the inverse of a normal DB index." },
      { slug: "eventual-consistency", note: "Its data lags the source of truth it's fed from." },
      { slug: "observability", note: "The ELK stack uses it to store and search logs." },
      { slug: "caching-perf", note: "Like a cache, a secondary store synced from the primary." },
    ],
  },
];
