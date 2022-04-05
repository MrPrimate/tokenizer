import { init, ready } from "./hooks.js";

// registering the hooks
Hooks.on("init", init);
Hooks.once("ready", ready);
