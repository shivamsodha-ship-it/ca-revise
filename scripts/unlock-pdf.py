#!/usr/bin/env python3
"""Unlock PDFs before processing: remove copy/print restrictions and, with the user's password, open protection.

Usage:
  python3 scripts/unlock-pdf.py                 # every PDF in inbox/
  python3 scripts/unlock-pdf.py a.pdf b.pdf     # specific files
  PDF_PASSWORD='…' python3 scripts/unlock-pdf.py file.pdf    # file that needs an open password

Writes unlocked copies to inbox/unlocked/<same name>.pdf and never modifies the originals.
A file that needs an open password is skipped (exit code 2) until the user supplies it; this script
does not guess or crack passwords. Each output is re-opened and checked: not encrypted, same page
count, and text extractable (pages without text are reported: likely scanned images).
"""
import os, sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    sys.exit('pypdf missing: pip install pypdf cryptography')

root = Path(__file__).resolve().parent.parent
inbox = root / 'inbox'
out_dir = inbox / 'unlocked'
password = os.environ.get('PDF_PASSWORD', '')
files = [Path(a) for a in sys.argv[1:]] or sorted(p for p in inbox.glob('*.pdf'))
if not files:
    sys.exit('No PDFs found in inbox/. Put the study material there, or pass file paths.')
out_dir.mkdir(parents=True, exist_ok=True)

need_pw = []
for src in files:
    try:
        r = PdfReader(str(src))
    except Exception as e:
        print(f'FAIL   {src.name}: cannot read ({e})'); continue
    status = 'not encrypted'
    if r.is_encrypted:
        ok = r.decrypt('')                       # owner-password-only PDFs open with an empty user password
        if not ok and password:
            ok = r.decrypt(password)
        if not ok:
            need_pw.append(src.name)
            print(f'LOCKED {src.name}: needs its open password. Re-run with PDF_PASSWORD=… for this file.')
            continue
        status = 'restrictions removed' if not password or r.decrypt('') else 'decrypted with password'
    w = PdfWriter(clone_from=r)                  # new file, written without encryption
    dst = out_dir / src.name
    with open(dst, 'wb') as f:
        w.write(f)

    chk = PdfReader(str(dst))
    n = len(chk.pages)
    blank = [i for i, p in enumerate(chk.pages, 1) if len((p.extract_text() or '').strip()) < 30]
    problems = []
    if chk.is_encrypted: problems.append('still encrypted')
    if n != len(r.pages): problems.append(f'page count {n} != {len(r.pages)}')
    note = f'; little/no text on {len(blank)} page(s) {blank[:12]}{"…" if len(blank) > 12 else ""} (scanned? read those visually)' if blank else ''
    print(f'{"FAIL  " if problems else "OK    "} {src.name}: {status}, {n} pages -> {dst.relative_to(root)}{note}{" — " + ", ".join(problems) if problems else ""}')

sys.exit(2 if need_pw else 0)
