import { Navigate, Outlet } from "react-router";
import { useSession } from "../session/session-context";

export function AdminLayout() {
    const { engineer } = useSession();

    if (!engineer?.is_admin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
