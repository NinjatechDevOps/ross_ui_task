"use client";

import { LogoutIcon } from "./icons";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="bg-white/20 max-w-max backdrop-blur-sm text-white border border-white/30 font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:bg-white/30 hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
    >
      <LogoutIcon />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
};
