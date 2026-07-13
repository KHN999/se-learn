import type { TopicContent } from "@/lib/topics";
import { htmlDom } from "./frontend/html-dom";
import { cssLayout } from "./frontend/css-layout";
import { browserRendering } from "./frontend/browser-rendering";
import { domEvents } from "./frontend/dom-events";
import { componentsState } from "./frontend/components-state";
import { reactivityRerender } from "./frontend/reactivity-rerender";
import { clientRoutingSpa } from "./frontend/client-routing-spa";
import { stateManagement } from "./frontend/state-management";
import { accessibility } from "./frontend/accessibility";
import { bundlingBuild } from "./frontend/bundling-build";
import { webPerformance } from "./frontend/web-performance";

// The Frontend & the Browser area — one file per topic under ./frontend/.
export const batchFrontend: TopicContent[] = [
  htmlDom,
  cssLayout,
  browserRendering,
  domEvents,
  componentsState,
  reactivityRerender,
  clientRoutingSpa,
  stateManagement,
  accessibility,
  bundlingBuild,
  webPerformance,
];
