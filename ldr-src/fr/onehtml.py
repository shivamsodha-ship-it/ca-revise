import re, pathlib
order = ["cover.html","ind-as-110.html","ind-as-32.html","ind-as-115.html","ind-as-101.html","ind-as-19.html","ind-as-109.html","ind-as-20.html","conceptual-framework.html","ethics-fr.html","ind-as-23.html","acctg-tech.html","ind-as-1.html","ind-as-105.html","ind-as-10.html","ind-as-8.html","ind-as-16.html","ind-as-12.html"]
styles, bodies = [], []
for f in order:
    s = pathlib.Path(f).read_text()
    styles += re.findall(r"<style>(.*?)</style>", s, re.S)
    bodies.append(re.search(r"<body>(.*)</body>", s, re.S).group(1))
out = '<!doctype html><html><head><meta charset="utf-8"><title>FR LDR Master Pack</title><link rel="stylesheet" href="style.css"><style>' + "\n".join(styles) + '</style></head><body>' + "\n".join(bodies) + '</body></html>'
pathlib.Path("master.html").write_text(out)
