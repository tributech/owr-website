"""Screenshot a page of the running dev server at desktop and phone width, light and dark.

    uvx --with playwright python tools/page-shots/shoot.py http://127.0.0.1:5097/battle-scorer/ <out-dir> [sections]

Writes desktop-light.png, desktop-dark.png, phone-light.png, phone-dark.png (1440x900 at 1x,
390x844 at 2x). `sections` (default 2) is how many top-level <main> sections to include.
The cookie banner and the Astro dev toolbar are hidden, and lazy images are forced to load.
"""
import sys
from playwright.sync_api import sync_playwright

url, out = sys.argv[1], sys.argv[2]
sections = int(sys.argv[3]) if len(sys.argv) > 3 else 2
HIDE = '#cookie-banner, astro-dev-toolbar { display: none !important; }'

with sync_playwright() as p:
    browser = p.chromium.launch()
    for scheme in ['light', 'dark']:
        for name, vp, mobile in [('desktop', {'width': 1440, 'height': 900}, False),
                                 ('phone', {'width': 390, 'height': 844}, True)]:
            ctx = browser.new_context(viewport=vp, color_scheme=scheme, device_scale_factor=2 if mobile else 1,
                                      is_mobile=mobile, has_touch=mobile)
            page = ctx.new_page()
            page.goto(url, wait_until='networkidle')
            page.add_style_tag(content=HIDE)
            page.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')")
            page.wait_for_timeout(800)
            bottom = page.evaluate(
                f"document.querySelector('main > section:nth-of-type({sections})').getBoundingClientRect().bottom + window.scrollY")
            page.screenshot(path=f'{out}/{name}-{scheme}.png', full_page=True,
                            clip={'x': 0, 'y': 0, 'width': vp['width'], 'height': bottom})
            ctx.close()
    browser.close()
