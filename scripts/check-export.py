"""Check links and asset references in the static export without network access."""

import os
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

OUT = Path("out").resolve()
BASE = os.environ.get("SITE_BASE_PATH", "").rstrip("/")
ORIGIN = urlsplit(os.environ.get("SITE_URL") or "https://phillipcarter.dev").netloc


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.references = []
        self.anchors = set()
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.anchors.add(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.anchors.add(attrs["name"])
        for attr in ("href", "src", "poster"):
            if attrs.get(attr):
                self.references.append(attrs[attr])
        if tag == "meta" and attrs.get("property") == "og:image" and attrs.get("content"):
            self.references.append(attrs["content"])
        if attrs.get("srcset"):
            self.references.extend(
                entry.strip().split()[0]
                for entry in attrs["srcset"].split(",")
                if entry.strip()
            )


def export_url(file):
    path = file.relative_to(OUT).as_posix()
    if path.endswith("index.html"):
        path = path.removesuffix("index.html")
    return f"https://{ORIGIN}{BASE}/{path}"


pages = {file: Page(file.read_text()) for file in OUT.rglob("*.html")}
if OUT / "index.html" not in pages:
    raise SystemExit("Missing out/index.html. Build the site before checking the export.")

errors = []


def check(source, reference):
    url = urlsplit(urljoin(export_url(source), reference))
    if url.scheme not in ("http", "https") or url.netloc != ORIGIN:
        return
    if not url.path.startswith(f"{BASE}/"):
        errors.append(f"{source.relative_to(OUT)}: {reference} escapes {BASE or '/'}")
        return

    path = url.path[len(BASE) + 1:]
    # Some hosts decode the requested path. The export can also contain encoded names.
    for relative in (unquote(path), path):
        target = (OUT / relative).resolve()
        if not target.is_relative_to(OUT):
            continue
        if target.is_dir():
            target /= "index.html"
        if target.is_file():
            if url.fragment and target in pages and unquote(url.fragment) not in pages[target].anchors:
                errors.append(f"{source.relative_to(OUT)}: missing anchor in {reference}")
            return
    errors.append(f"{source.relative_to(OUT)}: missing target for {reference}")


for source, page in pages.items():
    for reference in page.references:
        check(source, reference)

styles = list(OUT.rglob("*.css"))
for source in styles:
    for reference in re.findall(r"url\(\s*[\"']?([^\"')]+)[\"']?\s*\)", source.read_text()):
        check(source, reference.strip())

if errors:
    raise SystemExit("\n".join(sorted(set(errors))))
print(f"Checked internal links and assets across {len(pages)} HTML files and {len(styles)} CSS files.")
