"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Trip History", href: "/trips" },
  { label: "Chat", href: "/chat" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} KelanaAI. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}

          {!loading && (
            user ? (
              <>
                <a href="/profile" className="transition-colors hover:text-slate-900">
                  Profile
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-medium text-orange-600 transition-colors hover:text-orange-700"
                >
                  Log out
                </button>
              </>
            ) : (
              <a href="/login" className="font-medium text-orange-600 transition-colors hover:text-orange-700">
                Login
              </a>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
