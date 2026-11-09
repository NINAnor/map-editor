import { Link } from '@tanstack/react-router';

export function Header() {
  return (
    <header className="border-b border-base-300 bg-base-100">
      <nav
        className="container mx-auto flex min-h-20 max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-6 sm:px-8 sm:py-0"
        aria-label="Main navigation"
      >
        <Link to="/" className="shrink-0" aria-label="NINA Maps home">
          <img src="/assets/logo.svg" alt="NINA" className="h-auto w-36 sm:w-52" width="209" height="49" />
        </Link>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:gap-4">
          <a href="https://data.nina.no" target="_blank" rel="noreferrer" className="btn btn-accent btn-sm sm:btn-md">
            Data catalogue
          </a>
          {import.meta.env.VITE_HIDE_EDIT_BUTTON !== 'true' && (
            <Link to="/editor" className="btn btn-outline btn-sm sm:btn-md">
              Map Editor
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
