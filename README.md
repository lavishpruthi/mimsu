# Data Tools — JSON &amp; XML Utilities

A small, dependency-free suite of JSON/XML tools: beautifier, minifier,
parser/validator, JSON→XML, XML→JSON, and an XML formatter. Everything
runs client-side in the browser — no server, no build step, no data
ever leaves the page.

## Project structure

```
json-xml-toolkit/
├── index.html               # app shell — links CSS, loads js/app.js as a module
├── css/
│   ├── variables.css        # design tokens (colors, fonts, spacing) — dark + light
│   ├── base.css             # reset, global typography, scrollbars
│   ├── layout.css           # app shell layout: topbar, sidebar, main grid
│   ├── buttons.css          # every button variant + label style
│   ├── components.css       # panes, toolbar, stat cards, banners, toast, home table
│   └── loader.css           # the animated "processing" indicator
└── js/
    ├── app.js               # entry point: wires router → sidebar/home/tool views
    ├── config/
    │   └── tools.config.js  # the tool registry — add new tools here
    ├── core/                # framework-agnostic helpers, no tool-specific logic
    │   ├── dom.js            # el() element builder
    │   ├── router.js         # hash router
    │   ├── format-utils.js   # byte size / line count / line+col from index
    │   ├── json-utils.js     # JSON parsing + structural analysis
    │   ├── xml-utils.js      # XML parsing + escaping
    │   ├── clipboard.js      # copy-to-clipboard with fallback
    │   ├── download.js       # save-as-file via Blob
    │   ├── toast.js          # transient notifications
    │   └── loader.js         # the futuristic loading indicator
    ├── tools/                # one file per tool, each a self-contained module
    │   ├── json-beautifier.js
    │   ├── json-minifier.js
    │   ├── json-validator.js
    │   ├── json-to-xml.js
    │   ├── xml-to-json.js
    │   └── xml-formatter.js
    └── ui/
        ├── sidebar.js         # builds the nav from the tool registry
        ├── home-view.js       # "/" directory page
        ├── tool-view.js       # generic workspace shared by every tool
        └── theme-toggle.js
```

## Running it locally

The app uses native ES modules (`import`/`export`), which browsers
refuse to load over `file://`. Serve the folder with any static file
server, for example:

```bash
cd json-xml-toolkit
npm start                # same as: python3 -m http.server 8080
# then open http://localhost:8080
```

or `npx serve`, or any static host.

## Dev tooling (optional)

- `npm run build:bundle` — inlines every CSS/JS file into `dist/index.html`,
  a single self-contained file. Useful for environments that require one
  file (email, a sandboxed preview, etc.). The multi-file source under
  `css/` and `js/` remains the version to edit; `dist/index.html` is
  generated, not hand-maintained.
- `npm install && npm run test:smoke` — a headless (jsdom) check that
  boots the bundle, visits every route, runs each tool's "Load sample"
  + run action, and fails if any console error fires or a tool doesn't
  produce output.

## Deploying it

It's plain static files — deploy the folder as-is to GitHub Pages,
Netlify, Vercel, S3 + CloudFront, nginx, or any web server. No build
step is required.

If you want each tool served at a real, separate server-side context
root (e.g. a Java/Tomcat or Spring Boot deployment with `/json-tools`,
`/xml-tools` as distinct webapps) rather than this single-page app's
client-side routes, that's a different architecture — ask and it can
be scaffolded separately.

## Adding a new tool

Everything is driven by `js/config/tools.config.js`. To add a tool:

1. Create `js/tools/your-tool.js` exporting a default object:

   ```js
   export default {
     id: "your-tool",              // becomes the route: #/your-tool
     menuId: "json",               // "json" | "xml" | "convert" | a new group id
     title: "Your Tool",
     desc: "One sentence description.",
     outputExt: "json",            // used for the download filename
     outputLabel: "Output",
     loadingLabel: "PROCESSING",   // shown in the loader while it runs
     sample: "example input",
     options: [],                  // see OPTION SHAPES in tools.config.js
     run(input, opts) {
       // return a string, or { output, stats } to also render stat cards
     }
   };
   ```

2. Import it in `js/config/tools.config.js` and add it to `TOOL_MODULES`.
3. If `menuId` is new, add a label for it to `MENUS` in the same file.

The sidebar, the home directory, and the router all read from this
registry, so nothing else needs to change.

## Notes on the loading indicator

`js/core/loader.js` shows pulsing `{ < / > }` glyphs, a scanning
gradient bar, and a status label that "decrypts" into place using a
text-scramble effect. Since most conversions here finish in under a
millisecond, the loader enforces a small minimum visible duration
(~420ms by default) so the animation is always perceptible — tune or
remove this in `Loader.run()` if you'd rather it be instantaneous.
