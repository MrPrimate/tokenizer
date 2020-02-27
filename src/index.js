import { init, ready } from './hooks.js';

// show the trusted player warning only once
let hasShownWarning = false;

// registering the hooks
Hooks.on('ready', ready);
Hooks.on('init', init);
