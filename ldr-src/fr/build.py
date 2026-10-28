import sys, pathlib
from playwright.sync_api import sync_playwright

base = pathlib.Path(__file__).parent
jobs = [("ind-as-1.html", "FR_LDR_IndAS1_Presentation.pdf"), ("ind-as-10.html", "FR_LDR_IndAS10_Events_after_RP.pdf")]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    for src, out in jobs:
        pg.goto((base / src).as_uri())
        pg.wait_for_timeout(600)
        over = pg.evaluate("""() => [...document.querySelectorAll('.page')].map((el,i)=>{
            const r=el.getBoundingClientRect(); const foot=el.querySelector('.foot').getBoundingClientRect();
            let maxB=0; el.querySelectorAll(':scope > *:not(.foot):not(.head)').forEach(c=>{maxB=Math.max(maxB,c.getBoundingClientRect().bottom)});
            return {page:i+1, contentBottom: Math.round(maxB-r.top), footTop: Math.round(foot.top-r.top)}})""")
        print(src, over)
        pg.pdf(path=str(base / out), format="A4", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    b.close()
