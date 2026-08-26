const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} KelanaAI. All rights reserved.</p>
        <nav className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
