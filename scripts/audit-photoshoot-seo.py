"""Audit prerendered photoshoot pages after `npm run build`.
Usage: python3 scripts/audit-photoshoot-seo.py pricing/feminine services/feminine-photography gallery/feminine
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import sys

ROOT = Path(__file__).resolve().parents[1] / 'dist/client'

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.schemas = []
        self.buffer = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.buffer = ''

    def handle_data(self, data):
        if self.buffer is not None:
            self.buffer += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.buffer is not None:
            self.schemas.append(json.loads(self.buffer))
            self.buffer = None

    def attrs(self, tag):
        return [attrs for name, attrs in self.tags if name == tag]

for route in sys.argv[1:]:
    html = (ROOT / route / 'index.html').read_text()
    page = Page(html)
    canonical = [a['href'] for a in page.attrs('link') if a.get('rel') == 'canonical']
    assert canonical == ['https://yulia.photography/' + route], (route, canonical)
    assert len(page.attrs('h1')) == 1, (route, 'H1 count')
    robots = [a.get('content', '') for a in page.attrs('meta') if a.get('name') == 'robots']
    assert robots and not any('noindex' in v or 'nosnippet' in v for v in robots), (route, robots)
    og = [a['content'] for a in page.attrs('meta') if a.get('property') == 'og:image']
    assert og and all(urlparse(u).scheme == 'https' for u in og), (route, 'OG image')
    for image in og:
        path = unquote(urlparse(image).path)
        assert (ROOT / path.lstrip('/')).is_file(), (route, path)
    ids = {a['id'] for _, a in page.tags if 'id' in a}
    for a in page.attrs('a'):
        href = a.get('href', '')
        if href.startswith('#') and len(href) > 1:
            assert href[1:] in ids, (route, href)
    for a in page.attrs('img'):
        assert 'alt' in a and a.get('width') and a.get('height'), (route, 'image accessibility/dimensions')
    service = next((s for s in page.schemas if s.get('@type') == 'Service'), None)
    if service:
        for offer in service['offers']:
            assert str(offer['price']) in html and offer['priceCurrency'] == 'ILS', (route, offer)
            target = urlparse(offer['url'])
            offer_page = Page((ROOT / target.path.strip('/') / 'index.html').read_text())
            assert any(a.get('id') == target.fragment for _, a in offer_page.tags), offer['url']
    sitemap = ''.join(p.read_text() for p in ROOT.glob('sitemap-*.xml'))
    assert canonical[0] in sitemap, (route, 'missing sitemap entry')
    print(f'PASS {route}: canonical, indexing, H1, JSON-LD, offer anchors, images, sitemap; HTML {len(html.encode()):,} bytes')
