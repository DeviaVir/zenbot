# zenbot extensions

To support various exchanges or strategies, zenbot "extensions" can be made.
This is a directory with a `_codemap.js` at root, which zenbot will scan and add to the codebase.
Zenbot comes with `gdax` exchange and `trend_ema_rate` strategy as built-in (example) extensions, but other extensions
can live in external git repos and be cloned, dropped or symlinked here.

You may have to `npm install` in the extension directory, and/or copy and configure `conf-sample.js` to `conf.js` for it to work.
