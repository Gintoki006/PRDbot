"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomUserButton({ showName = false }) {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded || !user) return null;

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  const email = user.primaryEmailAddress?.emailAddress;
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none ${showName ? "w-full" : ""}`}
      >
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#161b22] border border-[#30363d] overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#58a6ff] transition-all">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#c9d1d9] font-semibold text-sm">{initial}</span>
          )}
        </div>
        {showName && (
          <span className="text-sm font-medium text-white truncate flex-1 text-left">
            {user.fullName || "User"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl py-1 z-50">
          <div className="px-4 py-3 border-b border-[#30363d]">
            <p className="text-sm font-semibold text-white truncate">
              {user.fullName || "User"}
            </p>
            <p className="text-xs text-[#8b949e] truncate mt-0.5">
              {email}
            </p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Manage Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard");
              }}
              className="w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Dashboard
            </button>
          </div>
          
          <div className="py-1 border-t border-[#30363d]">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#21262d] hover:text-red-300 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
