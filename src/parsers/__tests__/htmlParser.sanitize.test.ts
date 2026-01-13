import { sanitizeHtmlDocument } from '../htmlParser';

describe('sanitizeHtmlDocument', () => {
  it('removes script-like nodes and inline handlers', () => {
    const parser = new DOMParser();
    const html = `<!doctype html><html><body>
      <script>alert('xss')</script>
      <style>.hidden { display:none; }</style>
      <a href="javascript:alert('hi')" onclick="evil()" src="data:text/html;base64,AAAA">hello</a>
    </body></html>`;

    const doc = parser.parseFromString(html, 'text/html');
    const sanitized = sanitizeHtmlDocument(doc);
    expect(sanitized.querySelectorAll('script').length).toBe(0);
    expect(sanitized.querySelectorAll('style').length).toBe(0);

    const anchor = sanitized.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('onclick')).toBeNull();
    expect(anchor?.getAttribute('href')).toBeNull();
    expect(anchor?.getAttribute('src')).toBeNull();
    expect(anchor?.textContent?.trim()).toBe('hello');
  });

  it('removes embedded frames and refresh metadata', () => {
    const parser = new DOMParser();
    const html = `<!doctype html><html><head>
      <meta http-equiv="refresh" content="0;url=https://bad" />
      <link rel="preload" href="https://bad.js" />
    </head><body>
      <iframe src="https://bad"></iframe>
      <embed src="https://bad"></embed>
      <object data="https://bad"></object>
      <p>Safe text</p>
    </body></html>`;

    const doc = parser.parseFromString(html, 'text/html');
    const sanitized = sanitizeHtmlDocument(doc);

    expect(sanitized.querySelectorAll('meta[http-equiv="refresh"]').length).toBe(0);
    expect(sanitized.querySelectorAll('link[rel="preload"]').length).toBe(0);
    expect(sanitized.querySelectorAll('iframe').length).toBe(0);
    expect(sanitized.querySelectorAll('embed').length).toBe(0);
    expect(sanitized.querySelectorAll('object').length).toBe(0);
    expect(sanitized.querySelector('p')?.textContent?.trim()).toBe('Safe text');
  });
});
