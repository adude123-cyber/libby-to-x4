# libby → x4

A single-page GitHub Pages site that sends Libby loans to an **Xteink X4** running
**CrossPoint 2.0** with the **Protected Content** plugin (from Plugin Hub).

You drop the `.acsm` files from Libby onto the page. It then:

1. checks the reader at `http://crosspoint.local` (or its IP) via `GET /api/status`
2. creates the target folder (default `/Libby`) via `POST /mkdir`
3. uploads each `.acsm` via `POST /upload`
4. queues `{plugin:"protected-content", action:"fulfill", args:{path}}` on `POST /api/plugin-jobs`
5. opens the reader's headless runner (`/plugins-run`) in a small popup so the plugin can run the job
6. polls `GET /api/plugin-jobs/status` until the book is on the card

The plugin downloads the encrypted EPUB next to the `.acsm`, writes the key, and deletes the `.acsm`.
DRM stays in place: the book is decrypted on the device and expires with the loan.

## One-time setup on the reader

- Flash CrossPoint 2.0 (https://crosspointreader.com/#flash-tools)
- Settings → Connectivity → Plugins → **Enabled**
- Home → Plugins → Plugin Hub → Install, then install **Protected Content**
- Start File Transfer in **join network** mode (not hotspot)
- Open `http://crosspoint.local/files` and sign in with your Adobe ID on the Protected Content card

## Deploy

```sh
git init && git add . && git commit -m "libby to x4"
gh repo create libby-to-x4 --public --source . --push
gh api -X POST repos/{owner}/libby-to-x4/pages -f "source[branch]=main" -f "source[path]=/"
```

## Browser notes

The page is HTTPS and the reader is plain HTTP on your LAN. Chrome and Edge allow this
through Local Network Access (click **Allow** on the prompt). If your browser blocks it,
use the page's "save this page" link and open the saved file locally, or upload the
`.acsm` by hand in the reader's file manager.
