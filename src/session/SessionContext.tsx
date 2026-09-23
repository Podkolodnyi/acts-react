import {
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { getSession, logout as logoutRequest } from "../api/session";
import type { Engineer } from "../api/types";
import { SessionContext } from "./session-context";

export function SessionProvider({ children }: { children: ReactNode }) {
    const [engineer, setEngineer] = useState<Engineer | null>(null);
    const [status, setStatus] = useState<"loading" | "ready">("loading");

    useEffect(() => {
        let ignore = false;

        getSession().then(({ engineer }) => {
            if (!ignore) {
                setEngineer(engineer);
                setStatus("ready");
            }
        });

        return () => {
            ignore = true;
        };
    }, []);

    const refresh = useCallback(async () => {
        const { engineer } = await getSession();
        setEngineer(engineer);
        setStatus("ready");
    }, []);

    const logout = useCallback(async () => {
        await logoutRequest();
        setEngineer(null);
    }, []);

    return (
        <SessionContext.Provider value={{ engineer, status, refresh, logout }}>
            {children}
        </SessionContext.Provider>
    );
}
