import type { TopicContent } from "@/lib/topics";

export const cssLayout: TopicContent = {
  slug: "css-layout",
  tagline:
    "How you control what every element looks like and where it sits on the page.",
  problem:
    "You give a card width: 300px, then add some breathing room with padding: 20px and a 1px border. You measure it in the browser and it's 342px wide — wide enough to shove the card next to it off its row and break your neat two-column layout. You never asked for 342px. Where did the extra pixels come from, and why doesn't width mean width?",
  demo: "box-model",
  how: [
    {
      type: "para",
      text: "Every element the browser draws is a rectangular box, and that box is built from four nested layers: the content in the middle, then padding around it, then a border, then margin on the outside. CSS lets you set each layer independently. The confusing part is what the width property actually measures: by default it sizes the content box only, so padding and border are added on top. A 300px width with 20px padding on each side and a 1px border renders at 300 + 40 + 2 = 342px.",
    },
    {
      type: "para",
      text: "The fix is box-sizing: border-box, which redefines width to include padding and border. Now width: 300px means the whole box is 300px and the content shrinks to fit inside — which is what most people expect and want. It's so much saner that nearly every codebase sets it globally on the first line of its stylesheet.",
    },
    {
      type: "code",
      code: "/* the one rule almost every stylesheet starts with */\n*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n.card {\n  width: 300px;   /* now the WHOLE box is 300px wide */\n  padding: 20px;  /* eats into the 300px, doesn't add to it */\n  border: 1px solid #ccc;\n}",
      caption:
        "border-box makes width mean the total width, so padding and border no longer blow up the size.",
    },
    {
      type: "demo",
      demo: "box-model",
    },
    {
      type: "para",
      text: "Once boxes are sized, you arrange them. Elements are block (stack top-to-bottom, take the full width — like a paragraph) or inline (sit in a row, only as wide as their content — like a link). For real layout you reach for flexbox or grid. Flexbox lays boxes out in one dimension — a row or a column — with a main axis you distribute along (justify-content) and a cross axis you align across (align-items). Grid is two-dimensional: you define rows and columns and place items into the cells. Together they replaced the float and table hacks people once used to fake columns.",
    },
    {
      type: "points",
      items: [
        "Box model: total size = content + padding + border + margin (margin sits outside the box).",
        "box-sizing: border-box folds padding and border into the width you set — the sane default.",
        "Block elements stack and fill the width; inline elements flow in a line.",
        "Flexbox = 1-D (a row or column); Grid = 2-D (rows and columns at once).",
        "Responsive design uses relative units (%, rem, vw) and media queries to adapt to screen size.",
      ],
    },
    {
      type: "note",
      text: "CSS is powerful but full of surprising interactions. Vertical margins between stacked elements collapse into one instead of adding up; which rule wins is decided by specificity and the cascade, not just source order; and a value inherited from a distant ancestor can quietly change a child. When layout looks 'haunted,' it's usually one of these rules doing exactly what it's specified to do — just not what you assumed.",
    },
  ],
  tradeoffs: {
    good: [
      "Separates appearance from content — restyle a whole site without touching the HTML.",
      "Flexbox and grid make once-hard layouts (centering, equal columns) genuinely easy.",
      "Relative units and media queries let one stylesheet fit phones through desktops.",
      "The cascade lets you set broad defaults and override them narrowly where needed.",
    ],
    costs: [
      "The default box model surprises everyone at least once — hence the global border-box reset.",
      "Specificity, the cascade, and inheritance interact in ways that are hard to predict.",
      "Margin collapse and other quirks produce spacing 'bugs' that are actually spec behavior.",
      "There's often more than one way to lay something out, and picking the wrong tool fights you.",
    ],
  },
  realWorld:
    "Every visual detail you notice on a web page — spacing, alignment, columns that reflow on a phone — is CSS doing its job. Open DevTools and hover an element: the box-model diagram it draws (blue content, green padding, orange margin) is exactly this model, and it's the fastest way to see why something is the size it is or why two boxes won't sit side by side.",
  related: [
    { slug: "html-dom", note: "CSS styles the very element tree the DOM exposes." },
    {
      slug: "browser-rendering",
      note: "Layout is the stage where the browser turns your CSS into pixel positions.",
    },
    {
      slug: "accessibility",
      note: "Visual order set by CSS should still match a sensible reading order for screen readers.",
    },
    {
      slug: "web-performance",
      note: "Heavy layout and reflow work is a common cause of janky, slow-feeling pages.",
    },
    {
      slug: "components-state",
      note: "UI components ship their own scoped styles built on these same box and layout rules.",
    },
  ],
};
