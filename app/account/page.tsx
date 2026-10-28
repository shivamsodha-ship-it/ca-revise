import Link from 'next/link';
import AccountPanel from '@/components/AccountPanel';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = { title: 'Account and sync · CA Revise' };

export default function AccountPage() {
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">Account</span>
        <ThemeToggle />
      </div></header>
      <main className="page">
        <header className="vhead">
          <p className="eyebrow">Laptop and phone</p>
          <h1 className="vh">Account and sync</h1>
          <p className="muted">Sign in on every device. Your answers, flip-card schedule, written attempts and last-day ticks follow your account.</p>
        </header>
        <AccountPanel />
      </main>
    </>
  );
}
