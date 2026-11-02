"""Build one LDR PDF: python3 build1.py <src.html> <out.pdf>; prints content bottom per page vs footer top (~1081)."""
import sys, pathlib
from playwright.sync_api import sync_playwright

base = pathlib.Path(__file__).parent.resolve()
src, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto((base / src).as_uri())
    pg.wait_for_timeout(600)
    print(pg.evaluate("""() => [...document.querySelectorAll('.page')].map((el,i)=>{const r=el.getBoundingClientRect();let m=0;
      el.querySelectorAll(':scope > *:not(.foot):not(.head)').forEach(c=>{m=Math.max(m,c.getBoundingClientRect().bottom)});
      return [i+1, Math.round(m-r.top)]})"""))
    pg.pdf(path=str(base / out), format="A4", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    b.close()
