"use client";

import { useState } from "react";
import { Lock, KeyRound, Check, X, ShieldAlert } from "lucide-react";

interface AuthorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  actionTitle?: string;
}

export function AuthorAuthModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = "Author Verification Required",
}: AuthorAuthModalProps) {
  const [passkey, setPasskey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setErrorMsg("Please enter Harman's author passkey.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });

      const data = await res.json();

      if (data.success && data.authenticated) {
        // Store in localStorage & sessionStorage so author stays authenticated
        if (typeof window !== "undefined") {
          localStorage.setItem("harman_author_key", data.token || passkey.trim());
          sessionStorage.setItem("harman_author_key", data.token || passkey.trim());
        }
        onSuccess(data.token || passkey.trim());
        onClose();
      } else {
        setErrorMsg(data.error || "Incorrect passkey. Only Harman can publish or edit articles.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to verify credentials with server.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Lock Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/25 text-primary">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="serif text-2xl font-normal text-foreground">
              Harman<span className="text-primary italic font-mono">_</span> Writer Gate
            </h3>
            <p className="mono text-[0.65rem] text-muted-foreground">
              {actionTitle}
            </p>
          </div>
        </div>

        <p className="text-xs text-foreground/75 font-sans leading-relaxed mb-5">
          This journal is written and curated solely by <strong className="font-semibold text-foreground">Harman</strong>. Readers have read-only access. To write, publish, or edit an article, please enter Harman&apos;s author passkey.
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
              Author Passkey
            </label>
            <div className="relative">
              <KeyRound
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Enter author passkey..."
                autoFocus
                className="w-full rounded-xl border border-border/80 bg-background/80 pl-9 pr-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-[0.72rem] text-red-400">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="mono text-xs px-4 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="mono text-xs px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-primary/20 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Check size={13} />
                  <span>Unlock Access</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
