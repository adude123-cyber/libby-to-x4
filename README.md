# libby → x4

A typewriter-style setup wizard that sends your Libby loans to an **Xteink X4** running
**CrossPoint 2.0** with the **Protected Content** plugin (from Plugin Hub).

Live: https://adude123-cyber.github.io/libby-to-x4/

It runs in two places, from the same code (`wizard.js`):

- **the website**: talks to the reader over your Wi-Fi
- **the reader's own file manager**: as an SD plugin (`plugin/`), installable from the website's
  "find the reader" step, or by copying `plugin/manifest.json` and `plugin/plugin.js`
  into `/plugins/libby-x4/` on the SD card

## Steps

1. **setup**: one-time checklist (flash, enable plugins, install Protected Content, sign in with an Adobe ID)
2. **reader**: connect to `crosspoint.local` or its IP (website only)
3. **libby**: link once with an 8-digit Libby setup code (Menu → Copy to another device)
4. **books**: tick loans (or drop `.acsm` files)
5. **send**: for each book the reader downloads the `.acsm` from Libby, then Protected Content fulfils it

Libby is reached through the reader's `/api/relay` and `/api/fetch`, so the browser never calls
Libby directly. This uses Libby's unofficial API (same as the calibre Libby plugin) and may break.
Books stay DRM-protected: they're decrypted on the reader and expire with the loan.

## Develop

Edit `wizard.js`, then run `./build.sh` to regenerate `plugin/plugin.js`.
