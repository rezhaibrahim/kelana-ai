"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 sm:p-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your account details.</p>
        </div>

        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-xs font-medium text-slate-500">Email</span>
          <p className="text-sm text-slate-900">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
