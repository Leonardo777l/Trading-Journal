"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setIsLoading } = useAuthStore();
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);

            if (event === 'SIGNED_IN') {
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setIsLoading, supabase, router]);

    return <>{children}</>;
}
