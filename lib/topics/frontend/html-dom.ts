import type { TopicContent } from "@/lib/topics";

export const htmlDom: TopicContent = {
  slug: "html-dom",
  tagline:
    "How the browser turns a page of HTML text into a live tree it can style and change.",
  problem:
    "You save an .html file, open it, and the page appears. But then a script adds a row to a table, a menu opens, a counter ticks up — and none of that new content is anywhere in the file you wrote. If the page were just the text on disk, it could never change without reloading. So what is the browser actually working with once the file is loaded?",
  demo: "dom-tree",
  how: [
    {
      type: "para",
      text: "HTML is just text — a document written with tags like <h1> and <p>. When the browser loads it, it doesn't keep that text around to work from. It parses it once into the DOM (Document Object Model): a tree of objects in memory, one node per tag, that represents the page. Everything that happens next — styling, clicks, scripts — happens against this tree, not against the original text.",
    },
    {
      type: "para",
      text: "The tree mirrors how your tags nest. An element that sits inside another becomes its child; elements side by side are siblings; the tag that wraps them is their parent. So nesting in the HTML turns directly into depth in the tree. Not every node is an element, though: the words between tags are text nodes, and the key=\"value\" pairs on a tag are its attributes.",
    },
    {
      type: "para",
      text: "Because the DOM is a live set of objects, JavaScript can read and change it: document.createElement makes a new node, appendChild attaches it, and setting element.innerHTML replaces a whole subtree at once. The moment the script runs, the on-screen page reflects the new tree — no file was touched and no reload happened.",
    },
    {
      type: "code",
      code: '<div class="card">\n  <h1>Welcome</h1>\n  <p>Ready to go?</p>\n  <button>Buy now</button>\n</div>',
      caption:
        "Four elements. The <div> is the parent; <h1>, <p>, and <button> are its children (siblings of each other). \"Welcome\" and \"Buy now\" are text nodes inside their elements, and class=\"card\" is an attribute.",
    },
    {
      type: "demo",
      demo: "dom-tree",
    },
    {
      type: "points",
      items: [
        "HTML is text; the DOM is the parsed, in-memory tree the browser builds from it.",
        "Nesting becomes hierarchy: parent, child, and sibling relationships come straight from how tags are nested.",
        "Nodes come in kinds — element nodes (the tags), text nodes (the words), and attributes on elements.",
        "JavaScript changes the live tree (createElement, appendChild, innerHTML), and the screen updates instantly.",
      ],
    },
    {
      type: "note",
      text: "\"View source\" shows the original HTML the server sent — a static snapshot. The DOM is what's actually live in the browser, and once scripts have run it can look nothing like that source. To see the real tree, use the Elements panel in dev tools, not View Source.",
    },
  ],
  tradeoffs: {
    good: [
      "A single, consistent tree that CSS can style and JavaScript can query and edit.",
      "Pages can change after loading — content updates without a full reload.",
      "The parent/child/sibling structure makes it natural to target and traverse elements.",
      "Every browser exposes the same DOM API, so one script works everywhere.",
    ],
    costs: [
      "The live DOM diverges from the source file, so 'view source' can mislead you when debugging.",
      "Touching the DOM repeatedly is slow — each change can force the browser to recompute layout.",
      "innerHTML is convenient but rebuilds a whole subtree and can open security holes with untrusted input.",
      "A deep or huge tree costs memory and makes traversals and updates more expensive.",
    ],
  },
  realWorld:
    "Every interactive page you use is DOM manipulation: a like count updating, a modal opening, a form showing an error. React and other frameworks exist largely to manage these DOM changes for you efficiently. When you inspect an element in dev tools, you're looking straight at a node in this tree.",
  related: [
    {
      slug: "css-layout",
      note: "CSS reads the same DOM tree to decide how each node looks and is positioned.",
    },
    {
      slug: "browser-rendering",
      note: "How the browser turns the parsed DOM into actual pixels on screen.",
    },
    {
      slug: "dom-events",
      note: "How JavaScript listens for clicks and input on DOM nodes and reacts.",
    },
    {
      slug: "components-state",
      note: "Frameworks describe the DOM you want and update the tree for you.",
    },
    {
      slug: "accessibility",
      note: "Assistive tech reads an accessibility tree derived from your DOM.",
    },
  ],
};
