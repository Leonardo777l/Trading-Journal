"use client";

import { useEffect } from "react";
import { useTradeStore } from "@/store/useTradeStore";

export function DataInitializer() {
    const fetchInitialData = useTradeStore((state) => state.fetchInitialData);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return null;
}
