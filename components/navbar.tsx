import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-zinc-800/80 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="text-sm font-semibold tracking-wide text-zinc-100">
          Alumni Portal
        </div>
        <nav className="flex items-center gap-5 text-xs font-medium text-zinc-300">
          <Link href="/directory" className="transition-colors hover:text-emerald-400">
            Directory
          </Link>
          <Link href="/map" className="transition-colors hover:text-emerald-400">
            Map
          </Link>
          <Link href="/login" className="transition-colors hover:text-emerald-400">
            Sign In
          </Link>
          <Link href="/login" className="transition-colors hover:text-emerald-400">
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}