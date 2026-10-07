# Embedding Surveyor Mapper — integration contract

For the team building the application that embeds Surveyor Mapper.

## 1. Embed the page

```html
<iframe id="surveyor-mapper" src="https://<surveyor-host>/surveyor/surveyor-mapper"
        style="width:100%;height:800px;border:0"></iframe>
```

- **Do not put the token in the URL.** URLs end up in server logs, browser history and `Referer` headers.
- **Send us your exact origin**, for example `https://appraisal.example.co.id`. Surveyor Mapper only accepts messages from an allowlist of origins and ignores all others. Your origin also has to be allowed to frame the page; see §4.

## 2. Messages

Every message is a plain object.

| Direction | Message | When |
|---|---|---|
| iframe → you | `{ source: 'surveyor-mapper', version: 1, type: 'ready' }` | The iframe has loaded and is listening, or the user pressed "Coba lagi". |
| you → iframe | `{ source: 'appraisal-host', type: 'auth', token: '<JWT>' }` | Reply to every `ready` and every `auth-expired`. |
| iframe → you | `{ source: 'surveyor-mapper', version: 1, type: 'auth-expired' }` | The token expires in under a minute, or the backend rejected it (401). Reply with a fresh `auth`. |

`token` must be a JWT issued by **appraisal-backend** (`POST /auth/login` → `object.token`), and must not be expired.
- **Identity:** Surveyor Mapper reads the user (`sub`) and roles (`roles`) from the token itself. Any other fields you send are ignored.
- **Verification:** the backend checks the token's signature on every request.

**Wait for `ready` before sending `auth`.** A message sent before the iframe's listener exists is lost.

## 3. Parent-side example

```js
const SURVEYOR_ORIGIN = 'https://<surveyor-host>'          // exact origin of the iframe
const frame = document.getElementById('surveyor-mapper')

window.addEventListener('message', async (event) => {
  // Only trust our own iframe, from its real origin.
  if (event.origin !== SURVEYOR_ORIGIN || event.source !== frame.contentWindow) return
  const msg = event.data
  if (!msg || msg.source !== 'surveyor-mapper') return

  if (msg.type === 'ready' || msg.type === 'auth-expired') {
    const token = await getCurrentAppraisalToken()        // your own session handling; refresh if needed
    frame.contentWindow.postMessage(
      { source: 'appraisal-host', type: 'auth', token },
      SURVEYOR_ORIGIN                                       // never '*'
    )
  }
})
```

## 4. Server configuration (Tomcat / reverse proxy)

The Surveyor app's responses must allow framing by your origin, and only by your origin:

```
Content-Security-Policy: frame-ancestors 'self' https://<your-origin>
```

This header can't be set from the frontend code: browsers ignore `frame-ancestors` in a `<meta>` tag. It has to be added by the reverse proxy in front of Tomcat, or by a servlet filter.
