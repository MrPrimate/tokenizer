import { init, ready } from "./hooks.js";

// registering the hooks
Hooks.on("ready", ready);
Hooks.on("init", init);
