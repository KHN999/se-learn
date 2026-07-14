import type { TopicContent } from "@/lib/topics";

export const batchB: TopicContent[] = [
  {
    slug: "searching",
    tagline: "Finding one item in a collection — and why sorted data changes everything.",
    problem:
      "You have a list of a million values and need to know whether one particular value is in it, and where. The obvious approach is to look at each item in turn until you find it. That works, but for a million items it can mean a million comparisons every time. If you do this lookup constantly, it becomes the slowest part of your program. Is there a way to find things faster than checking them one by one?",
    how: [
      {
        type: "para",
        text: "The simplest search is linear search: walk the collection from the start, compare each element, stop when you find a match. It makes no assumptions about the data, so it always works — but on average it looks at half the collection, and in the worst case all of it. That's O(n).",
      },
      {
        type: "para",
        text: "If the data is sorted, you can do far better with binary search. Look at the middle element; if it's too big, throw away the whole upper half; if too small, throw away the lower half. Each comparison halves what's left, so a million items take about 20 comparisons instead of a million — O(log n).",
      },
      {
        type: "code",
        code: "// linear: check each item — works on anything, O(n)\nfor (const x of list) if (x === target) return true\n\n// binary: sorted list only, O(log n)\nlet lo = 0, hi = list.length - 1\nwhile (lo <= hi) {\n  const mid = (lo + hi) >> 1\n  if (list[mid] === target) return true\n  list[mid] < target ? (lo = mid + 1) : (hi = mid - 1)\n}",
        caption: "Linear scans everything; binary halves — but only on sorted data.",
      },
      {
        type: "demo",
        demo: "search-compare",
      },
      {
        type: "points",
        items: [
          "Linear search: O(n), works on any collection, needs no setup.",
          "Binary search: O(log n), but requires the data to be sorted first.",
          "Hash-based lookup: O(1) average, if you build a hash map for the key up front.",
        ],
      },
      {
        type: "note",
        text: "Sorting or building an index has its own cost. Binary search only pays off if the data is already sorted or you'll search it many times — sorting once to search once is usually not worth it.",
      },
    ],
    tradeoffs: {
      good: [
        "Linear search is trivial to write and works on unsorted, unindexed data.",
        "Binary search turns a million-item lookup into ~20 comparisons.",
        "The right structure (hash map, tree) makes repeated lookups nearly free.",
      ],
      costs: [
        "Fast search needs a precondition: sorted data, or a prebuilt index or hash map.",
        "Maintaining that sorted order or index costs time on every insert.",
        "Choosing wrong (linear scan on hot path) is a classic silent bottleneck.",
      ],
    },
    tradeoffLabels: { good: "Strengths", costs: "Weaknesses" },
    realWorld:
      "Every database index, every 'find user by email', every autocomplete is a search problem underneath. When code 'gets slow as data grows', it's often a linear scan where a sorted structure or hash lookup belonged.",
    related: [
      { slug: "sorting", note: "Binary search's precondition — the data must be sorted first." },
      { slug: "big-o-notation", note: "Why O(log n) search beats O(n) so decisively at scale." },
      { slug: "hash-map", note: "The structure that makes repeated lookups O(1)." },
      { slug: "tree", note: "A balanced tree gives O(log n) search that stays sorted under inserts." },
      { slug: "indexes", note: "A database's answer to the same problem, applied to disk." },
    ],
  },
  {
    slug: "sorting",
    tagline: "Putting a collection in order — and why some ways scale and some don't.",
    problem:
      "You need to show users a leaderboard ranked by score, or merge two ordered lists, or make binary search possible. All of these need the data in order first. You could compare every pair and swap them into place, but on a large list that quickly becomes millions of comparisons. Sorting is one of the most common operations in software, so how it scales matters enormously.",
    how: [
      {
        type: "para",
        text: "Simple sorts like bubble sort or insertion sort compare adjacent elements and swap them, repeating until nothing is out of order. They're easy to understand but do roughly n² comparisons — fine for tiny lists, disastrous for large ones.",
      },
      {
        type: "para",
        text: "The efficient general-purpose sorts — merge sort, quicksort, heapsort — use divide and conquer or a heap to get O(n log n). Merge sort splits the list in half, sorts each half, then merges them; that halving is where the log n comes from. This is why almost every language's built-in sort runs in O(n log n).",
      },
      {
        type: "code",
        code: "// simple: compare neighbours and swap — O(n²)\nfor (let i = 0; i < n; i++)\n  for (let j = 0; j < n - 1 - i; j++)\n    if (a[j] > a[j + 1]) swap(a, j, j + 1)\n\n// efficient: split, sort halves, merge — O(n log n)\n// (what your language's built-in sort does)",
        caption: "Simple sorts do about n² comparisons; efficient ones do n log n.",
      },
      {
        type: "demo",
        demo: "sort-bars",
      },
      {
        type: "points",
        items: [
          "Insertion/bubble sort: O(n²), simple, fine only for small or nearly-sorted data.",
          "Merge sort: O(n log n) always, but needs extra memory for the merge.",
          "Quicksort: O(n log n) on average, O(n²) worst case, but very fast in practice.",
          "A stable sort keeps equal elements in their original relative order — sometimes required.",
        ],
      },
      {
        type: "note",
        text: "You almost never write your own sort. The standard library's sort is well-tuned; your job is usually to supply the comparison function and understand its cost.",
      },
    ],
    tradeoffs: {
      good: [
        "Unlocks binary search, deduplication, ranking, and efficient merging.",
        "O(n log n) sorts scale to millions of items comfortably.",
        "Built-in sorts are highly optimized and battle-tested.",
      ],
      costs: [
        "Sorting is O(n log n) — not free; sorting inside a loop is a common mistake.",
        "Some fast sorts (merge sort) need O(n) extra memory.",
        "Stability and custom comparators are easy to get subtly wrong.",
      ],
    },
    tradeoffLabels: { good: "Strengths", costs: "Weaknesses" },
    realWorld:
      "You rarely implement a sort, but you constantly call one — ordering query results, ranking search hits, preparing data for a binary search. Knowing it's O(n log n) tells you when sorting repeatedly in a hot path is the real cost.",
    related: [
      { slug: "searching", note: "Binary search needs sorted input — sorting is what provides it." },
      { slug: "big-o-notation", note: "The gap between O(n²) and O(n log n) sorts is the whole point." },
      { slug: "recursion", note: "Merge sort and quicksort are naturally expressed recursively." },
      { slug: "heap", note: "The structure behind heapsort and priority-ordered output." },
      { slug: "time-vs-space", note: "Merge sort trades memory for guaranteed O(n log n) time." },
    ],
  },
  {
    slug: "recursion",
    tagline: "A function that solves a problem by calling itself on a smaller piece of it.",
    problem:
      "Some problems are naturally nested: a folder contains files and other folders, which contain more folders. To total the size of a directory tree, you don't know in advance how deep it goes, so a fixed set of loops won't cut it. You need something that can handle 'and inside that, the same problem again' to any depth. Recursion is the tool built for exactly this shape.",
    how: [
      {
        type: "para",
        text: "A recursive function solves a problem by breaking it into a smaller version of the same problem and calling itself on that. It needs two things: a base case that stops the recursion (the smallest problem, solved directly), and a recursive case that reduces toward the base case. Without a reachable base case, it never stops.",
      },
      {
        type: "para",
        text: "Each call gets its own stack frame with its own local variables. The calls pile up on the call stack until the base case is hit, then unwind, each returning its result to the one that called it. This is why recursion and the call stack are inseparable.",
      },
      {
        type: "code",
        code: "function factorial(n) {\n  if (n === 0) return 1         // base case — stops the recursion\n  return n * factorial(n - 1)  // recursive case — smaller each time\n}\n\nfactorial(4)  // 4 × 3 × 2 × 1 = 24",
        caption: "A base case to stop, a recursive case that shrinks toward it.",
      },
      {
        type: "demo",
        demo: "recursion-factorial",
      },
      {
        type: "points",
        items: [
          "Base case: the condition where the function returns without recursing.",
          "Recursive case: the function calls itself on a strictly smaller input.",
          "Every pending call sits on the stack until it returns — deep recursion can overflow it.",
        ],
      },
      {
        type: "note",
        text: "Anything recursive can be rewritten with a loop and an explicit stack, and sometimes must be — very deep recursion causes a stack overflow. Some languages optimize tail calls to avoid this; many (including Python) do not.",
      },
    ],
    tradeoffs: {
      good: [
        "Naturally expresses tree-shaped and self-similar problems (parsing, traversal).",
        "Often far shorter and clearer than the equivalent loop.",
        "Divide-and-conquer algorithms like merge sort fall out of it directly.",
      ],
      costs: [
        "Each call consumes stack space — deep recursion can overflow the stack.",
        "Function-call overhead makes it slower than a tight loop in some languages.",
        "Naive recursion can recompute the same subproblem many times (see dynamic programming).",
      ],
    },
    tradeoffLabels: { good: "Strengths", costs: "Weaknesses" },
    realWorld:
      "You meet recursion in tree and graph traversal, parsing JSON or source code, walking a filesystem, and divide-and-conquer sorts. A 'maximum recursion depth exceeded' error is the stack telling you a base case was never reached or the input was deeper than the stack allows.",
    related: [
      { slug: "stack-vs-heap", note: "Each recursive call is a frame on the call stack." },
      { slug: "dynamic-programming", note: "Recursion plus caching, to avoid recomputing subproblems." },
      { slug: "tree", note: "The classic recursive structure — each subtree is the same problem." },
      { slug: "sorting", note: "Merge sort and quicksort are recursion in action." },
      { slug: "graph", note: "Depth-first traversal is naturally recursive." },
    ],
  },
  {
    slug: "dynamic-programming",
    tagline: "Solving a problem once by remembering the answers to its overlapping subproblems.",
    problem:
      "Computing the nth Fibonacci number recursively looks elegant: fib(n) = fib(n-1) + fib(n-2). But run it and it crawls — fib(40) makes over a billion calls, because it recomputes fib(38), fib(37), and so on again and again from scratch. Many problems have this shape: the same subproblem solved thousands of times over. How do you avoid doing the same work repeatedly?",
    how: [
      {
        type: "para",
        text: "Dynamic programming applies when a problem has two traits: optimal substructure (the answer is built from answers to smaller subproblems) and overlapping subproblems (the same subproblems recur). The fix is to solve each subproblem once and store the result, then reuse it instead of recomputing.",
      },
      {
        type: "para",
        text: "There are two styles. Top-down (memoization) keeps the recursive shape but caches each result the first time it's computed. Bottom-up (tabulation) fills a table from the smallest subproblems up to the answer, no recursion needed. Both turn exponential work into polynomial.",
      },
      {
        type: "code",
        code: "// naive: recomputes the same fib(k) exponentially — O(2ⁿ)\nfunction fib(n) {\n  if (n < 2) return n\n  return fib(n - 1) + fib(n - 2)\n}\n\n// memoized: compute each once, then reuse — O(n)\nconst memo = {}\nfunction fib(n) {\n  if (n < 2) return n\n  if (n in memo) return memo[n]\n  return (memo[n] = fib(n - 1) + fib(n - 2))\n}",
        caption: "Adding a cache turns exponential recomputation into linear work.",
      },
      {
        type: "demo",
        demo: "dp-fib",
      },
      {
        type: "points",
        items: [
          "Memoization: recurse as normal, but check a cache first and store each result.",
          "Tabulation: build a table from base cases upward, iteratively.",
          "Fibonacci goes from O(2^n) to O(n) once each value is computed only once.",
        ],
      },
      {
        type: "note",
        text: "DP is a technique, not a specific algorithm. The hard part is spotting the subproblems and defining the recurrence; once you have those, the caching is mechanical.",
      },
    ],
    tradeoffs: {
      good: [
        "Turns exponential brute force into polynomial time for the right problems.",
        "Memoization needs only a cache added to an existing recursive solution.",
        "Gives provably optimal answers for optimization problems that fit its shape.",
      ],
      costs: [
        "Uses extra memory to store subproblem results (a time-for-space trade).",
        "Only works when subproblems overlap and combine cleanly — many don't.",
        "Defining the correct recurrence and state is genuinely hard to get right.",
      ],
    },
    tradeoffLabels: { good: "Strengths", costs: "Weaknesses" },
    realWorld:
      "DP powers edit distance (spell check, diff tools), shortest paths, text justification, and countless interview problems. In practice you meet it whenever a naive recursive solution is 'correct but impossibly slow' — the cure is almost always remembering what you already computed.",
    related: [
      { slug: "recursion", note: "DP is recursion with the repeated work cached away." },
      { slug: "time-vs-space", note: "DP spends memory to buy back time — the core trade." },
      { slug: "greedy", note: "The other optimization strategy — faster, but not always optimal." },
      { slug: "big-o-notation", note: "The point is collapsing exponential growth to polynomial." },
      { slug: "caching-perf", note: "Memoization is caching applied to function results." },
    ],
  },
  {
    slug: "greedy",
    tagline: "Building a solution by always taking the choice that looks best right now.",
    problem:
      "You need to make change for 87 cents using the fewest coins. The natural instinct is to grab the largest coin that fits, then repeat: a 50, then a 25, then a 10, then two 1s. That local 'take the biggest' rule happens to give the optimal answer with normal coins. Greedy algorithms bet that this instinct — always take the best-looking option now — leads to the best overall result. The catch is that it doesn't always.",
    how: [
      {
        type: "para",
        text: "A greedy algorithm builds a solution one step at a time, and at each step makes the choice that looks best locally, never reconsidering. It's simple and fast because it never backtracks or explores alternatives — it just commits and moves on.",
      },
      {
        type: "para",
        text: "The danger is that a locally optimal choice can lock you out of the globally optimal solution. Greedy only guarantees the best answer when the problem has the 'greedy choice property' — a proof that local optimums compose into a global one. For coin change with standard denominations it works; with odd denominations it can fail.",
      },
      {
        type: "code",
        code: "// take the largest coin that fits, repeat\nfunction greedyChange(amount, coins) {\n  const picks = []\n  for (const c of coins.sort((a, b) => b - a))\n    while (amount >= c) { picks.push(c); amount -= c }\n  return picks\n}\n\ngreedyChange(6, [4, 3, 1])  // 4,1,1 (3 coins) — but 3,3 is better!",
        caption: "Fast and simple — but the local choice isn't always globally optimal.",
      },
      {
        type: "demo",
        demo: "greedy-coins",
      },
      {
        type: "points",
        items: [
          "Fast and simple: one pass, no backtracking, low memory.",
          "Correct only for problems that provably have the greedy-choice property.",
          "When it isn't provably correct, it's a heuristic — a good-enough guess, not a guarantee.",
        ],
      },
      {
        type: "note",
        text: "The key question with any greedy algorithm is: can you prove the local choice is always safe? If you can't, dynamic programming or search may be needed for a guaranteed-optimal answer.",
      },
    ],
    tradeoffs: {
      good: [
        "Very fast — usually a single pass, O(n) or O(n log n).",
        "Simple to implement and low on memory.",
        "Provably optimal for a well-known set of problems (Huffman coding, Dijkstra, MST).",
      ],
      costs: [
        "Gives wrong answers for problems that lack the greedy-choice property.",
        "Proving it's correct is often the hardest part.",
        "As a heuristic it may land near, but not at, the true optimum.",
      ],
    },
    tradeoffLabels: { good: "Strengths", costs: "Weaknesses" },
    realWorld:
      "Greedy shows up in Dijkstra's shortest path, Huffman compression, task scheduling, and interval selection. In everyday work it's often the first thing to try — and the thing to be suspicious of, because 'it worked on my examples' is not a proof it's optimal.",
    related: [
      { slug: "dynamic-programming", note: "The fallback when greedy's local choices aren't safe." },
      { slug: "big-o-notation", note: "Greedy's appeal is its low complexity versus exhaustive search." },
      { slug: "graph", note: "Dijkstra and minimum spanning trees are greedy on graphs." },
      { slug: "sorting", note: "Many greedy algorithms start by sorting the choices." },
    ],
  },
  {
    slug: "stack-vs-heap",
    tagline: "The two regions of memory a program uses, and why the difference bites.",
    problem:
      "You write a function that creates a local variable, returns a pointer to it, and the value is garbage by the time the caller reads it. Meanwhile another program allocates memory in a loop and never frees it, and slowly eats all the RAM. Both bugs come from not knowing where a value lives in memory and who's responsible for cleaning it up. Program memory isn't one uniform pool — it's split into regions with very different rules.",
    how: [
      {
        type: "para",
        text: "The stack holds each function call's local variables in a frame. When a function is called, a frame is pushed; when it returns, the frame is popped and its memory is instantly reclaimed. This is fast and automatic, but the memory only lives as long as the call, and the stack is small (typically a few megabytes).",
      },
      {
        type: "para",
        text: "The heap is a large pool for data whose size or lifetime you don't know at compile time. You allocate from it explicitly (or the language does), and it lives until it's freed or garbage-collected. It's flexible and big, but slower to allocate and your responsibility to manage — the source of leaks and use-after-free bugs.",
      },
      {
        type: "points",
        items: [
          "Stack: automatic, fast, LIFO, tied to call lifetime, limited size.",
          "Heap: manual or GC-managed, flexible size and lifetime, slower, can fragment.",
          "Returning a pointer to a stack variable is a bug — the frame is gone after return.",
        ],
      },
      {
        type: "note",
        text: "Deep or infinite recursion overflows the stack because each call adds a frame and the stack is small. Large or long-lived data belongs on the heap.",
      },
    ],
    tradeoffs: {
      good: [
        "Stack allocation is essentially free — just move a pointer.",
        "Stack memory is cleaned up automatically when a function returns.",
        "The heap handles data too big or too long-lived for the stack.",
      ],
      costs: [
        "The stack is small; too much local data or deep recursion overflows it.",
        "Heap allocation is slower and can fragment over time.",
        "Heap memory must be freed (manually or by GC) or it leaks.",
      ],
    },
    realWorld:
      "Every stack overflow, memory leak, and use-after-free traces back to this distinction. In C/C++ you manage it by hand; in managed languages the runtime does, but you still feel it in performance and in why a huge local array is a bad idea.",
    related: [
      { slug: "pointers-references", note: "A pointer often points into the heap; the pointer itself lives on the stack." },
      { slug: "garbage-collection", note: "The mechanism that reclaims heap memory automatically." },
      { slug: "recursion", note: "Each recursive call adds a stack frame — why deep recursion overflows." },
      { slug: "virtual-memory", note: "Both stack and heap live inside a process's virtual address space." },
      { slug: "process-vs-thread", note: "Each thread gets its own stack but shares the heap." },
    ],
  },
  {
    slug: "pointers-references",
    tagline: "Working with the address of a value instead of copying the value itself.",
    problem:
      "You pass a big list into a function, change one element inside, and back in the caller nothing changed — the function got a copy. Or the opposite: you tweak a copy and are shocked to find the original changed too. Whether you're working with the real thing or a copy of it decides whether your edits stick, how much memory you use, and whether two parts of your code can accidentally clobber each other's data.",
    demo: "pointers",
    how: [
      {
        type: "para",
        text: "A pointer (or reference) holds the memory address of a value rather than the value itself. Passing the pointer lets a function reach back and modify the original, and lets many parts of a program share one piece of data without copying it. This is how you build linked structures — a node points to the next node's address.",
      },
      {
        type: "para",
        text: "Languages differ in how much of this they expose. C gives you raw pointers and pointer arithmetic. Java and Python pass object references implicitly — variables hold references, so two variables can point at the same object. Understanding whether your language copies or shares by default is essential to predicting behavior.",
      },
      {
        type: "code",
        code: "// two names, one object — a change through one is seen through the other\nconst a = { count: 0 }\nconst b = a            // b copies the address, not the object\nb.count = 5\nconsole.log(a.count)   // 5  ← a and b alias the same object\n\nlet x = 10, y = x      // numbers copy by value\ny = 99\nconsole.log(x)         // 10 ← the original is untouched\n\nconst node = null\nnode.count             // crash: dereferencing a null pointer",
        caption: "b holds the same address as a, so a mutation through either is visible through both; a null reference crashes when dereferenced.",
      },
      {
        type: "demo",
        demo: "pointers",
      },
      {
        type: "points",
        items: [
          "Pass by value: the function gets a copy; changes don't affect the original.",
          "Pass by reference/pointer: the function gets the address; changes are visible outside.",
          "A null pointer (pointing at nothing) dereferenced is the classic crash.",
          "Two references to the same object mean a change through one is seen through the other.",
        ],
      },
      {
        type: "note",
        text: "Pointers enable aliasing — two names for the same data. That's powerful but dangerous: it's how unexpected shared-state bugs and, in unsafe languages, use-after-free and dangling pointers arise.",
      },
    ],
    tradeoffs: {
      good: [
        "Share large data without copying it — huge memory and time savings.",
        "Let a function modify its caller's data deliberately.",
        "Enable dynamic structures: linked lists, trees, graphs.",
      ],
      costs: [
        "Null/dangling pointers are a leading cause of crashes and security holes.",
        "Aliasing makes it hard to reason about who can change what.",
        "In unsafe languages, pointer arithmetic invites memory-corruption bugs.",
      ],
    },
    realWorld:
      "'Why did my object change when I only touched the copy?' is a pointer/reference question. NullPointerException, segmentation fault, and mutable-default-argument bugs all live here. Every linked data structure is built out of references.",
    related: [
      { slug: "stack-vs-heap", note: "A pointer usually holds a heap address; the pointer sits on the stack." },
      { slug: "linked-list", note: "Built entirely from nodes that point to the next node." },
      { slug: "garbage-collection", note: "The GC frees data once no references point to it." },
      { slug: "variables-types", note: "Whether a variable holds a value or a reference is a core type distinction." },
      { slug: "race-conditions", note: "Shared references across threads are where these appear." },
    ],
  },
  {
    slug: "garbage-collection",
    tagline: "The runtime automatically reclaiming memory your program no longer uses.",
    problem:
      "In a language where you free memory by hand, every allocation is a promise to free it later. Forget, and you leak memory until the program dies; free too early and something else is still using it, causing a crash; free twice and you corrupt the heap. Getting this right by hand across a large program is brutally error-prone. What if the runtime could figure out when memory is no longer reachable and reclaim it for you?",
    demo: "gc",
    how: [
      {
        type: "para",
        text: "A garbage collector tracks which objects are still reachable — findable by following references from the program's live variables (the 'roots'). Anything not reachable can never be used again, so it's safe to reclaim. The GC periodically finds this unreachable memory and frees it, without you writing a single free() call.",
      },
      {
        type: "para",
        text: "The common approach is mark-and-sweep: start from the roots, mark everything reachable, then sweep away everything unmarked. Many modern collectors are generational — they exploit the fact that most objects die young, collecting the 'young generation' frequently and cheaply and the old one rarely.",
      },
      {
        type: "code",
        code: "let user = { name: \"Ada\", cart: [/* ... */] }\nuser = null            // the old object is now unreachable → GC can reclaim it\n\n// a \"leak\" GC can't fix: still reachable, so never collected\nconst cache = []\nfunction remember(x) { cache.push(x) }\nremember(bigObject)    // bigObject stays reachable via cache — kept forever",
        caption: "Setting user = null makes the old object unreachable and collectible; anything still reachable from a root (like cache) is never freed — that is how leaks survive GC.",
      },
      {
        type: "demo",
        demo: "gc",
      },
      {
        type: "points",
        items: [
          "Reachability, not usage, is the test — an object you'll never touch again but still reference is not collected.",
          "Reference counting is a simpler scheme but struggles with reference cycles.",
          "A 'stop-the-world' pause halts the program while the GC runs — the main downside.",
        ],
      },
      {
        type: "note",
        text: "GC prevents leaks from forgetting to free, but not all leaks: an object still referenced (a growing cache, an unremoved listener) is 'reachable' and will never be collected, even if you'll never use it.",
      },
    ],
    tradeoffs: {
      good: [
        "Eliminates whole classes of bugs: use-after-free, double-free, most leaks.",
        "Frees developers from manual memory bookkeeping.",
        "Modern generational collectors are fast for typical allocation patterns.",
      ],
      costs: [
        "GC pauses can cause latency spikes — a problem for real-time systems.",
        "Uses extra memory and CPU to do the tracking.",
        "You lose fine control over exactly when memory is freed.",
      ],
    },
    realWorld:
      "Java, C#, Go, Python, and JavaScript all garbage-collect. You meet GC when a service has periodic latency spikes (a stop-the-world pause) or when memory keeps growing despite GC — a 'leak' where you're accidentally holding references you forgot about.",
    related: [
      { slug: "stack-vs-heap", note: "GC manages the heap; the stack cleans itself up automatically." },
      { slug: "pointers-references", note: "Reachability is defined by which references still point at an object." },
      { slug: "cpu-memory-usage", note: "GC pauses and overhead show up directly in these metrics." },
      { slug: "latency-vs-throughput", note: "GC design is a constant tug-of-war between pause time and throughput." },
    ],
  },
  {
    slug: "process-vs-thread",
    tagline: "Two ways to run things concurrently — one isolated, one shared.",
    problem:
      "Your web server needs to handle many requests at once. You could launch a whole separate program per request, but that's heavy and they can't easily share data. Or you could run many lightweight workers inside one program that share memory — fast, but now they can step on each other's data. The choice between these two shapes of concurrency affects isolation, speed, communication, and how easily one crash takes down the rest.",
    demo: "process-thread",
    how: [
      {
        type: "para",
        text: "A process is an independent program in execution with its own private memory space. The OS isolates processes from each other, so one crashing or corrupting its memory can't directly harm another. But that isolation makes communicating between them (via pipes, sockets, shared memory setups) relatively expensive.",
      },
      {
        type: "para",
        text: "A thread is a unit of execution inside a process. A process can have many threads, and they share the same memory — the same heap, the same globals. That makes communication trivially fast (just read a shared variable) but dangerous: two threads writing the same data at once is a race condition. Threads are also cheaper to create and switch between than processes.",
      },
      {
        type: "code",
        code: "# threads share their process's memory\ncounter = 0\ndef worker():\n    global counter\n    counter += 1          # every thread mutates the SAME counter → needs a lock\nThread(target=worker).start()    # shares memory, cheap to start\n\n# a process gets its own isolated copy of memory\np = Process(target=worker)       # this counter is a separate copy\np.start()                        # heavier; sharing needs explicit IPC",
        caption: "Threads share one memory space (fast to start, but racy without a lock); each process gets its own isolated memory (safe, but heavier and needs IPC to share).",
      },
      {
        type: "demo",
        demo: "process-thread",
      },
      {
        type: "points",
        items: [
          "Process: isolated memory, safer, heavier, costlier to communicate between.",
          "Thread: shared memory within a process, lighter, fast to communicate, prone to races.",
          "A crash in one process is contained; a crash in one thread often takes the whole process down.",
        ],
      },
      {
        type: "note",
        text: "Because threads share memory, any shared data touched by more than one thread needs synchronization (locks, atomics). This is the source of most concurrency bugs.",
      },
    ],
    tradeoffs: {
      good: [
        "Processes give strong isolation and fault containment.",
        "Threads share memory, so communication is fast and cheap.",
        "Threads are lightweight to create and switch compared to processes.",
      ],
      costs: [
        "Inter-process communication is slower and more complex.",
        "Shared memory between threads requires careful synchronization.",
        "A single misbehaving thread can crash the entire process.",
      ],
    },
    realWorld:
      "Web servers, browsers (a process per tab for isolation), and databases all make this choice deliberately. Python's GIL, Node's single-threaded-plus-worker model, and 'why is my multithreaded code corrupting data?' are all this topic in practice.",
    related: [
      { slug: "single-vs-multi-threaded", note: "Whether to use one thread or many is the next decision." },
      { slug: "context-switching", note: "The cost the OS pays to switch between processes or threads." },
      { slug: "race-conditions", note: "The core hazard of threads sharing memory." },
      { slug: "stack-vs-heap", note: "Each thread has its own stack but shares the process heap." },
      { slug: "virtual-memory", note: "What gives each process its own private address space." },
    ],
  },
  {
    slug: "context-switching",
    tagline: "The cost the OS pays to pause one task and resume another on the same CPU.",
    problem:
      "A single CPU core can only run one thread at a time, yet your laptop runs hundreds of tasks that all appear to make progress at once. The OS creates that illusion by rapidly switching the core between them. But each switch isn't free — the CPU must stop mid-task, save exactly where it was, and load someone else's state. Do this too often and the machine spends more time switching than working.",
    demo: "context-switch",
    how: [
      {
        type: "para",
        text: "When the OS switches the CPU from one thread to another, it must save the outgoing thread's context — its register values, program counter, and stack pointer — so it can be resumed exactly where it left off, then load the incoming thread's saved context. This save-and-restore is the context switch.",
      },
      {
        type: "para",
        text: "The direct cost is the save/restore itself, but the bigger hidden cost is the CPU caches and TLB going cold: the new thread's data isn't in cache, so it runs slowly until the cache refills. Switching between threads of the same process is cheaper than between processes, because they share an address space.",
      },
      {
        type: "code",
        code: "// what the OS does on every switch (conceptually)\nsave(current.registers, current.programCounter, current.stackPointer)\nnext = scheduler.pick()\nload(next.registers, next.programCounter, next.stackPointer)\n\n// the CPU caches + TLB are now cold for `next`,\n// so it runs slowly until they refill — the hidden cost of switching",
        caption: "Each switch saves the outgoing task's CPU state and loads the incoming one's; the resumed task then runs slowly on cold caches — pure overhead.",
      },
      {
        type: "demo",
        demo: "context-switch",
      },
      {
        type: "points",
        items: [
          "Triggered by the scheduler's time slice expiring, a blocking call, or an interrupt.",
          "Direct cost: saving and restoring register/CPU state.",
          "Indirect cost: cold caches and TLB after the switch — often the larger hit.",
          "Thrashing: so much switching that little real work gets done.",
        ],
      },
      {
        type: "note",
        text: "This is why spawning thousands of threads can be slower than a few: past the core count, you're mostly paying to switch between them rather than run them.",
      },
    ],
    tradeoffs: {
      good: [
        "Lets one core appear to run many tasks, keeping the system responsive.",
        "Allows a blocked task to yield the CPU to one that can work.",
        "Enables preemption — no single task can hog the CPU forever.",
      ],
      costs: [
        "Each switch costs CPU cycles doing no useful work.",
        "Cold caches after a switch slow the resumed task.",
        "Too many runnable threads leads to thrashing and falling throughput.",
      ],
    },
    realWorld:
      "Context-switch cost is why async I/O and thread pools exist instead of a thread per request, and why 'more threads' often makes a CPU-bound program slower, not faster. It shows up as high system CPU time and poor throughput under heavy concurrency.",
    related: [
      { slug: "os-scheduling", note: "The scheduler decides when a context switch happens." },
      { slug: "process-vs-thread", note: "Switching between processes costs more than between threads." },
      { slug: "thread-pools", note: "Reuse a fixed set of threads to avoid excessive switching." },
      { slug: "single-vs-multi-threaded", note: "Why more threads past the core count can hurt." },
      { slug: "sync-vs-async", note: "Async avoids blocking threads, cutting needless switches." },
    ],
  },
  {
    slug: "single-vs-multi-threaded",
    tagline: "Doing one thing at a time versus splitting work across several threads.",
    problem:
      "Your program has an 8-core CPU but runs on a single thread, so it uses one core while seven sit idle — a task that could finish in a minute takes eight. So you split the work across threads to use every core. But now results come back corrupted and occasionally the program hangs. Going multi-threaded can multiply your throughput or multiply your bugs, and knowing when it actually helps is the whole skill.",
    demo: "single-multi",
    how: [
      {
        type: "para",
        text: "A single-threaded program does one thing at a time, in order. It's simple to reason about — there's no chance of two operations interfering — but it can only use one CPU core and it stalls whenever it waits on I/O. A multi-threaded program runs several threads that can execute in parallel on multiple cores, or overlap while some wait on I/O.",
      },
      {
        type: "para",
        text: "The payoff depends on the workload. CPU-bound work (heavy computation) benefits from parallelism up to the number of cores. I/O-bound work (waiting on disk, network) benefits from concurrency even on one core, because a waiting thread yields to a working one. But any data shared across threads must be synchronized, and that's where races, deadlocks, and hard-to-reproduce bugs enter.",
      },
      {
        type: "code",
        code: "// single-threaded: one core, chunks run in order — about N × time\nfor (const c of chunks) process(c)\n\n// multi-threaded: spread across cores — up to Ncores faster for CPU-bound work\nawait Promise.all(chunks.map(c => runOnWorker(process, c)))\n\n// but shared state without a lock races:\nlet total = 0\nworkers.forEach(w => w.on(\"done\", n => total += n))   // += can lose updates",
        caption: "Spreading CPU-bound work across cores can approach an N-core speedup; but unsynchronized shared state (total += n) races and silently loses updates.",
      },
      {
        type: "demo",
        demo: "single-multi",
      },
      {
        type: "points",
        items: [
          "Single-threaded: simple, deterministic, limited to one core, blocks on I/O.",
          "Multi-threaded: uses many cores, overlaps I/O, but needs synchronization.",
          "CPU-bound work scales with cores; I/O-bound work benefits from concurrency even on one core.",
          "Adding threads beyond what the work or cores support adds overhead, not speed.",
        ],
      },
      {
        type: "note",
        text: "Multithreading bugs are notoriously hard because they're timing-dependent — they may appear once in a million runs and vanish when you add logging. Prefer higher-level tools (thread pools, channels, immutable data) over hand-rolled locks.",
      },
    ],
    tradeoffs: {
      good: [
        "Uses all CPU cores for CPU-bound work — near-linear speedup in the best case.",
        "Keeps a program responsive while parts of it wait on I/O.",
        "Can dramatically raise throughput for the right workload.",
      ],
      costs: [
        "Shared state needs synchronization, opening the door to races and deadlocks.",
        "Bugs are timing-dependent and painfully hard to reproduce and debug.",
        "Overhead (context switches, coordination) can erase the gains if overdone.",
      ],
    },
    realWorld:
      "Choosing single vs multi-threaded (or async) is a core design decision for servers and data pipelines. Node.js and Redis are famously single-threaded by design; databases and video encoders lean hard on many threads. The bugs you'll spend the longest on are usually the multithreaded ones.",
    related: [
      { slug: "process-vs-thread", note: "The building blocks you're choosing how many of to run." },
      { slug: "race-conditions", note: "The signature bug of sharing data across threads." },
      { slug: "sync-vs-async", note: "The alternative to threads for I/O-bound concurrency." },
      { slug: "context-switching", note: "The overhead that caps how many threads pay off." },
      { slug: "thread-pools", note: "The practical way to bound and reuse threads." },
    ],
  },
  {
    slug: "os-scheduling",
    tagline: "How the OS decides which ready task gets the CPU next.",
    problem:
      "At any moment your computer may have dozens of processes ready to run and only a handful of CPU cores. Something must decide who runs, for how long, and who waits — and the choices are in tension. Let a long computation run to completion and your mouse freezes; switch too eagerly and you waste time thrashing. A video call needs the CPU on time; a batch job just needs to finish eventually. How does the OS juggle all of them fairly?",
    demo: "scheduling",
    how: [
      {
        type: "para",
        text: "The scheduler picks which ready thread runs on each core and for how long. Under preemptive scheduling it hands each thread a time slice (quantum), and when that expires — or a higher-priority thread appears — it preempts the running thread and switches. This keeps any one task from monopolizing the CPU and keeps the system responsive.",
      },
      {
        type: "para",
        text: "Different goals pull in different directions: low latency for interactive tasks, high throughput for batch work, and fairness so nothing starves. Schedulers balance these with priorities and policies — round-robin, priority queues, and fair schedulers that give each task a proportional share over time.",
      },
      {
        type: "code",
        code: "// preemptive round-robin: each ready task runs one time slice, then yields\nwhile (true) {\n  task = readyQueue.dequeue()\n  run(task, QUANTUM)            // preempted when the quantum expires\n  if (!task.finished) readyQueue.enqueue(task)   // sent to the back of the line\n}\n// priority scheduling instead lets urgent tasks jump ahead — risking starvation",
        caption: "Round-robin gives each ready task a fixed time slice then preempts it; priority schemes let urgent tasks jump ahead, at the risk of starving low-priority ones.",
      },
      {
        type: "demo",
        demo: "scheduling",
      },
      {
        type: "points",
        items: [
          "Time slice / quantum: how long a thread runs before it may be preempted.",
          "Priority: interactive and real-time tasks are favored over background ones.",
          "Starvation: a low-priority task that never gets the CPU; fair schedulers guard against it.",
          "Every scheduling decision may trigger a context switch, which costs time.",
        ],
      },
      {
        type: "note",
        text: "The scheduler is why a CPU-heavy background job doesn't freeze your UI — it's preempted regularly so interactive work gets its turn. You rarely control it directly, but priorities and 'nice' values let you nudge it.",
      },
    ],
    tradeoffs: {
      good: [
        "Keeps the system responsive by preempting long-running tasks.",
        "Balances competing goals: latency, throughput, and fairness.",
        "Prevents any single process from starving the others of CPU.",
      ],
      costs: [
        "Every scheduling decision risks a costly context switch.",
        "No policy is optimal for all workloads — it's always a compromise.",
        "Poor priority choices cause starvation or priority-inversion bugs.",
      ],
    },
    realWorld:
      "You feel the scheduler when a heavy background task keeps your UI smooth (good scheduling) or when it doesn't (a frozen cursor). Setting process priority/nice values, real-time scheduling for audio, and tuning worker counts are all working with the scheduler.",
    related: [
      { slug: "context-switching", note: "The cost incurred each time the scheduler switches tasks." },
      { slug: "process-vs-thread", note: "The scheduler's unit of work is the thread or process." },
      { slug: "single-vs-multi-threaded", note: "Why extra threads don't help past the core count." },
      { slug: "latency-vs-throughput", note: "The core tension a scheduler must balance." },
    ],
  },
  {
    slug: "virtual-memory",
    tagline: "Giving every process its own private, contiguous-looking address space.",
    problem:
      "If two programs both used raw physical memory addresses, they could read and overwrite each other's data, and every program would need to know exactly which addresses were free. Worse, a program might need more memory than physically exists. Early systems had exactly these problems. How do you give each program the illusion of a large, private, orderly memory of its own, on shared and limited physical RAM?",
    demo: "virtual-memory",
    how: [
      {
        type: "para",
        text: "Virtual memory gives each process its own virtual address space that looks large and contiguous. The CPU and OS translate every virtual address the program uses into a real physical address on the fly, using page tables. Memory is handled in fixed-size chunks called pages, and the mapping can point each page anywhere in physical RAM — or nowhere yet.",
      },
      {
        type: "para",
        text: "Because the mapping is indirect, the OS can do powerful things: isolate processes (each has its own page table, so one can't address another's memory), and page out rarely-used pages to disk when RAM is full, bringing them back on demand. A reference to a page that isn't in RAM triggers a page fault, and the OS loads it.",
      },
      {
        type: "code",
        code: "// the program uses a virtual address; the CPU + OS translate it to physical RAM\npage  = virtualAddr >> 12           // which page of memory\nframe = pageTable[page]             // where that page lives in physical RAM\nif (frame === NOT_PRESENT)          // the page isn't in RAM right now\n  handlePageFault(page)             // OS loads it from disk, then retries\nphysicalAddr = frame + (virtualAddr & 0xfff)   // add the offset within the page",
        caption: "Every virtual address is translated through the process's page table; a page that isn't resident triggers a page fault that loads it from disk.",
      },
      {
        type: "demo",
        demo: "virtual-memory",
      },
      {
        type: "points",
        items: [
          "Pages: fixed-size units of memory the system maps and swaps.",
          "Page table: the per-process map from virtual to physical addresses.",
          "Page fault: accessing a page not currently in RAM; the OS fetches it.",
          "Isolation: separate page tables mean processes can't touch each other's memory.",
        ],
      },
      {
        type: "note",
        text: "Paging to disk is far slower than RAM. When active memory exceeds physical RAM, the system 'thrashes' — spending most of its time swapping pages instead of working, and everything crawls.",
      },
    ],
    tradeoffs: {
      good: [
        "Each process gets an isolated, private address space — strong protection.",
        "Programs can use more memory than physically exists, via paging to disk.",
        "Simplifies programming: every process sees a clean, contiguous space.",
      ],
      costs: [
        "Address translation adds overhead (mitigated by the TLB cache).",
        "Paging to disk is orders of magnitude slower than RAM.",
        "Thrashing under memory pressure can make a machine grind to a halt.",
      ],
    },
    realWorld:
      "Virtual memory is why a segfault means 'you touched an address not mapped to you', why one program crashing doesn't corrupt another, and why a machine that's out of RAM slows to a crawl (swapping). It underpins the whole stack/heap layout of every process.",
    related: [
      { slug: "process-vs-thread", note: "Each process gets its own virtual address space; threads share it." },
      { slug: "stack-vs-heap", note: "Both live inside the process's virtual address space." },
      { slug: "os-scheduling", note: "Both are core OS services managing shared hardware." },
      { slug: "cpu-memory-usage", note: "Paging and swap are what you watch when memory runs low." },
      { slug: "file-systems-permissions", note: "Memory-mapped files bridge virtual memory and the filesystem." },
    ],
  },
  {
    slug: "file-systems-permissions",
    tagline: "How the OS organizes files on disk and controls who can do what to them.",
    problem:
      "Your web server runs as its own user and needs to read config files but must never be able to overwrite the system binaries — because if it's compromised, you don't want the attacker to have that power either. Meanwhile a script fails with 'permission denied' and you have no idea why. Files aren't just bytes on a disk: the OS tracks who owns each one and exactly who's allowed to read, change, or run it. Getting that model wrong is a security incident.",
    demo: "file-perms",
    how: [
      {
        type: "para",
        text: "A file system organizes storage into a tree of directories and files, tracking for each one its name, size, location on disk, and metadata — including ownership and permissions. On Unix-like systems, every file has an owner, a group, and a set of permission bits: read, write, and execute, specified separately for the owner, the group, and everyone else.",
      },
      {
        type: "para",
        text: "When a process tries to open, modify, or run a file, the OS checks that process's user against these bits and allows or denies the action. This is the front line of OS-level security: the principle of least privilege says give each process only the access it truly needs, so a compromise does the least damage.",
      },
      {
        type: "code",
        code: "$ ls -l deploy.sh\n-rwxr-x---  1  web  staff  deploy.sh\n#  └ owner: rwx  └ group: r-x  └ others: ---   (the 9 permission bits)\n\n$ chmod 640 config.env    # owner rw- , group r-- , others ---  (6=rw 4=r 0=none)\n$ ./deploy.sh             # runs only because the owner has the execute (x) bit",
        caption: "The nine bits after the file type give read/write/execute for owner, group, and others; chmod sets them, and a missing execute bit is a classic 'permission denied'.",
      },
      {
        type: "demo",
        demo: "file-perms",
      },
      {
        type: "points",
        items: [
          "Read / write / execute permissions, set for owner, group, and others.",
          "Execute on a directory means the right to enter it and access its contents.",
          "The root/administrator user bypasses these checks — hence its danger.",
          "Least privilege: run each process with the minimum access it needs.",
        ],
      },
      {
        type: "note",
        text: "'Permission denied' almost always means the running user lacks a needed bit — or lacks execute on a parent directory. The reflex to 'just chmod 777' fixes the symptom by removing all protection; it's how security holes are born.",
      },
    ],
    tradeoffs: {
      good: [
        "Enforces who can read, change, or run each file at the OS level.",
        "Limits blast radius: a compromised process can only touch what it's allowed to.",
        "A simple, universal model (owner/group/other) that's easy to reason about.",
      ],
      costs: [
        "Misconfigured permissions are a common source of both bugs and breaches.",
        "The basic model is coarse; fine-grained needs push you to ACLs, adding complexity.",
        "The all-powerful root user is a single point of catastrophic failure.",
      ],
    },
    realWorld:
      "Every 'permission denied', every decision about what user a service runs as, and every Dockerfile that drops root privileges is this topic. Getting file permissions right is basic operational security — overly broad permissions are a recurring finding in security audits.",
    related: [
      { slug: "virtual-memory", note: "A sibling OS service; memory-mapped files tie the two together." },
      { slug: "input-validation", note: "Both are layers of defense; least privilege limits the damage of a breach." },
      { slug: "owasp-top-10", note: "Broken access control at the OS layer echoes the web version." },
      { slug: "docker-containers", note: "Containers wrap filesystems and permissions to isolate processes." },
      { slug: "cloud-networking-iam", note: "The same least-privilege idea, applied to cloud resources." },
    ],
  },
  {
    slug: "os-locking-sync",
    tagline: "The OS primitives that keep threads from corrupting shared data when they run at once.",
    problem:
      "Two threads both increment the same counter. Each reads the value (say 5), adds one, and writes back 6 — so after two increments the counter reads 6 instead of 7. One update vanished, because incrementing isn't a single indivisible step: it's read, modify, write, and the threads interleaved. Whenever threads share data, their operations can tangle like this. The OS provides tools to force order onto that chaos.",
    demo: "mutex",
    how: [
      {
        type: "para",
        text: "The core idea is the critical section: a stretch of code that touches shared data and must not be run by two threads at once. A mutex (mutual exclusion lock) enforces this — a thread locks it before entering, and any other thread must wait until it's unlocked. Only one thread holds the lock at a time, so the read-modify-write happens as an uninterrupted unit.",
      },
      {
        type: "para",
        text: "Other primitives coordinate in other ways. A semaphore allows up to N threads through at once (useful for limiting access to a pool). A condition variable lets a thread sleep until another signals that some condition is true. For simple counters, atomic operations do the read-modify-write as one indivisible hardware instruction, no lock needed.",
      },
      {
        type: "code",
        code: "// without a lock, count += 1 (read-modify-write) can interleave and lose updates\nmutex.lock()             // only one thread gets past here at a time\ncount += 1               // critical section — atomic w.r.t. other threads\nmutex.unlock()\n\n// deadlock: each thread holds one lock and waits for the other's, forever\n// T1: lock(A); lock(B)        T2: lock(B); lock(A)",
        caption: "The mutex serializes the read-modify-write so no update is lost; but acquiring two locks in opposite orders is exactly how deadlock arises.",
      },
      {
        type: "demo",
        demo: "mutex",
      },
      {
        type: "points",
        items: [
          "Mutex: exactly one thread in the critical section at a time.",
          "Semaphore: up to N concurrent holders — a counting gate.",
          "Condition variable: sleep until signaled, avoiding busy-waiting.",
          "Atomic operation: an indivisible read-modify-write for simple cases.",
        ],
      },
      {
        type: "note",
        text: "Locks introduce their own hazards: two threads each waiting for a lock the other holds is a deadlock, and holding locks too long serializes your program, throwing away the benefit of multiple threads.",
      },
    ],
    tradeoffs: {
      good: [
        "Prevents lost updates and corruption from concurrent access to shared data.",
        "Gives you correct, coordinated behavior across threads.",
        "Atomics and semaphores offer lighter-weight options than a full lock.",
      ],
      costs: [
        "Locks can deadlock when threads acquire them in conflicting orders.",
        "Over-locking serializes work and erases multithreading's speedup.",
        "Correct synchronization is subtle; bugs are timing-dependent and hard to reproduce.",
      ],
    },
    realWorld:
      "Any time you share a data structure across threads — a cache, a counter, a queue — you need this. The database version (row locks, isolation) is the same idea one level up. Deadlocks and contention are among the hardest production bugs to diagnose.",
    related: [
      { slug: "mutex", note: "The most common lock — mutual exclusion for a critical section." },
      { slug: "semaphore", note: "A counting lock that admits up to N threads." },
      { slug: "race-conditions", note: "The exact bug synchronization exists to prevent." },
      { slug: "deadlock", note: "The classic failure mode of locking gone wrong." },
      { slug: "atomic-operations", note: "The lock-free alternative for simple shared updates." },
    ],
  },
];
