import {
    Navigate,
    Outlet,
    useLocation
} from "react-router";
import { useSession } from "../session/session-context";

export function ProtectedLayout() {
    const { engineer, status } = useSession();
    const location = useLocation();

    if (status === "loading") {
        return null;
    }

    if (!engineer) {
        return (
            <Navigate
                to="/engineer"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}
