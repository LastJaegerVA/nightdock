# Contributing to Nightdock

Thanks for helping! Bug reports, ideas, code and translation fixes are all welcome.

## Reporting a bug

Open an [issue](../../issues/new/choose) and include:

- your system (for example *Windows 11* or *CachyOS*) and the Nightdock version (shown at the bottom of Settings)
- which launcher it's about, if any
- what you expected, and what happened instead

## Running the code

```bash
npm install
npm start
```

The app's background code is in `src/` (`main.js` runs the window and opens launchers,
`detect.js` finds installed launchers). The interface is in `renderer/`.

Adding a launcher that Nightdock should find automatically: add an entry to `WIN_KNOWN`
or `LINUX_KNOWN` in `src/detect.js`.

## Translations

Every language is one file in [`renderer/locales/`](renderer/locales/) — for example
`renderer/locales/de.js`. English (the reference) and the first seven languages live in
`renderer/i18n.js`.

**Fixing a translation:** edit the text after the colon in that language's file and open a
pull request. Keep `{placeholders}` like `{name}` or `{n}` exactly as they are.

**Adding a new language:**

1. Copy an existing file in `renderer/locales/` to `<code>.js` (use the ISO code, for example `sk.js` for Slovak).
2. Change the code on the first line and translate every value.
3. Add `{ code: 'sk', name: 'Slovenčina' }` to `LANGUAGES` in `renderer/i18n.js`, and a
   `<script src="locales/sk.js"></script>` line in `renderer/index.html`.
4. Optional: add the installer texts to `build/installer_strings_more.py`.

Words that change with a number (like *1 launcher / 2 launchers*) can be written as
`["one", "other"]`, or as `{ "one": …, "few": …, "many": …, "other": … }` for languages with
more forms. Nightdock picks the right one automatically.

## Pull requests

- Keep each pull request about one thing.
- Describe what you changed and how you tested it (Windows, Linux or both).
- By contributing, you agree that your contribution is released under the project's
  [MIT License](LICENSE).
