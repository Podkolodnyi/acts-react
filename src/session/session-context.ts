import { createContext, useContext } from "react";
import type { Engineer } from "../api/types";

export interface SessionContextValue {
    engineer: Engineer | null;
    status: "loading" | "ready";
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}
