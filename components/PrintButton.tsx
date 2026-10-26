'use client';
export default function PrintButton() {
  return <button type="button" className="btn primary noprint" onClick={() => window.print()}>Print this page</button>;
}
