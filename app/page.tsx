"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { AccountList } from "@/components/accounts/AccountList";
import { CreateAccountDialog } from "@/components/accounts/CreateAccountDialog";

export default function Home() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    setIsSignOutLoading(false);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user.user_metadata?.full_name || user.email}</p>
        </div>
        <Button
          variant="outline"
          className="border-red-500/20 text-red-500 hover:bg-red-500/10"
          onClick={handleSignOut}
          disabled={isSignOutLoading}
        >
          {isSignOutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
          Sign Out
        </Button>
      </header>

      {/* Account Management Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Your Accounts</h2>
          <CreateAccountDialog />
        </div>
        <AccountList />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Placeholder Metrics */}
        {["Balance", "Profit", "Win Rate", "Trades"].map((metric) => (
          <div key={metric} className="rounded-lg border border-[#1e1e1e] bg-[#121212] p-6 shado-sm">
            <h3 className="text-sm font-medium text-gray-400">{metric}</h3>
            <p className="mt-2 text-2xl font-bold text-white">--</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#1e1e1e] bg-[#121212] p-6 h-64 flex items-center justify-center text-gray-500 border-dashed">
        Chart Area (Equity Curve)
      </div>
    </main>
  );
}
