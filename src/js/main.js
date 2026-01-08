import { AnimationEngine } from "./engine.js";
import { MystifyAnimation } from "./animations/mystify.js";
import { PretzelAnimation } from "./animations/pretzels.js";
import { LabelOverlay } from "./overlays/labelOverlay.js";

const canvas = document.getElementById("stage");
const engine = new AnimationEngine(canvas);
engine.setOverlay(new LabelOverlay());
engine.register("mystify", new MystifyAnimation());
engine.register("pretzels", new PretzelAnimation());
engine.bindResize();

const animationNames = Array.from(engine.animations.keys());
const pickRandomAnimation = (exclude) => {
  const options = animationNames.filter((name) => name !== exclude);
  if (options.length === 0) return exclude;
  return options[Math.floor(Math.random() * options.length)];
};

const randomAnimation = pickRandomAnimation(null);
engine.start(randomAnimation);
window.setInterval(() => {
  const next = pickRandomAnimation(engine.activeName);
  engine.switchTo(next);
}, 10000);
