import { Outlet } from "react-router";

export function AuthLayout() {
    return (
        <div className="auth-layout">
            <main className="content">
                <div className="brand">
                    <h1>Учет ремонтов</h1>
                </div>

                <div className="card">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}