/* libby → x4 setup wizard.
 * One file, two homes:
 *   - the GitHub Pages site (mode "remote": talks to the reader over the LAN)
 *   - a CrossPoint SD plugin card in the reader's File Manager (mode "device": same origin)
 * Libby is reached through the reader's /api/relay and /api/fetch, so the browser
 * never needs Libby to allow cross-origin requests.
 */
(function () {
  'use strict';
  if (window.LibbyX4) return;

  const PLUGIN = 'libby-x4';
  const LIBBY = 'https://sentry-read.svc.overdrive.com/';
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15';
  const ADOBE_EPUB = 'ebook-epub-adobe';

  const CSS = `
.lx4{--paper:#f4efe4;--ink:#1d1b17;--faded:#6d675c;--rule:#cfc6b4;--red:#a3271d;--ok:#2f5d34;--sel:#e6dcc6;
  font:16px/1.6 "Courier Prime","Courier New",Courier,monospace;color:var(--ink);background:var(--paper);
  text-align:left;box-sizing:border-box}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .lx4{--paper:#191815;--ink:#e9e3d6;--faded:#9a9384;--rule:#3a372f;--red:#e0705f;--ok:#8dbf8a;--sel:#2a2823}}
:root[data-theme="dark"] .lx4{--paper:#191815;--ink:#e9e3d6;--faded:#9a9384;--rule:#3a372f;--red:#e0705f;--ok:#8dbf8a;--sel:#2a2823}
.lx4 *{box-sizing:border-box;font:inherit}
.lx4.card-mode{padding:20px 16px;border:1px solid var(--ink)}
.lx4 h2{font-weight:700;font-size:1.15rem;margin:0 0 4px;min-height:1.6em}
.lx4 h2 .c{display:inline-block;width:.55em;border-bottom:2px solid var(--ink);margin-left:2px;animation:lx4b 1.1s steps(1) infinite}
@keyframes lx4b{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.lx4 h2 .c{animation:none}}
.lx4 .kicker{color:var(--faded);margin:0 0 20px}
.lx4 p{margin:0 0 12px}
.lx4 .f{color:var(--faded)}
.lx4 .ok{color:var(--ok)}
.lx4 .err{color:var(--red)}
.lx4 a{color:inherit;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.lx4 a:hover{color:var(--red)}
.lx4 code{background:var(--sel);padding:0 4px}
.lx4 .body{min-height:300px}
.lx4 .chk{display:flex;gap:.8em;align-items:flex-start;margin:0 0 10px;cursor:pointer}
.lx4 .chk input{appearance:none;-webkit-appearance:none;margin:0;flex:none;color:inherit;width:2.2em;height:1.6em;cursor:pointer;background:none;border:0}
.lx4 .chk input::before{content:"[ ]"}
.lx4 .chk input:checked::before{content:"[x]"}
.lx4 .chk input:disabled{cursor:default}
.lx4 .chk input:focus-visible{outline:1px dashed var(--ink);outline-offset:2px}
.lx4 .done input:checked+span{color:var(--faded);text-decoration:line-through;text-decoration-thickness:1px}
.lx4 .chk .meta{display:block;color:var(--faded);font-size:.88em}
.lx4 .chk.off{cursor:default;color:var(--faded)}
.lx4 .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}
.lx4 label.l{color:var(--faded)}
.lx4 input[type=text]{color:var(--ink);background:transparent;border:0;border-bottom:1px solid var(--ink);padding:2px 0;min-width:0;flex:1 1 180px;border-radius:0}
.lx4 input[type=text]:focus{outline:none;border-bottom-width:2px}
.lx4 input.code{letter-spacing:.35em;font-size:1.3rem;flex:0 1 11em}
.lx4 button{color:var(--ink);background:transparent;cursor:pointer;border:1px solid var(--ink);padding:4px 14px;border-radius:0;line-height:1.5}
.lx4 button:hover:not(:disabled){background:var(--ink);color:var(--paper)}
.lx4 button:focus-visible{outline:1px dashed var(--ink);outline-offset:3px}
.lx4 button:disabled{opacity:.35;cursor:default}
.lx4 button.ln{border:0;padding:0;text-decoration:underline;text-underline-offset:3px}
.lx4 button.ln:hover:not(:disabled){background:none;color:var(--red)}
.lx4 .drop{border:1px dashed var(--ink);padding:20px 12px;text-align:center;cursor:pointer;margin:8px 0 12px}
.lx4 .drop.over,.lx4 .drop:hover{background:var(--sel)}
.lx4 ul.q{list-style:none;padding:0;margin:0 0 12px}
.lx4 ul.q li{display:flex;gap:12px;justify-content:space-between;padding:4px 0;border-bottom:1px dotted var(--rule)}
.lx4 ul.q .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.lx4 ul.q .s{flex:none;color:var(--faded)}
.lx4 pre.log{white-space:pre-wrap;word-break:break-word;margin:8px 0 0;font-size:.88rem;max-height:220px;overflow:auto}
.lx4 details{margin:8px 0 12px}
.lx4 summary{cursor:pointer;color:var(--faded);list-style:none}
.lx4 summary::-webkit-details-marker{display:none}
.lx4 summary::before{content:"+ "}
.lx4 details[open] summary::before{content:"- "}
.lx4 details>div{padding:8px 0 0 1.2em}
.lx4 .foot{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px dashed var(--rule);margin-top:24px;padding-top:16px}
.lx4 .foot>button{min-width:6.5em}
.lx4 .dots{display:flex;gap:12px;justify-content:center;flex:1}
.lx4 .dots button{width:11px;height:11px;padding:0;border-radius:50%;border:1px solid var(--ink);background:transparent;min-width:0}
.lx4 .dots button[aria-current="step"]{background:var(--ink)}
.lx4 .dots button:disabled{opacity:.3}
.lx4 .dots button:hover:not(:disabled){background:var(--sel)}
.lx4 .dots button[aria-current="step"]:hover{background:var(--ink)}
.lx4 .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
`;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  class Blocked extends Error {}

  function mount(root, opts) {
    const remote = opts.mode === 'remote';
    const store = {
      get(k, d) { try { const v = localStorage.getItem('lx4.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
      set(k, v) { try { if (v === undefined) localStorage.removeItem('lx4.' + k); else localStorage.setItem('lx4.' + k, JSON.stringify(v)); } catch (e) {} },
    };

    if (!document.getElementById('lx4-css')) {
      const st = document.createElement('style');
      st.id = 'lx4-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    root.classList.add('lx4');
    if (!remote) root.classList.add('card-mode');

    // ---------------- state ----------------
    const S = {
      step: 0,
      seen: 0,
      host: store.get('host', 'crosspoint.local'),
      folder: store.get('folder', '/Libby'),
      checks: store.get('checks', {}),
      token: store.get('token', null),
      sent: store.get('sent', {}),
      device: null,          // /api/status
      plugins: null,         // names from /api/plugins
      devErr: '',
      blocked: false,
      loans: null,
      loansErr: '',
      loansBusy: false,
      pick: {},              // loan id -> true
      files: [],             // manual .acsm File objects
      manual: false,
      linkBusy: false,
      linkErr: '',
      jobs: [],              // send step items
      sending: false,
      log: [],
    };
    const STEPS = remote
      ? [['setup', 'one-time setup'], ['reader', 'find the reader'], ['libby', 'link libby'], ['books', 'pick books'], ['send', 'send']]
      : [['setup', 'before you start'], ['libby', 'link libby'], ['books', 'pick books'], ['send', 'send']];
    if (S.token) S.seen = STEPS.length - 2; // returning user: let them jump around

    // ---------------- reader I/O ----------------
    let lna = null; // does this browser/address want Chrome's local-network hint?
    const base = () => {
      if (!remote) return '';
      const h = String(S.host || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return 'http://' + (h || 'crosspoint.local');
    };
    async function dev(path, init, timeoutMs) {
      const ctl = new AbortController();
      const t = timeoutMs ? setTimeout(() => ctl.abort(), timeoutMs) : null;
      // targetAddressSpace: Chrome's Local Network Access hint that lets an https
      // page talk to a plain-http device on the LAN. Ignored elsewhere.
      const o = Object.assign({}, init || {}, { signal: ctl.signal });
      try {
        if (remote && lna !== false) {
          // A wrong address-space hint fails before anything is sent, so retrying
          // without it can't double-submit a request.
          try { const r = await fetch(base() + path, Object.assign({ targetAddressSpace: 'local' }, o)); lna = true; return r; }
          catch (e) { if ((e && e.name === 'AbortError') || lna === true) throw e; }
          const r = await fetch(base() + path, o); lna = false; return r;
        }
        return await fetch(base() + path, o);
      } catch (e) {
        if (e && e.name === 'AbortError') { const x = new Error('reader did not answer in time'); x.timeout = true; throw x; }
        throw new Blocked('could not reach ' + (base() || 'the reader') + ' (blocked, asleep, or wrong address)');
      } finally { if (t) clearTimeout(t); }
    }
    const postJson = (path, obj, timeoutMs) =>
      dev(path, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(obj) }, timeoutMs);

    async function ensureFolder(folder) {
      const parts = folder.split('/').filter(Boolean);
      let parent = '/';
      for (const name of parts) {
        const res = await dev('/api/files?path=' + encodeURIComponent(parent), null, 15000);
        const entries = res.ok ? await res.json() : [];
        if (!entries.some((e) => e.isDirectory && e.name.toLowerCase() === name.toLowerCase())) {
          const r = await dev('/mkdir', { method: 'POST', body: new URLSearchParams({ name, path: parent }) }, 15000);
          if (!r.ok) throw new Error('could not create ' + name + ': ' + (await r.text()).trim());
        }
        parent = (parent === '/' ? '' : parent) + '/' + name;
      }
    }
    async function upload(blob, folder, name) {
      const fd = new FormData();
      fd.append('file', blob, name);
      const r = await dev('/upload?overwrite=1&path=' + encodeURIComponent(folder), { method: 'POST', body: fd }, 60000);
      if (!r.ok) throw new Error('upload failed: ' + (await r.text()).trim());
    }
    async function delFile(path) {
      try { await dev('/delete', { method: 'POST', body: new URLSearchParams({ path }) }, 10000); } catch (e) {}
    }
    // GET a URL straight onto the SD card through the reader (follows redirects).
    async function fetchToSd(url, dest, headers) {
      const r = await postJson('/api/fetch', { plugin: PLUGIN, url, dest, headers }, 180000);
      const text = (await r.text()).trim();
      let res = null;
      try { res = JSON.parse(text); } catch (e) {}
      if (!r.ok || !res) throw new Error('reader fetch failed: ' + ((res && res.error) || text.slice(0, 120) || r.status));
      if (res.error || res.complete === false || (res.status && res.status >= 400)) {
        throw new Error('libby answered HTTP ' + res.status + (res.error ? ' (' + res.error + ')' : ''));
      }
      return res;
    }
    async function readSdText(path) {
      const r = await dev('/download?path=' + encodeURIComponent(path), null, 30000);
      if (!r.ok) throw new Error('could not read ' + path);
      return r.text();
    }

    async function checkReader() {
      S.devErr = ''; S.device = null; S.plugins = null; S.blocked = false;
      draw();
      try {
        const r = await dev('/api/status', null, 8000);
        if (!r.ok) throw new Error('reader answered HTTP ' + r.status);
        S.device = await r.json();
        try {
          const p = await dev('/api/plugins', null, 8000);
          const list = p.ok ? await p.json() : [];
          S.plugins = Array.isArray(list) ? list.map((x) => x.name) : [];
        } catch (e) { S.plugins = []; }
      } catch (e) {
        S.devErr = e.message;
        S.blocked = e instanceof Blocked;
      }
      draw();
      return !!S.device;
    }

    // ---------------- libby through the reader ----------------
    function libbyHeaders(extra) {
      const h = { Accept: 'application/json', Referer: 'https://libbyapp.com/', 'User-Agent': UA };
      if (S.token) h.Authorization = 'Bearer ' + S.token;
      return Object.assign(h, extra || {});
    }
    // Raw relay call. Upstream status/headers are only readable on the reader's own
    // page (the device doesn't expose them cross-origin), so remote gets null there.
    async function relay(method, url, headers, body) {
      const r = await postJson('/api/relay', { plugin: PLUGIN, method, url, headers, body: body || '' }, 30000);
      let text;
      try { text = await r.text(); } catch (e) { const x = new Error('relay cut short'); x.status = 502; throw x; }
      if (!r.ok) {
        const x = new Error(r.status === 403 || /disabled/i.test(text) ? 'plugins are disabled on the reader' : 'reader relay: HTTP ' + r.status + ' ' + text.slice(0, 120));
        x.status = r.status; throw x;
      }
      let status = null, location = null;
      try {
        status = r.headers.get('X-Relay-Status') ? Number(r.headers.get('X-Relay-Status')) : null;
        const raw = r.headers.get('X-Relay-Headers');
        if (raw) {
          const list = JSON.parse(new TextDecoder().decode(Uint8Array.from(raw, (c) => c.charCodeAt(0))));
          const loc = list.find((h) => String(h[0]).toLowerCase() === 'location');
          if (loc) location = loc[1];
        }
      } catch (e) {}
      return { text, status, location };
    }
    async function libby(method, path, body) {
      const headers = libbyHeaders();
      let b = '';
      if (body !== undefined) { headers['Content-Type'] = 'application/json; charset=UTF-8'; b = JSON.stringify(body); }
      const { text } = await relay(method, LIBBY + path, headers, b);
      try { return JSON.parse(text); } catch (e) { throw new Error('libby sent something unexpected: ' + text.slice(0, 120)); }
    }
    // Get a loan's .acsm onto the card at `path`.
    // 1) the reader downloads it directly (/api/fetch, follows redirects);
    // 2) if Libby refuses that, ask again through the relay, which sends the same
    //    browser-like request that already works for the shelf, and show what Libby said.
    async function getAcsm(loan, folder, name) {
      const path = folder + '/' + name;
      const url = LIBBY + 'card/' + loan.cardId + '/loan/' + loan.id + '/fulfill/' + ADOBE_EPUB;
      let firstErr = null;
      try {
        await fetchToSd(url, path, libbyHeaders({ Accept: '*/*' }));
        const head = await readSdText(path);
        if (/fulfillmentToken/i.test(head)) return path;
        await delFile(path);
        firstErr = new Error('libby sent something that is not an .acsm: ' + head.replace(/\s+/g, ' ').slice(0, 160));
      } catch (e) {
        if (e instanceof Blocked) throw e;
        firstErr = e;
      }
      let hop = await relay('GET', url, libbyHeaders({ Accept: '*/*' }));
      for (let i = 0; i < 3 && !/fulfillmentToken/i.test(hop.text); i++) {
        // follow a redirect if we can see where it goes
        let next = hop.location;
        if (!next) { const m = /https?:\/\/[^\s"'<>]+/.exec(hop.text || ''); next = m && /fulfill|acsm|contentreserve/i.test(m[0]) ? m[0].replace(/&amp;/g, '&') : null; }
        if (!next) break;
        const sameHost = new URL(next, url).host === new URL(LIBBY).host;
        hop = await relay('GET', new URL(next, url).href, sameHost ? libbyHeaders({ Accept: '*/*' }) : { Accept: '*/*', 'User-Agent': UA });
      }
      if (/fulfillmentToken/i.test(hop.text)) {
        await upload(new Blob([hop.text], { type: 'application/vnd.adobe.adept+xml' }), folder, name);
        return path;
      }
      const said = (hop.text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      throw new Error(firstErr.message + (said ? ' · libby said: ' + said : hop.status ? ' · relay got HTTP ' + hop.status : ''));
    }
    async function libbySync() {
      try {
        return await libby('GET', 'chip/sync');
      } catch (e) {
        if (e.status !== 502) throw e;
        // big accounts can exceed the relay's 64KB cap: stage the reply on the card instead
        const tmp = cleanFolder() + '/libby-sync.json';
        await ensureFolder(cleanFolder());
        await fetchToSd(LIBBY + 'chip/sync', tmp, libbyHeaders());
        const text = await readSdText(tmp);
        await delFile(tmp);
        return JSON.parse(text);
      }
    }
    async function linkLibby(code) {
      S.linkBusy = true; S.linkErr = ''; draw();
      const prev = S.token;
      try {
        S.token = null;
        const chip = await libby('POST', 'chip?client=dewey');
        if (!chip || !chip.identity) throw new Error('libby did not hand out a session');
        S.token = chip.identity;
        await libby('POST', 'chip/clone/code', { code });
        const sync = await libbySync();
        if (!(sync && sync.result === 'synchronized' && sync.cards && sync.cards.length)) {
          throw new Error('that code did not link. codes only last about a minute, so grab a fresh one.');
        }
        store.set('token', S.token);
        ingest(sync);
        S.linkBusy = false;
        go(stepIndex('books'));
        return;
      } catch (e) {
        S.token = prev;
        S.linkErr = e.message;
        if (e instanceof Blocked) S.blocked = true;
      }
      S.linkBusy = false; draw();
    }
    function unlink() {
      S.token = null; S.loans = null; S.pick = {};
      store.set('token', undefined);
      draw();
    }
    function ingest(sync) {
      const loans = (sync.loans || []).filter((l) => (l.type || 'ebook') === 'ebook' || (l.formats || []).some((f) => /^ebook/.test(f.id)));
      S.loans = loans.map((l) => {
        const fmts = l.formats || [];
        const locked = (fmts.find((f) => f.isLockedIn) || {}).id;
        let why = '';
        if (locked && locked !== ADOBE_EPUB) why = locked === 'ebook-kindle' ? 'sent to kindle already' : 'locked to ' + locked.replace(/^ebook-/, '');
        else if (!fmts.some((f) => f.id === ADOBE_EPUB)) why = 'no epub edition';
        return { id: String(l.id), cardId: String(l.cardId), title: l.title || 'untitled', author: l.firstCreatorName || '', due: l.expireDate, why };
      });
      S.loansErr = '';
    }
    async function loadLoans() {
      if (!S.token || S.loansBusy) return;
      S.loansBusy = true; S.loansErr = ''; draw();
      try {
        const sync = await libbySync();
        if (!(sync && sync.result === 'synchronized')) throw new Error('libby session expired. link again with a new code.');
        ingest(sync);
      } catch (e) {
        S.loansErr = e.message;
        if (/expired/.test(e.message)) unlink();
        if (e instanceof Blocked) S.blocked = true;
      }
      S.loansBusy = false; draw();
    }

    // ---------------- sending ----------------
    function cleanFolder() {
      let f = '/' + String(S.folder || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      if (f.includes('..') || f.length > 60) f = '/Libby';
      return f === '/' ? '/Libby' : f;
    }
    async function enqueue(path) {
      for (let i = 0; i < 30; i++) {
        const r = await postJson('/api/plugin-jobs', { plugin: 'protected-content', action: 'fulfill', args: { path } }, 15000);
        if (r.ok) return (await r.json()).id;
        const msg = (await r.text()).trim();
        if (r.status === 503) { await sleep(4000); continue; }
        if (r.status === 403 || /disabled/i.test(msg)) throw new Error('plugins are disabled on the reader');
        throw new Error('could not queue: HTTP ' + r.status + ' ' + msg);
      }
      throw new Error('reader job queue stayed full');
    }
    // Hand the .acsm to Protected Content.
    // On the reader's own page that plugin is loaded right here, so call it directly:
    // no job queue, no status polling competing with the book download for the
    // reader's memory and sockets. Its own status line is mirrored into ours.
    async function fulfil(job, path) {
      const host = window.CrossPoint;
      const direct = !remote && host && host._actions && host._actions['protected-content'] && host._actions['protected-content'].fulfill;
      if (direct) {
        job.phase = 'handing to protected content'; drawJobs();
        log(job.name + ' → protected content');
        const mirror = setInterval(() => {
          const el = document.getElementById('lib-status');
          const t = el && el.textContent.trim().split('\n')[0];
          if (t && t !== job.phase) { job.phase = t.replace(/[“”…]/g, '').toLowerCase().slice(0, 60); drawJobs(); }
        }, 700);
        try { return (await direct({ path })) || {}; } finally { clearInterval(mirror); }
      }
      job.phase = 'queueing'; drawJobs();
      const id = await enqueue(path);
      log(job.name + ' → job #' + id);
      return waitJob(job, id);
    }
    // The reader serves one request at a time, so while it downloads a book these
    // status checks queue behind it and eat memory it needs. Check rarely once
    // the download is running and treat timeouts as "still busy".
    async function waitJob(job, id) {
      const start = Date.now();
      let running = false;
      while (Date.now() - start < 15 * 60 * 1000) {
        await sleep(running ? 10000 : 3000);
        let s;
        try {
          const r = await dev('/api/plugin-jobs/status?id=' + id, null, 25000);
          if (!r.ok) continue;
          s = await r.json();
        } catch (e) {
          if (e.timeout) { running = true; job.phase = 'reader busy downloading'; drawJobs(); continue; }
          throw e;
        }
        if (s.state === 'running') running = true;
        if (s.state === 'done') return s.result || {};
        if (s.state === 'error') throw new Error((s.result && s.result.error) || 'protected content reported an error');
        if (s.state === 'unknown') throw new Error('job vanished (did the reader restart or leave file transfer?)');
        job.phase = s.state === 'running' ? 'downloading book' : 'waiting for the runner';
        job.stalled = s.state === 'pending' && Date.now() - start > 30000;
        drawJobs();
      }
      throw new Error('gave up after 15 minutes. the book may still land; check the library on the reader.');
    }
    let runnerWin = null;
    function openRunner() {
      if (!remote) return true;
      if (runnerWin && !runnerWin.closed) return true;
      runnerWin = window.open(base() + '/plugins-run', 'x4runner', 'popup,width=420,height=300');
      return !!runnerWin;
    }

    async function sendAll() {
      if (S.sending) return;
      S.sending = true;
      const folder = cleanFolder();
      const loans = (S.loans || []).filter((l) => S.pick[l.id]);
      S.jobs = loans.map((l) => ({ kind: 'loan', loan: l, name: l.title, state: 'todo', phase: 'waiting' }))
        .concat(S.files.map((f) => ({ kind: 'file', file: f, name: f.name, state: 'todo', phase: 'waiting' })));
      S.log = [];
      draw();
      const tick = setInterval(drawJobs, 1000);
      try {
        log('folder ' + folder);
        await ensureFolder(folder);
        for (const job of S.jobs) {
          job.state = 'busy'; job.t0 = Date.now();
          try {
            let path;
            if (job.kind === 'loan') {
              job.phase = 'getting ticket from libby'; drawJobs();
              path = await getAcsm(job.loan, folder, 'libby-' + job.loan.id + '.acsm');
            } else {
              job.phase = 'uploading'; drawJobs();
              const name = 'libby-' + Date.now().toString(36) + '.acsm';
              path = folder + '/' + name;
              await upload(job.file, folder, name);
            }
            const res = await fulfil(job, path);
            job.state = 'done'; job.phase = 'on the reader'; job.t1 = Date.now();
            if (job.kind === 'loan') { S.sent[job.loan.id] = Date.now(); store.set('sent', S.sent); delete S.pick[job.loan.id]; }
            log('“' + (res.title || job.name) + '” → ' + (res.dest || folder) + (res.bytes ? ' · ' + Math.round(res.bytes / 1024) + ' kb' : '') + ' · ' + mmss(job.t1 - job.t0), 'ok');
          } catch (e) {
            job.state = 'error'; job.phase = 'failed'; job.t1 = Date.now();
            log(job.name + ': ' + e.message, 'err');
            if (/not activated|sign in/i.test(e.message)) log('sign in on the protected content card in the reader’s file manager, then try again.', 'err');
            if (e instanceof Blocked) { S.blocked = true; break; }
          }
          drawJobs();
        }
        S.files = [];
        const ok = S.jobs.filter((j) => j.state === 'done').length;
        if (ok) log(ok + ' book' + (ok > 1 ? 's' : '') + ' delivered. open the library on the reader.' + (remote ? ' you can close the runner tab.' : ''), 'ok');
      } catch (e) {
        log(e.message, 'err');
      } finally {
        clearInterval(tick);
        S.sending = false;
        draw();
      }
    }
    function log(msg, cls) {
      S.log.push({ t: new Date().toTimeString().slice(0, 8), msg, cls });
      const el = root.querySelector('pre.log');
      if (el) { el.innerHTML = logHtml(); el.scrollTop = el.scrollHeight; }
    }
    const logHtml = () => S.log.map((l) => '<span class="f">' + l.t + '</span>  ' + (l.cls ? '<span class="' + l.cls + '">' + esc(l.msg) + '</span>' : esc(l.msg))).join('\n');

    // install this wizard onto the reader as an SD plugin (remote only)
    async function installPlugin(btn) {
      btn.disabled = true; btn.textContent = 'installing…';
      try {
        const files = ['manifest.json', 'plugin.js'];
        const blobs = [];
        for (const f of files) {
          const r = await fetch('plugin/' + f, { cache: 'no-store' });
          if (!r.ok) throw new Error('could not load ' + f + ' from this site');
          blobs.push(await r.blob());
        }
        await ensureFolder('/plugins/' + PLUGIN);
        for (let i = 0; i < files.length; i++) await upload(blobs[i], '/plugins/' + PLUGIN, files[i]);
        await checkReader();
      } catch (e) {
        S.devErr = 'install failed: ' + e.message; draw();
      }
    }

    // ---------------- view ----------------
    const stepIndex = (k) => STEPS.findIndex((s) => s[0] === k);
    const canNext = () => {
      const k = STEPS[S.step][0];
      if (k === 'reader') return !!S.device;
      if (k === 'libby') return !!S.token;
      if (k === 'books') return selectedCount() > 0 && !S.sending;
      if (k === 'send') return false;
      return true;
    };
    const selectedCount = () => (S.loans || []).filter((l) => S.pick[l.id]).length + S.files.length;

    function go(i) {
      if (i < 0 || i >= STEPS.length) return;
      S.step = i; S.seen = Math.max(S.seen, i);
      draw(true);
      const k = STEPS[i][0];
      if (k === 'reader' && !S.device && !S.devErr) checkReader();
      if (k === 'books' && S.token && !S.loans && !S.loansBusy) loadLoans();
      if (k === 'send' && !S.sending && selectedCount()) sendAll();
    }

    function setupHtml() {
      const items = remote ? [
        ['fw', 'flash <a href="https://crosspointreader.com/#flash-tools" target="_blank" rel="noopener">crosspoint 2.0</a> onto the x4.'],
        ['plug', 'on the reader: <code>settings → connectivity → plugins → enabled</code>.'],
        ['hub', '<code>home → plugins → plugin hub → install</code>, then install <b>protected content</b> from the hub.'],
        ['wifi', 'start <code>file transfer</code> in <i>join network</i> mode (not hotspot) so the reader can reach the internet.'],
        ['adobe', 'open the reader’s <a href="' + esc(base()) + '/files" target="_blank" rel="noopener">file manager</a> and sign in on the <b>protected content</b> card with your adobe id.'],
      ] : [
        ['adobe', 'sign in on the <b>protected content</b> card on this page with your adobe id (once).'],
        ['wifi', 'the reader is on your home wi-fi (<i>join network</i>), not its own hotspot.'],
      ];
      return '<p class="f">tick these off once. they’re remembered in this browser.</p>' +
        items.map(([k, h]) => '<label class="chk done"><input type="checkbox" data-chk="' + k + '"' + (S.checks[k] ? ' checked' : '') + '><span>' + h + '</span></label>').join('');
    }

    function readerHtml() {
      let st = '';
      if (S.device) {
        const d = S.device;
        const hasPC = S.plugins && S.plugins.includes('protected-content');
        const hasMe = S.plugins && S.plugins.includes(PLUGIN);
        st = '<p><span class="ok">connected.</span> ' + esc(d.device || 'x4') + ' · crosspoint ' + esc(d.version || '?') + ' · ' + esc(d.ip || '') + '</p>' +
          (d.mode === 'AP' ? '<p class="err">! the reader is in hotspot mode. switch file transfer to <i>join network</i> so it can reach libby and adobe.</p>' : '') +
          (S.plugins ? '<p>' + (hasPC ? '<span class="ok">[x]</span> protected content installed' : '<span class="err">[ ] protected content not found.</span> install it from plugin hub on the reader.') + '</p>' : '') +
          (S.plugins ? '<p>' + (hasMe ? '<span class="ok">[x]</span> this wizard is also in the reader’s file manager. <button type="button" class="ln" data-act="install">update it</button>' :
            '<span class="f">[ ]</span> also put this wizard in the reader’s file manager? <button type="button" class="ln" data-act="install">install it</button>') + '</p>' : '');
      } else if (S.devErr) {
        st = '<p class="err">' + esc(S.devErr) + '</p>';
      } else {
        st = '<p class="f">knocking…</p>';
      }
      return '<div class="row"><label class="l" for="lx4-host">address</label>' +
        '<input type="text" id="lx4-host" spellcheck="false" autocomplete="off" value="' + esc(S.host) + '">' +
        '<button type="button" data-act="connect">connect</button></div>' +
        '<p class="f">if <code>crosspoint.local</code> doesn’t answer, use the ip shown on the reader’s screen.</p>' +
        '<div aria-live="polite">' + st + '</div>' + blockedHtml();
    }
    function blockedHtml() {
      if (!remote || !S.blocked) return '';
      return '<details open><summary>browser won’t connect?</summary><div>' +
        '<p>this page is https and the reader is plain http, which some browsers block.</p>' +
        '<p>· in chrome or edge, click <b>allow</b> when asked about devices on your local network.</p>' +
        '<p>· or run this same wizard on the reader itself: copy <a href="plugin/manifest.json" download>manifest.json</a> and <a href="plugin/plugin.js" download>plugin.js</a> into <code>/plugins/' + PLUGIN + '/</code> on the sd card, then open the reader’s file manager.</p>' +
        '</div></details>';
    }

    function libbyHtml() {
      if (S.token) {
        return '<p><span class="ok">linked.</span> your libby loans can be listed.</p>' +
          '<p class="f">the link lives in this browser only. <button type="button" class="ln" data-act="unlink">unlink</button></p>';
      }
      return '<ol style="margin:0 0 16px;padding-left:1.4em">' +
        '<li>open libby on your phone.</li>' +
        '<li>menu → <code>copy to another device</code>, and follow it until you see an 8-digit setup code (<a href="https://help.libbyapp.com/en-us/6070.htm" target="_blank" rel="noopener">libby’s help</a>).</li>' +
        '<li>type the 8 digits here within a minute.</li></ol>' +
        '<div class="row"><label class="l" for="lx4-code">code</label>' +
        '<input type="text" class="code" id="lx4-code" inputmode="numeric" maxlength="8" autocomplete="one-time-code" placeholder="00000000">' +
        '<button type="button" data-act="link"' + (S.linkBusy ? ' disabled' : '') + '>' + (S.linkBusy ? 'linking…' : 'link') + '</button></div>' +
        (S.linkErr ? '<p class="err">' + esc(S.linkErr) + '</p>' : '') +
        '<p class="f">libby talks to the reader, the reader talks to libby. this uses libby’s unofficial api, so it may break someday.</p>' +
        '<p><button type="button" class="ln" data-act="manual">skip. i have .acsm files.</button></p>' + blockedHtml();
    }

    function booksHtml() {
      let list = '';
      if (S.token) {
        if (S.loansBusy) list = '<p class="f">reading your shelf…</p>';
        else if (S.loansErr) list = '<p class="err">' + esc(S.loansErr) + '</p>';
        else if (S.loans && !S.loans.length) list = '<p class="f">no ebook loans on your shelf.</p>';
        else if (S.loans) {
          list = S.loans.map((l) => {
            const due = l.due ? 'due ' + new Date(l.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
            const sent = S.sent[l.id] ? ' · sent before' : '';
            const off = !!l.why;
            return '<label class="chk' + (off ? ' off' : '') + '"><input type="checkbox" data-loan="' + esc(l.id) + '"' +
              (S.pick[l.id] ? ' checked' : '') + (off ? ' disabled' : '') + '><span>' + esc(l.title) +
              '<span class="meta">' + esc([l.author, due].filter(Boolean).join(' · ')) + esc(sent) + (off ? ' · <span class="err">' + esc(l.why) + '</span>' : '') + '</span></span></label>';
          }).join('');
        }
        list += '<p><button type="button" class="ln" data-act="refresh"' + (S.loansBusy ? ' disabled' : '') + '>refresh shelf</button></p>';
      }
      const files = S.files.length ? '<ul class="q">' + S.files.map((f, i) => '<li><span class="n">' + esc(f.name) + '</span><button type="button" class="ln" data-rm="' + i + '" aria-label="remove">x</button></li>').join('') + '</ul>' : '';
      const manual = '<div class="drop" tabindex="0" role="button" data-act="pick">drop .acsm files here <span class="f">or click</span></div>' +
        '<input type="file" class="sr" accept=".acsm" multiple tabindex="-1">' + files;
      return list +
        (S.token ? '<details' + (S.files.length || S.manual ? ' open' : '') + '><summary>add .acsm files too</summary><div>' + manual + '</div></details>' : manual) +
        '<div class="row"><label class="l" for="lx4-folder">reader folder</label><input type="text" id="lx4-folder" spellcheck="false" value="' + esc(S.folder) + '"></div>' +
        (remote ? '<p class="f">pressing send opens a small tab on the reader. it does the adobe part. leave it open.</p>' : '');
    }

    function jobsHtml() {
      if (!S.jobs.length) return '<p class="f">nothing picked yet. go back and choose some books.</p>';
      const now = Date.now();
      return '<ul class="q">' + S.jobs.map((j, i) => {
        const t = j.t0 ? ' ' + mmss((j.t1 || now) - j.t0) : '';
        const cls = j.state === 'done' ? 'ok' : j.state === 'error' ? 'err' : 'f';
        return '<li><span class="n">' + esc(j.name) + '</span><span class="s ' + cls + '">' + esc(j.phase) + t + '</span></li>' +
          (j.stalled && j.state === 'busy' ? '<li class="err" style="display:block">the job hasn’t started. ' +
            (remote ? 'is the runner tab open? <button type="button" class="ln" data-act="runner">open it</button>' : 'keep this page open, and check protected content is installed.') + '</li>' : '');
      }).join('') + '</ul>';
    }
    function sendHtml() {
      return '<div class="jobs" aria-live="polite">' + jobsHtml() + '</div><pre class="log">' + logHtml() + '</pre>' +
        (!S.sending && S.jobs.length ? '<p style="margin-top:12px"><button type="button" data-act="again">send more</button></p>' : '');
    }
    function drawJobs() {
      const el = root.querySelector('.jobs');
      if (el) el.innerHTML = jobsHtml();
    }

    const BODY = { setup: setupHtml, reader: readerHtml, libby: libbyHtml, books: booksHtml, send: sendHtml };
    const KICK = {
      setup: 'borrow on libby, read on your xteink. a few things first.',
      reader: 'the reader should be on its file transfer screen.',
      libby: 'connect your libby shelf once.',
      books: 'tick what you want on the x4.',
      send: 'sit tight. a novel usually takes under a minute.',
    };

    let typer = null;
    function draw(animate) {
      const [k, title] = STEPS[S.step];
      const nextLabel = k === 'books' ? 'send ' + (selectedCount() || '') : 'next';
      root.innerHTML =
        (remote ? '' : '<p class="f" style="margin:0 0 8px">libby → x4</p>') +
        '<h2><span class="tt"></span><span class="c" aria-hidden="true"></span></h2>' +
        '<p class="kicker">' + esc(KICK[k]) + '</p>' +
        '<div class="body">' + BODY[k]() + '</div>' +
        '<div class="foot">' +
        '<button type="button" data-act="back"' + (S.step === 0 || S.sending ? ' disabled' : '') + '>back</button>' +
        '<nav class="dots" aria-label="steps">' + STEPS.map((s, i) =>
          '<button type="button" data-dot="' + i + '" aria-label="step ' + (i + 1) + ': ' + s[1] + '"' +
          (i === S.step ? ' aria-current="step"' : '') + (i > S.seen || S.sending ? ' disabled' : '') + '></button>').join('') + '</nav>' +
        '<button type="button" data-act="next"' + (canNext() ? '' : ' disabled') + (k === 'send' ? ' style="visibility:hidden"' : '') + '>' + nextLabel.trim() + '</button>' +
        '</div>';
      const tt = root.querySelector('.tt');
      clearInterval(typer);
      if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let n = 0;
        typer = setInterval(() => { tt.textContent = title.slice(0, ++n); if (n >= title.length) clearInterval(typer); }, 38);
      } else tt.textContent = title;
      const lg = root.querySelector('pre.log'); if (lg) lg.scrollTop = lg.scrollHeight;
    }

    // ---------------- events (delegated, survive redraws) ----------------
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-act],[data-dot],[data-rm]');
      if (!t || t.disabled) return;
      if (t.dataset.dot) return go(+t.dataset.dot);
      if (t.dataset.rm) { S.files.splice(+t.dataset.rm, 1); return draw(); }
      const a = t.dataset.act;
      if (a === 'back') go(S.step - 1);
      else if (a === 'next') {
        if (STEPS[S.step][0] === 'books' && remote && !openRunner()) {
          // popup blocked: carry on, the stall hint offers a manual button
        }
        go(S.step + 1);
      }
      else if (a === 'connect') checkReader();
      else if (a === 'install') installPlugin(t);
      else if (a === 'link') {
        const code = (root.querySelector('#lx4-code').value || '').replace(/\D/g, '');
        if (code.length !== 8) { S.linkErr = 'the code is 8 digits.'; return draw(); }
        linkLibby(code);
      }
      else if (a === 'unlink') unlink();
      else if (a === 'manual') { S.manual = true; go(stepIndex('books')); }
      else if (a === 'refresh') loadLoans();
      else if (a === 'pick') root.querySelector('input[type=file]').click();
      else if (a === 'runner') { runnerWin = null; openRunner(); }
      else if (a === 'again') { S.jobs = []; S.log = []; go(stepIndex('books')); if (S.token) loadLoans(); }
    });
    root.addEventListener('keydown', (e) => {
      if (e.target.id === 'lx4-host' && e.key === 'Enter') checkReader();
      if (e.target.id === 'lx4-code' && e.key === 'Enter') root.querySelector('[data-act=link]').click();
      if (e.target.dataset && e.target.dataset.act === 'pick' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.click(); }
    });
    root.addEventListener('input', (e) => {
      const t = e.target;
      if (t.id === 'lx4-host') { S.host = t.value.trim(); store.set('host', S.host); S.device = null; S.devErr = ''; lna = null; }
      if (t.id === 'lx4-folder') { S.folder = t.value.trim(); store.set('folder', S.folder); }
    });
    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.chk) { S.checks[t.dataset.chk] = t.checked; store.set('checks', S.checks); }
      else if (t.dataset.loan) { if (t.checked) S.pick[t.dataset.loan] = true; else delete S.pick[t.dataset.loan]; refreshFoot(); }
      else if (t.type === 'file') { addFiles(t.files); t.value = ''; }
    });
    function refreshFoot() {
      const nb = root.querySelector('[data-act=next]');
      if (nb) { nb.disabled = !canNext(); nb.textContent = ('send ' + (selectedCount() || '')).trim(); }
    }
    function addFiles(list) {
      for (const f of list) {
        if (!/\.acsm$/i.test(f.name)) continue;
        if (!S.files.some((x) => x.name === f.name && x.size === f.size)) S.files.push(f);
      }
      if (STEPS[S.step][0] !== 'books') go(stepIndex('books')); else draw();
    }
    root.addEventListener('dragover', (e) => { const d = e.target.closest && e.target.closest('.drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
    root.addEventListener('dragleave', (e) => { const d = e.target.closest && e.target.closest('.drop'); if (d) d.classList.remove('over'); });
    root.addEventListener('drop', (e) => { const d = e.target.closest && e.target.closest('.drop'); if (d) { e.preventDefault(); d.classList.remove('over'); addFiles(e.dataTransfer.files); } });

    // returning users land where they left off
    if (S.token) S.step = stepIndex('books');
    draw(true);
    if (STEPS[S.step][0] === 'books') loadLoans();
    if (remote && S.step >= stepIndex('reader')) checkReader();
    return { addFiles };
  }

  window.LibbyX4 = { mount };
})();
