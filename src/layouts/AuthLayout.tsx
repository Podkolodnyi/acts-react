import { Outlet } from "react-router";
import styles from "./AuthLayout.module.css";

export function AuthLayout() {
    return (
        <div className={styles.layout}>
            <main className={styles.content}>
                <div className={styles.brand}>
                    <h1>Учет ремонтов</h1>
                </div>

                <div className={styles.card}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
