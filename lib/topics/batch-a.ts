import type { TopicContent } from "@/lib/topics";

export const batchA: TopicContent[] = [
  {
    slug: "variables-types",
    tagline:
      "Names for values — and why the computer cares what kind of value each one holds.",
    problem:
      "A signup form gives you the user's age as the text \"30\". You write age + 1 expecting 31 and get \"301\" — the language joined text instead of adding numbers. The bug isn't your math; the value was never a number. To reason about a program at all, you need to know what each name currently holds and what that kind of value lets you do.",
    demo: "coercion",
    how: [
      {
        type: "para",
        text: "A variable is a name bound to a value. Assignment associates the name with a value; exactly how that value is stored or referenced is up to the language. Every value has a type — a kind, such as number, text (string), or true/false (boolean) — and the type decides what an operation like + actually means.",
      },
      {
        type: "code",
        code: 'age = "30"   // a string: the characters 3 and 0\nage + 1      // "301"  — + joins text\n\nage = 30     // a number\nage + 1      // 31    — + adds',
        caption: "Same + operator, two different meanings — decided by the type.",
      },
      {
        type: "para",
        text: "Types fall into a few familiar categories, though the exact rules vary by language: simple values like numbers and booleans, and composite values like lists/arrays and objects/maps that group other values. Strings are simple values in some languages and objects in others — so treat these as common categories, not universal law.",
      },
      {
        type: "para",
        text: "Two names can end up referring to the same underlying value, and this is where surprises live. Simple values are usually copied, so this rarely bites. But for objects and other composite values, a name often holds a reference to a shared thing: reassign the name and it points somewhere new; mutate the thing and every name referring to it sees the change. Confusing 'change what the name points to' with 'change the thing it points to' is a classic bug — step through it below.",
      },
      {
        type: "demo",
        demo: "references",
      },
      {
        type: "note",
        text: "Languages differ in how much they check and convert types. Statically typed languages check many rules before the program runs; dynamically typed ones check at runtime and may quietly convert (coerce) one type to another — which is how \"30\" + 1 becomes \"301\". Neither removes type mistakes; they change when you find out about them.",
      },
      {
        type: "para",
        text: "Where a name is usable is its scope — usually the block or function it's declared in. A variable declared inside a function doesn't exist outside it, which keeps different parts of a program from clobbering each other's names.",
      },
    ],
    tradeoffs: {
      good: [
        "Types catch whole classes of mistakes — statically before the code runs, dynamically at the moment of the bad operation.",
        "They document intent: a function that takes a number tells you what it expects.",
        "They let editors autocomplete, refactor, and flag errors as you type.",
      ],
      costs: [
        "Static typing adds an extra checking layer — sometimes annotations, sometimes a compile or check step — though inference and editor tooling can make it nearly invisible.",
        "Dynamic typing is fast to write but lets type errors reach runtime unless tests and input validation catch them.",
        "Implicit conversion is convenient but hides bugs like \"30\" + 1; converting explicitly avoids them.",
      ],
    },
    realWorld:
      "The everyday version: a value from a form, a URL, or a JSON response arrives as a string, gets used as a number, and either concatenates (\"301\") or compares wrongly. Converting inputs to the right type at the edge of your program — and being explicit about it — prevents a surprising amount of grief.",
    related: [
      { slug: "control-flow", note: "Conditions branch on booleans and truthiness — a typing question." },
      { slug: "functions", note: "Parameters are variables; their types define the contract." },
      { slug: "stack-vs-heap", note: "Where simple values and shared objects actually live." },
      { slug: "collections", note: "Lists and maps are the composite types mentioned here." },
      { slug: "error-handling", note: "Type mismatches are a common source of runtime errors." },
    ],
  },
  {
    slug: "control-flow",
    tagline: "Deciding where execution goes next — and how many times.",
    problem:
      "You're writing checkout logic: total up each item in the cart, and take 10% off if there's a coupon. Written strictly top to bottom, a program can only do one fixed list of steps, once. Real logic has to choose between paths and repeat work a number of times it doesn't know in advance. The whole question is: where does execution go next, and why?",
    how: [
      {
        type: "para",
        text: "Every program is built from just three ways of moving through code. Sequence: run statements in order, top to bottom. Selection: choose one path or another based on a condition. Iteration: repeat a path until you're done. Most ordinary program logic can be expressed by combining these three.",
      },
      {
        type: "para",
        text: "Start with plain sequence — statements run one after another:",
      },
      {
        type: "code",
        code: "let total = 0\ntotal = total + 10\ntotal = total + 20   // total is now 30",
        caption: "Sequence — each line runs once, in order.",
      },
      {
        type: "para",
        text: "Selection adds a decision. A condition decides whether execution takes the true path or the false path:",
      },
      {
        type: "code",
        code: "if (hasCoupon) {\n  total = total * 0.9    // runs only when hasCoupon is true\n} else {\n  // the other path\n}",
        caption: "Selection — one branch runs, the other is skipped.",
      },
      {
        type: "para",
        text: "Iteration repeats a path once per item, so one piece of code can handle a cart of any size:",
      },
      {
        type: "code",
        code: "let total = 0\nfor (const price of cart) {\n  total = total + price\n}",
        caption: "Iteration — the body runs once for each item in the cart.",
      },
      {
        type: "para",
        text: "Reading a loop means replaying it one step at a time. Trace it by hand with cart = [10, 20, 5] and you can see exactly where execution goes and what changes on each pass:",
      },
      {
        type: "code",
        code: "cart = [10, 20, 5]\niteration 1 -> total = 0  + 10 = 10\niteration 2 -> total = 10 + 20 = 30\niteration 3 -> total = 30 + 5  = 35\nafter loop  -> total = 35",
        caption: "The same trace, done for you — one step at a time.",
      },
      {
        type: "demo",
        demo: "control-flow-tracer",
      },
      {
        type: "note",
        text: "A condition ultimately decides whether execution follows the true path or the false path. Some languages require a real boolean; others (JavaScript, Python, and more) accept any value and convert it using truthiness rules — so 0, an empty string, and null count as false. That link between conditions and value types is exactly why Variables & types comes first.",
      },
      {
        type: "points",
        items: [
          "break ends the nearest loop immediately.",
          "continue skips the rest of the current iteration and starts the next one.",
          "Both are handy, but too many early exits scattered through a loop make it hard to see where execution actually goes.",
        ],
      },
    ],
    tradeoffLabels: { good: "What it enables", costs: "Common mistakes" },
    tradeoffs: {
      good: [
        "Making decisions — responding differently to different inputs and data.",
        "Repeating work — one loop handles a list of any length.",
        "Combining sequence, selection, and iteration to express any procedure a program needs.",
      ],
      costs: [
        "Conditions that are incomplete or backwards, so the wrong branch runs.",
        "Off-by-one errors at loop boundaries — starting or stopping one step early or late.",
        "Infinite loops: a condition that never becomes false, so the program hangs.",
        "Deep nesting of ifs and loops that no one can follow.",
        "Modifying a collection while looping over it.",
        "Unexpected truthy/falsy values sending a condition the wrong way.",
      ],
    },
    realWorld:
      "You use control flow in nearly every function you write. When code is called 'spaghetti', it usually means the control flow — the tangle of nested ifs and loops — has grown past what anyone can hold in their head. Keeping each decision and loop small and obvious is most of what readable code means.",
    related: [
      { slug: "variables-types", note: "Conditions test booleans/truthiness; counters and totals are variables." },
      { slug: "functions", note: "Bundles a piece of control flow behind a name." },
      { slug: "collections", note: "for-each loops iterate over lists and maps." },
      { slug: "recursion", note: "An alternative to loops for repeating work." },
      { slug: "big-o-notation", note: "How many times a loop runs determines cost." },
      { slug: "error-handling", note: "Branches the program onto a failure path." },
    ],
  },
  {
    slug: "functions",
    tagline: "Hiding a group of steps behind one meaningful name.",
    problem:
      "Your checkout code is a long run of steps: total the cart, apply a coupon, format a receipt — and the totalling steps show up again on the orders page. Reading it, you can't tell where one idea ends and the next begins, and fixing the totalling means hunting down every copy. You need a way to name a group of steps and reuse it, so the code reads as ideas rather than a wall of instructions.",
    how: [
      {
        type: "para",
        text: "A function packages a block of steps behind a name. You define it once — naming its inputs (parameters) and the result it hands back (return value) — then call it by name wherever you need it. The reuse is useful, but the deeper win is abstraction: the reader sees calculateTotal(cart) and understands the intent without reading the steps inside.",
      },
      {
        type: "points",
        items: [
          "Reuse the same logic in many places — one spot to fix and improve.",
          "Give a process a meaningful name, so code reads as intent.",
          "Break a big problem into smaller, nameable pieces.",
          "Define a clear input → output contract.",
          "Isolate behavior so it can be tested on its own.",
        ],
      },
      {
        type: "note",
        text: "\"Duplicated code\" doesn't always mean \"make a function.\" If two similar blocks change for different reasons, forcing them into one function couples things that should move independently. Extract to share a single idea, not just to remove repeated characters.",
      },
      {
        type: "para",
        text: "Here is one function, built from the pieces you already know — a local variable and a loop:",
      },
      {
        type: "code",
        code: "function calculateTotal(prices) {\n  let total = 0\n  for (const price of prices) {\n    total = total + price\n  }\n  return total\n}\n\nconst result = calculateTotal([10, 20, 5])   // result = 35",
        caption: "A function wrapping the checkout total you traced in Control flow.",
      },
      {
        type: "code",
        code: "calculateTotal   →  function name\nprices           →  parameter (the input's name)\n[10, 20, 5]      →  argument (the actual value passed in)\ntotal            →  local variable (exists only inside)\nreturn total     →  the output handed back\nresult           →  where the caller stores what came back",
        caption: "Every function has these parts — name them and the rest follows.",
      },
      {
        type: "para",
        text: "In an ordinary synchronous call, the caller waits while the function body runs; when the function returns, execution resumes right after the call. The machinery that tracks who called whom and where to go back to is the call stack — one frame pushed per active call, holding that call's own local variables. Step through it:",
      },
      {
        type: "demo",
        demo: "call-stack",
      },
      {
        type: "para",
        text: "A function that only computes from its inputs and changes nothing else is called pure. One that changes something outside itself — saving to a database, printing, sending a request — has side effects:",
      },
      {
        type: "code",
        code: "// Pure: returns a result, changes nothing outside\nfunction discountedPrice(price) {\n  return price * 0.9\n}",
      },
      {
        type: "code",
        code: '// Side effects: changes something outside the function\nfunction recordPurchase(order) {\n  database.save(order)\n  console.log("Purchase recorded")\n}',
      },
      {
        type: "note",
        text: "Side effects aren't bad — a program has to save data, show output, and send messages eventually. The goal is to make them visible and deliberate, not scattered and surprising. Pure functions are generally easier to test and reason about, because the same inputs always give the same result.",
      },
      {
        type: "para",
        text: "Variables declared inside a function are local: they exist only while that call runs and are invisible outside it. That isolation is the point — it keeps one function from clobbering another's names.",
      },
      {
        type: "code",
        code: 'function greet() {\n  const message = "Hello"\n}\n\ngreet()\nconsole.log(message)   // error: message is not defined out here',
      },
      {
        type: "aside",
        title: "Advanced: closures (optional)",
        blocks: [
          {
            type: "para",
            text: "A function defined inside another can remember variables from where it was created, even after the outer function has finished. That remembered environment is called a closure.",
          },
          {
            type: "code",
            code: "function makeCounter() {\n  let count = 0\n  return function () {\n    count = count + 1\n    return count\n  }\n}\n\nconst next = makeCounter()\nnext()   // 1\nnext()   // 2  — count is remembered between calls",
          },
          {
            type: "para",
            text: "Closures power private state, callbacks, and much of everyday code. For now it's enough to know the name and the idea — you'll meet them constantly later.",
          },
        ],
      },
    ],
    tradeoffLabels: { good: "What it enables", costs: "Common mistakes" },
    tradeoffs: {
      good: [
        "Reusing logic — write it once, call it everywhere.",
        "Naming a process so code reads as intent, not mechanics.",
        "Breaking a big problem into smaller, nameable pieces.",
        "Defining a clear input → output contract.",
        "Isolating behavior so it can be tested on its own.",
      ],
      costs: [
        "Unclear or overly generic names (doStuff, handle, process).",
        "Too many parameters — usually a sign the function does too much.",
        "Hidden side effects the name doesn't hint at.",
        "One function doing several unrelated jobs.",
        "Over-fragmenting into so many tiny functions the flow is hard to follow.",
        "Returning inconsistent kinds of values (a number sometimes, null other times).",
        "Leaning on global state instead of inputs and outputs.",
      ],
    },
    realWorld:
      "Functions are the unit you think in all day. Review comments like 'extract this into a function', 'this function does three things', or 'this name doesn't say what it does' are all about using functions to keep each piece small, well-named, and testable.",
    related: [
      { slug: "variables-types", note: "Parameters and local variables are variables." },
      { slug: "control-flow", note: "A function contains and organizes execution." },
      { slug: "error-handling", note: "Functions can fail and propagate errors to callers." },
      { slug: "unit-tests", note: "Functions are the most common unit to test." },
      { slug: "stack-vs-heap", note: "Call frames and local state live on the stack." },
      { slug: "recursion", note: "A function that calls itself." },
      { slug: "dry", note: "Functions are the main tool for not repeating yourself." },
      { slug: "functions-one-thing", note: "The discipline of keeping each function focused." },
    ],
  },
  {
    slug: "classes-objects",
    tagline: "Bundling related data with the operations that act on it.",
    problem:
      "You're passing a user's name, email, age, and address around as four separate variables. Every function that touches a user needs all four in its parameter list, and it's easy to pass them in the wrong order or forget one. The data clearly belongs together, but nothing in the code says so — and nothing stops another part of the program from setting the age to -5.",
    how: [
      {
        type: "para",
        text: "A class is a blueprint that groups related data (fields) with the functions that operate on that data (methods). An object is a concrete instance made from that blueprint — one actual user, with its own name and email. Instead of four loose variables, you have one user object that carries its data and knows what can be done to it.",
      },
      {
        type: "para",
        text: "Encapsulation is the key idea: the object controls access to its own data. Callers go through methods rather than poking at fields directly, so the object can enforce its own rules — refusing a negative age, keeping two fields in sync — no matter who is using it.",
      },
      {
        type: "note",
        text: "Not every group of data needs a class. A plain record or dictionary is often enough; reach for a class when there's behavior and invariants to protect, not just fields to hold.",
      },
    ],
    tradeoffs: {
      good: [
        "Related data and behavior live in one place with one name.",
        "Encapsulation lets an object guarantee its own rules stay true.",
        "Objects model real-world things (a user, an order, a connection) in a way that reads naturally.",
      ],
      costs: [
        "Overuse leads to deep hierarchies and ceremony where a simple function would do.",
        "Shared mutable objects can be changed from anywhere, causing hard-to-trace bugs.",
        "Getting the boundaries wrong produces classes that are too big or too entangled.",
      ],
    },
    realWorld:
      "Most application code you'll read is organized into classes — a User, an OrderService, a HttpClient. Design debates about 'where should this method live?' are really about which object owns the data and behavior.",
    related: [
      { slug: "oop-pillars", note: "Encapsulation, inheritance, and polymorphism build on classes." },
      { slug: "solid", note: "Principles for designing classes that stay maintainable." },
      { slug: "coupling-cohesion", note: "Good classes are cohesive and loosely coupled." },
      { slug: "functions", note: "Methods are functions that belong to an object." },
    ],
  },
  {
    slug: "error-handling",
    tagline: "Deciding what a program does when a step it depended on fails.",
    problem:
      "Your code opens a config file, reads it, and parses it. But the file might not exist, the disk might be full, or the contents might be garbage. If you assume every step succeeds, the first failure either crashes the program with a cryptic message or, worse, lets it keep running on half-built data and corrupt something later. Failure isn't the exception — it's a normal path the code has to handle.",
    how: [
      {
        type: "para",
        text: "There are two common ways to signal that an operation failed. Exceptions interrupt the normal flow: an operation throws, and control jumps to the nearest handler (a try/catch block), skipping everything in between. Error-return values make failure ordinary data: the function returns something the caller must check, like an error object or a result that's either 'ok' or 'failed.'",
      },
      {
        type: "points",
        items: [
          "Handle an error where you can actually do something about it — retry, use a default, show a message.",
          "If you can't handle it here, let it propagate up to code that can.",
          "Fail fast on programming bugs (a null that should never be null); recover gracefully from expected conditions (a network blip).",
          "Never swallow an error silently — an empty catch block hides the very information you'll need to debug.",
        ],
      },
      {
        type: "note",
        text: "An error message is written for the person debugging at 3am. Include what was being attempted and the relevant values, not just 'something went wrong.'",
      },
    ],
    tradeoffs: {
      good: [
        "Turns unpredictable crashes into deliberate, recoverable outcomes.",
        "Separates the happy path from failure handling, keeping the main logic readable.",
        "Good errors carry the context that makes a bug diagnosable.",
      ],
      costs: [
        "Exceptions can hide non-obvious exit points from a block of code.",
        "Overusing exceptions for ordinary control flow is slow and confusing.",
        "Catch-all handlers that swallow everything mask real bugs.",
      ],
    },
    realWorld:
      "Most of the difference between a demo and a production system is error handling: timeouts, missing files, bad input, half-finished writes. When a stack trace lands in your logs, it's the error-handling story that decides whether you get a useful clue or just a crash.",
    related: [
      { slug: "control-flow", note: "Errors branch the program onto a failure path." },
      { slug: "logs-stack-traces", note: "Where errors leave a trail you can debug from." },
      { slug: "failure-retries-timeouts", note: "Handling failures in calls across a network." },
      { slug: "input-validation", note: "Rejecting bad input before it becomes an error." },
    ],
  },
  {
    slug: "collections",
    tagline: "Standard containers for holding many values and getting them back out.",
    problem:
      "You need to keep track of every item in a shopping cart. You could make item1, item2, item3 variables, but you don't know how many there'll be, and you can't loop over separately named variables. The moment a program handles 'many of something' — users, messages, results — it needs a container built for holding groups of values and iterating over them.",
    how: [
      {
        type: "para",
        text: "Collections are the general-purpose containers a language's standard library gives you: lists, sets, maps, and their variants. They differ in what they guarantee — whether order is preserved, whether duplicates are allowed, and how fast lookup, insertion, and removal are. Picking the right one is mostly about matching those guarantees to how you'll access the data.",
      },
      {
        type: "points",
        items: [
          "List / dynamic array: ordered, allows duplicates, fast access by position, grows as needed.",
          "Set: no duplicates, fast 'is this in here?' checks, usually unordered.",
          "Map / dictionary: stores key-to-value pairs, fast lookup by key.",
          "Queue / stack: restrict access to the ends, for first-in-first-out or last-in-first-out order.",
        ],
      },
      {
        type: "note",
        text: "The right choice depends on the operation you do most. If you constantly ask 'does this exist?', a set or map beats scanning a list every time.",
      },
    ],
    tradeoffs: {
      good: [
        "Handle any number of items with one variable and a loop.",
        "Built-in, tested implementations save you from reinventing data structures.",
        "Choosing the right collection makes the common operation fast for free.",
      ],
      costs: [
        "The wrong collection can turn an O(1) operation into an O(n) one — for example, membership checks on a list.",
        "Each has memory overhead beyond the raw values it stores.",
        "Some collections make no ordering promise, which surprises people who assume insertion order.",
      ],
    },
    realWorld:
      "Choosing between a list, a set, and a map is a decision you make constantly. A surprising number of slow functions come down to using a list where a set or map would have made lookups instant.",
    related: [
      { slug: "array", note: "The contiguous structure most lists are built on." },
      { slug: "hash-map", note: "The structure behind maps and sets." },
      { slug: "linked-list", note: "An alternative list layout with different tradeoffs." },
      { slug: "big-o-notation", note: "How the choice of collection changes operation cost." },
    ],
  },
  {
    slug: "file-io",
    tagline: "Reading and writing data that outlives the program's memory.",
    problem:
      "Your program computes a report and prints it, then exits — and the report is gone. Everything in memory disappears when the process ends. To keep data around, log what happened, or read a file someone gave you, the program has to talk to storage. And a naive read of a 5 GB file into memory at once will crash on a machine with 8 GB of RAM.",
    how: [
      {
        type: "para",
        text: "File I/O is the set of operations for moving data between your program and persistent storage. The usual cycle is open (ask the OS for a handle to the file and declare your intent — read, write, append), then read or write through that handle, then close (release it). The OS mediates all of this and enforces permissions.",
      },
      {
        type: "points",
        items: [
          "Reading a whole file at once is simple but only safe when the file is small.",
          "Streaming reads a chunk at a time, so memory use stays flat regardless of file size.",
          "Text mode decodes bytes into characters using an encoding; binary mode gives you the raw bytes.",
          "Writes are often buffered — data may sit in memory until you flush or close, so a crash can lose it.",
        ],
      },
      {
        type: "note",
        text: "Always close files (or use a language construct that closes them for you). Leaked file handles are a finite resource — run out and the program can no longer open anything.",
      },
    ],
    tradeoffs: {
      good: [
        "Data persists across runs and can be shared with other programs and people.",
        "Streaming lets you process files far larger than available memory.",
        "It's a universal interface — logs, config, exports, imports all flow through it.",
      ],
      costs: [
        "Disk is orders of magnitude slower than memory; I/O is a common bottleneck.",
        "Many things can fail: missing file, no permission, full disk, disk yanked mid-write.",
        "Buffering means a write isn't durable until flushed — a crash can drop it.",
        "Text encoding mismatches quietly corrupt data (the classic mojibake).",
      ],
    },
    realWorld:
      "You meet file I/O whenever you load config, write logs, import a CSV, or save user uploads. Its slowness is why so much engineering effort goes into caching and into doing work in memory instead of hitting disk.",
    related: [
      { slug: "file-systems-permissions", note: "The OS layer that governs what files you can touch." },
      { slug: "error-handling", note: "File operations fail often and must be handled." },
      { slug: "sync-vs-async", note: "Whether a slow read blocks the program or not." },
      { slug: "compression", note: "Shrinking files to move and store them cheaper." },
    ],
  },
  {
    slug: "array",
    tagline: "A block of values laid out back-to-back so any one can be reached instantly.",
    problem:
      "You have 1,000 temperature readings and you want the 500th one — right now, without walking past the first 499. You also want to loop through all of them quickly. You need a layout where 'give me item number 500' is a single, instant step, no matter how many items there are.",
    how: [
      {
        type: "para",
        text: "An array stores its elements in one continuous block of memory, each the same size, one right after another. That layout is what makes indexing instant: to find element i, the computer computes 'start address + i × element size' and jumps straight there. It doesn't matter whether i is 3 or 3 million — it's one arithmetic step, O(1).",
      },
      {
        type: "points",
        items: [
          "Access or update by index: O(1) — direct address computation.",
          "Append to the end (room permitting): O(1).",
          "Insert or delete in the middle: O(n) — everything after it must shift.",
          "Contiguous layout is cache-friendly, so scanning an array is fast in practice.",
        ],
      },
      {
        type: "note",
        text: "A dynamic array (list/vector) hides the fixed size: when it fills up it allocates a bigger block and copies everything over. That occasional copy is why appends are 'O(1) on average,' not always.",
      },
    ],
    tradeoffs: {
      good: [
        "Instant access to any element by its position.",
        "Minimal memory overhead — just the values, packed tight.",
        "Sequential scans are very fast because of CPU cache behavior.",
      ],
      costs: [
        "Inserting or removing anywhere but the end shifts many elements — O(n).",
        "A fixed-size array can't grow; a dynamic one pays an occasional copy to resize.",
        "Its strength (contiguous block) means a big array needs one big contiguous chunk of free memory.",
      ],
    },
    realWorld:
      "The array is the default collection in almost every language, and the foundation under lists, stacks, queues, and hash tables. When performance matters, its cache-friendly layout often beats fancier structures despite the same big-O.",
    related: [
      { slug: "linked-list", note: "The opposite tradeoff — cheap inserts, no instant indexing." },
      { slug: "hash-map", note: "Uses an array of buckets under the hood." },
      { slug: "collections", note: "Lists and other containers are built on arrays." },
      { slug: "big-o-notation", note: "Explains why access is O(1) but middle-insert is O(n)." },
    ],
  },
  {
    slug: "linked-list",
    tagline: "A chain of nodes where each one points to the next, so inserting is cheap.",
    problem:
      "You're keeping a list in an array and you need to insert a new item at the front. With an array, that means shifting all one million existing items one slot to the right first — O(n) work for a single insert. If your workload is constantly adding and removing items at the ends or middle, that shifting dominates everything.",
    how: [
      {
        type: "para",
        text: "A linked list stores each value in its own node, and each node holds a pointer to the next node. The nodes can sit anywhere in memory; the pointers stitch them into a sequence. To insert, you just create a node and rewire two pointers — no shifting, no matter how long the list is.",
      },
      {
        type: "points",
        items: [
          "Insert or delete at a known position: O(1) — just relink pointers.",
          "Access the nth element: O(n) — you must follow pointers from the start.",
          "A singly linked list points forward only; a doubly linked list points both ways.",
          "No resizing or shifting — the list grows one node at a time.",
        ],
      },
      {
        type: "note",
        text: "The catch is you rarely have 'a known position' handy. Finding the spot to insert usually means walking the list first, which is O(n) — so the O(1) insert is only free once you're already there.",
      },
    ],
    tradeoffs: {
      good: [
        "Insert and delete without shifting the rest of the list.",
        "Grows and shrinks one node at a time with no bulk reallocation.",
        "Underlies structures like stacks and queues where you only touch the ends.",
      ],
      costs: [
        "No instant indexing — reaching element n means traversing n nodes.",
        "Each node carries pointer overhead beyond its value.",
        "Nodes scattered in memory are cache-unfriendly, so traversal is slower than an array scan.",
      ],
    },
    realWorld:
      "You'll use linked lists indirectly through stacks, queues, and some hash-map implementations more than you'll hand-roll one. They're a staple of coding interviews precisely because pointer manipulation exercises careful reasoning.",
    related: [
      { slug: "array", note: "The opposite tradeoff — instant access, costly inserts." },
      { slug: "pointers-references", note: "Nodes are linked by the pointers this covers." },
      { slug: "stack", note: "Often implemented as a linked list." },
      { slug: "queue", note: "A linked list makes both ends cheap to touch." },
    ],
  },
  {
    slug: "stack",
    tagline: "A last-in, first-out pile where you only ever touch the top.",
    problem:
      "You're building an undo feature. Each action the user takes should be undoable in reverse order — the most recent first. Or you're checking that every opening bracket has a matching close. In both cases you need a structure that remembers things in order and always hands back the most recent one first.",
    how: [
      {
        type: "para",
        text: "A stack is a collection with two main operations: push (add an item to the top) and pop (remove and return the top item). You can only ever access the top — last in, first out (LIFO). Think of a stack of plates: you add and remove from the top, never the middle.",
      },
      {
        type: "points",
        items: [
          "push: add to the top — O(1).",
          "pop: remove from the top — O(1).",
          "peek: look at the top without removing it — O(1).",
          "Backed by an array or a linked list; both give O(1) operations at one end.",
        ],
      },
      {
        type: "note",
        text: "The call stack that runs your functions is a real stack: each call pushes a frame, each return pops one. This is also why deep recursion causes a 'stack overflow' — the stack of frames runs out of room.",
      },
    ],
    tradeoffs: {
      good: [
        "Dead simple, with all operations O(1).",
        "Naturally models 'reverse order' problems — undo, backtracking, bracket matching.",
        "Tiny, predictable memory footprint.",
      ],
      costs: [
        "You can only reach the top item; no searching or indexing into the middle.",
        "The LIFO discipline is a poor fit whenever you need first-in-first-out order.",
        "A fixed-capacity stack can overflow if you push past its limit.",
      ],
    },
    realWorld:
      "Stacks are everywhere under the hood: the function call stack, undo/redo, the back button's history, expression evaluation, and the depth-first traversal of trees and graphs.",
    related: [
      { slug: "queue", note: "The FIFO counterpart to the stack's LIFO." },
      { slug: "recursion", note: "Recursion is built on the call stack." },
      { slug: "stack-vs-heap", note: "The call stack is one of the two memory regions." },
      { slug: "array", note: "A common backing store for a stack." },
    ],
  },
  {
    slug: "queue",
    tagline: "A first-in, first-out line where items are served in the order they arrived.",
    problem:
      "A printer receives jobs faster than it can print them. You want them handled in the order they were submitted — first come, first served — not newest first. The same need shows up for web requests waiting on a busy server or tasks handed to a pool of workers: you need a fair line where the item that's been waiting longest goes next.",
    how: [
      {
        type: "para",
        text: "A queue has two main operations: enqueue (add an item to the back) and dequeue (remove and return the item at the front). The first item added is the first one removed — first in, first out (FIFO). It works exactly like a line at a checkout.",
      },
      {
        type: "points",
        items: [
          "enqueue: add to the back — O(1).",
          "dequeue: remove from the front — O(1).",
          "A naive array-backed queue makes dequeue O(n) (shifting); a ring buffer or linked list keeps it O(1).",
          "A priority queue is a variant that serves the highest-priority item next instead of the oldest.",
        ],
      },
      {
        type: "note",
        text: "Queues are the backbone of decoupling systems: a producer drops work on the queue and a consumer picks it up later, so the two don't have to run at the same speed.",
      },
    ],
    tradeoffs: {
      good: [
        "Preserves arrival order — fair, predictable processing.",
        "Enqueue and dequeue are O(1) with the right backing structure.",
        "Decouples producers from consumers, smoothing out bursts of work.",
      ],
      costs: [
        "You can only touch the two ends — no peeking into the middle.",
        "An unbounded queue can grow without limit if consumers can't keep up.",
        "A carelessly array-backed queue makes dequeue O(n); implementation matters.",
      ],
    },
    realWorld:
      "Queues run through nearly every system: task queues, request buffers, and message brokers between services. Breadth-first search of a graph or tree is driven by a queue.",
    related: [
      { slug: "stack", note: "The LIFO counterpart to the queue's FIFO." },
      { slug: "message-queues", note: "Queues scaled up to decouple whole services." },
      { slug: "thread-pools", note: "Workers pull tasks from a shared queue." },
      { slug: "linked-list", note: "A backing structure that keeps both ends O(1)." },
    ],
  },
  {
    slug: "hash-map",
    tagline: "Store and retrieve a value by its key in roughly one step, at any scale.",
    problem:
      "You have a million users and you constantly need to find one by username. Scanning a list means up to a million comparisons per lookup. Keeping it sorted lets you binary-search, but every insert then has to shift things to stay sorted. You want to add users and find them by name, both in about the same tiny amount of time no matter how many there are.",
    how: [
      {
        type: "para",
        text: "A hash map stores key-value pairs in an underlying array of 'buckets.' To store or find a key, it runs the key through a hash function that turns it into a number, then uses that number to pick a bucket. Because computing the bucket takes the same time regardless of how many entries exist, lookup, insert, and delete are all O(1) on average.",
      },
      {
        type: "points",
        items: [
          "A hash function maps a key to a bucket index — the same key always lands in the same bucket.",
          "A collision (two keys landing in one bucket) is handled by chaining entries or probing nearby slots.",
          "The load factor (entries per bucket) is kept low; when it rises, the map resizes and rehashes.",
          "Worst case is O(n) if many keys collide, but a good hash function keeps that rare.",
        ],
      },
      {
        type: "note",
        text: "Hash maps make no promise about iteration order, and keys must be hashable — typically immutable. Mutating a key after inserting it can make its value unfindable.",
      },
    ],
    tradeoffs: {
      good: [
        "Average O(1) lookup, insert, and delete — the go-to for 'find by key.'",
        "Also powers sets (membership checks) and de-duplication.",
        "Scales to huge sizes without lookups getting slower.",
      ],
      costs: [
        "No ordering — if you need sorted keys, this is the wrong structure.",
        "Memory overhead from empty buckets kept to hold the load factor down.",
        "A bad hash function or adversarial keys degrade it toward O(n).",
        "Occasional resize causes a latency spike as everything is rehashed.",
      ],
    },
    realWorld:
      "The hash map is one of the most-used data structures in all of programming — caches, database indexes, counting things, and language-level dictionaries all rest on it. Redis is essentially a giant hash map exposed over the network.",
    related: [
      { slug: "array", note: "The bucket array a hash map is built on." },
      { slug: "searching", note: "Hashing is an alternative to searching for a value." },
      { slug: "collections", note: "Maps and sets are the most-used collections." },
      { slug: "redis", note: "A networked key-value store built on hashing." },
    ],
  },
  {
    slug: "heap",
    tagline: "A tree that always keeps its smallest (or largest) item ready at the top.",
    problem:
      "You're running a task scheduler and repeatedly need the highest-priority task, while new tasks keep arriving. Re-sorting the whole list every time you pull one is wasteful, and scanning for the max each time is O(n) per pull. You want to add tasks and pull the top-priority one over and over, each in cheap, sub-linear time.",
    how: [
      {
        type: "para",
        text: "A heap is a binary tree kept in a special shape: every parent is smaller than its children (a min-heap) or larger than them (a max-heap). That single rule guarantees the smallest (or largest) item is always at the root, ready to grab. It's usually stored compactly in a plain array, with a node's children found by simple index arithmetic.",
      },
      {
        type: "points",
        items: [
          "peek the min/max at the root: O(1).",
          "insert: add at the bottom and 'bubble up' until the heap rule holds — O(log n).",
          "extract the root: move the last item to the top and 'sift down' — O(log n).",
          "It keeps only a partial order — enough to know the extreme, not enough to list everything sorted for free.",
        ],
      },
      {
        type: "note",
        text: "A heap is the standard way to implement a priority queue. It is not the same thing as the 'heap' region of memory where dynamic allocations live — same word, unrelated concept.",
      },
    ],
    tradeoffs: {
      good: [
        "Always-ready access to the minimum or maximum in O(1).",
        "Insert and extract are both O(log n) — efficient for a stream of changes.",
        "Compact array storage with no pointers and good cache behavior.",
      ],
      costs: [
        "Only the single extreme is cheap; finding or removing an arbitrary item is O(n).",
        "It isn't fully sorted, so you can't iterate in order without extracting repeatedly.",
        "Choosing min- vs max-heap is baked in; wanting both means two heaps or extra work.",
      ],
    },
    realWorld:
      "Heaps power priority queues in schedulers, Dijkstra's shortest-path algorithm, event simulations, and 'top-K' queries (the K largest items in a stream). Heapsort is built directly on this structure.",
    related: [
      { slug: "tree", note: "A heap is a specialized binary tree." },
      { slug: "queue", note: "A priority queue is a heap's main use." },
      { slug: "sorting", note: "Heapsort sorts by repeatedly extracting the root." },
      { slug: "big-o-notation", note: "Why insert and extract are O(log n)." },
    ],
  },
  {
    slug: "graph",
    tagline: "Modeling things and the connections between them, then asking questions about the network.",
    problem:
      "You want to model a social network: people, and who is friends with whom. Or a road map: intersections, and the roads between them. Then you need answers — is A connected to B, what's the shortest route, who are the friends-of-friends? A flat list of items can't express relationships; you need a structure built around connections.",
    how: [
      {
        type: "para",
        text: "A graph is a set of vertices (nodes) connected by edges (links). Edges can be directed (a one-way follow) or undirected (mutual friendship), and weighted (a road with a distance) or unweighted. This one abstraction models networks, maps, dependencies, and state machines alike.",
      },
      {
        type: "points",
        items: [
          "Adjacency list: each vertex stores its neighbors — compact for sparse graphs, the common choice.",
          "Adjacency matrix: a grid marking every possible edge — fast edge lookup, but O(V²) space.",
          "Breadth-first search (BFS) explores level by level, using a queue — finds shortest paths in unweighted graphs.",
          "Depth-first search (DFS) goes deep before backtracking, using a stack or recursion.",
        ],
      },
      {
        type: "note",
        text: "A tree is just a special graph — connected, with no cycles. Many tree algorithms are the graph algorithms with the extra guarantees that no cycle exists.",
      },
    ],
    tradeoffs: {
      good: [
        "Expresses relationships and networks that flat structures can't.",
        "A huge, well-studied toolbox of algorithms comes with it (paths, cycles, connectivity).",
        "One model covers maps, social graphs, dependencies, and more.",
      ],
      costs: [
        "Algorithms get complex fast, and cycles require care to avoid infinite loops.",
        "Storage choice (list vs matrix) is a real space/speed tradeoff you must make.",
        "Many graph problems (like shortest path with negative weights, or the traveling salesman) are genuinely hard.",
      ],
    },
    realWorld:
      "Graphs underlie maps and navigation, social networks, package dependency resolution, network routing, and recommendation systems. Whenever you hear 'shortest path' or 'is there a cycle,' a graph is involved.",
    related: [
      { slug: "tree", note: "A tree is a graph with no cycles." },
      { slug: "searching", note: "BFS and DFS are graph search strategies." },
      { slug: "queue", note: "BFS is driven by a queue." },
      { slug: "hash-map", note: "Adjacency lists and visited-sets are built on maps." },
    ],
  },
  {
    slug: "complexity-classes",
    tagline: "The handful of growth rates that describe almost every algorithm you'll meet.",
    problem:
      "You compare two functions that do the same job. On 100 items they're indistinguishable. On 10 million, one finishes instantly and the other doesn't finish before you give up. The difference isn't the language or the machine — it's how each one's cost grows with input size. To predict that, you need to recognize the common growth rates and what they mean in practice.",
    how: [
      {
        type: "para",
        text: "Big-O describes how an algorithm's cost grows as the input n grows. In practice, almost everything falls into a short list of classes. Learning to spot which one you're in tells you, before running anything, whether an approach will hold up at scale.",
      },
      {
        type: "points",
        items: [
          "O(1) constant: cost doesn't depend on n — a hash-map lookup, array indexing.",
          "O(log n) logarithmic: halve the problem each step — binary search, balanced-tree lookup.",
          "O(n) linear: touch each item once — a single scan.",
          "O(n log n): the best general sorting can do — merge sort, heapsort.",
          "O(n²) quadratic and beyond: nested loops over the input; O(2ⁿ) and O(n!) are 'brute force,' feasible only for tiny n.",
        ],
      },
      {
        type: "note",
        text: "The classes only matter at scale. For small, fixed inputs a 'worse' class with a smaller constant factor can easily win — big-O ignores constants on purpose.",
      },
    ],
    tradeoffs: {
      good: [
        "Predict how code behaves at scale without benchmarking every case.",
        "A shared vocabulary — 'that's O(n²)' instantly conveys a concern.",
        "Guides you to fix the class (nested loop to hash lookup), the change that actually matters.",
      ],
      costs: [
        "Ignores constant factors and lower-order terms, which can dominate at real-world sizes.",
        "Worst-case big-O can be misleading when the typical case is far better (hash maps).",
        "It says nothing about memory, cache behavior, or actual wall-clock time.",
      ],
    },
    realWorld:
      "This vocabulary shows up in code review, system design, and interviews. The practical payoff is recognizing when a loop-inside-a-loop over growing data will become a problem, and reaching for a structure that changes its class.",
    related: [
      { slug: "big-o-notation", note: "The notation these classes are expressed in." },
      { slug: "time-vs-space", note: "Complexity applies to memory as well as time." },
      { slug: "sorting", note: "The classic showcase of O(n²) vs O(n log n)." },
      { slug: "searching", note: "Where O(n) linear vs O(log n) binary search shows up." },
    ],
  },
  {
    slug: "time-vs-space",
    tagline: "You can often buy speed with memory, or save memory by spending time.",
    problem:
      "A function recomputes the same expensive result thousands of times. You could store each result the first time you compute it, so later calls are instant — but now you're holding all those results in memory. On a small machine that extra memory might be the thing you can't afford. Speed and memory are two budgets, and improving one usually charges the other.",
    how: [
      {
        type: "para",
        text: "Most optimizations trade one resource for the other. Spend memory to save time: cache results, precompute a lookup table, keep an index. Spend time to save memory: recompute values on demand, stream data instead of loading it all, compress it. There's rarely a free lunch — the skill is knowing which resource is scarce in your situation.",
      },
      {
        type: "points",
        items: [
          "Memoization / caching: store computed results so you never redo the work — more memory, less time.",
          "Lookup tables: precompute answers up front so runtime is a simple read.",
          "Streaming: process data in chunks to keep memory flat — less memory, more passes/time.",
          "Compression: shrink storage and transfer at the cost of CPU to pack and unpack.",
        ],
      },
      {
        type: "note",
        text: "Which resource is scarce depends entirely on context. On a phone or an embedded device memory is precious; on a server serving many requests, latency often wins and memory is cheap.",
      },
    ],
    tradeoffs: {
      good: [
        "Gives you a deliberate lever to pull when one resource is the bottleneck.",
        "Caching and memoization can turn an infeasible computation into an instant one.",
        "Streaming lets you handle data far larger than memory.",
      ],
      costs: [
        "Caches add complexity: staleness, invalidation, and memory that must be bounded.",
        "Precomputing wastes effort if the results are never used.",
        "Trading toward less memory usually means more CPU work, and vice versa — you rarely improve both.",
      ],
    },
    realWorld:
      "This tradeoff is behind most real performance work: adding a cache, precomputing a report, streaming a large file, or choosing a hash map (memory) over a linear scan (time). 'Should we cache this?' is the time-vs-space question in everyday form.",
    related: [
      { slug: "big-o-notation", note: "Both time and space have their own big-O." },
      { slug: "complexity-classes", note: "The growth rates that apply to memory too." },
      { slug: "caching-perf", note: "Spending memory to save time, in practice." },
      { slug: "dynamic-programming", note: "Trades memory for speed by storing subproblem results." },
    ],
  },
];
