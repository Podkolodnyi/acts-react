import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router";

import { useSession } from "../session/session-context";
import { formatEngineerName } from "../utils/engineerName";
import styles from "./AppLayout.module.css";

export function AppLayout() {
    const { engineer, logout } = useSession();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/engineer", { replace: true });
    }

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <h1>Учет ремонтов</h1>
                </div>

                <nav className={styles.topNav}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive
                                ? `${styles.link} ${styles.active}`
                                : styles.link
                        }
                    >
                        Главная
                    </NavLink>

                    <NavLink
                        to="/acts"
                        end
                        className={({ isActive }) =>
                            isActive
                                ? `${styles.link} ${styles.active}`
                                : styles.link
                        }
                    >
                        Акты
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            isActive
                                ? `${styles.link} ${styles.active}`
                                : styles.link
                        }
                    >
                        Настройки
                    </NavLink>

                    {engineer?.is_admin && (
                        <>
                            <NavLink
                                to="/admin/pending"
                                className={({ isActive }) =>
                                    isActive
                                        ? `${styles.link} ${styles.active}`
                                        : styles.link
                                }
                            >
                                Заявки
                            </NavLink>

                            <NavLink
                                to="/admin/engineers"
                                className={({ isActive }) =>
                                    isActive
                                        ? `${styles.link} ${styles.active}`
                                        : styles.link
                                }
                            >
                                Инженеры
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className={styles.userPanel}>
          <span className={styles.userName}>
            {engineer && formatEngineerName(engineer)}
          </span>

                    <button
                        className={styles.logoutButton}
                        type="button"
                        onClick={handleLogout}
                    >
                        Выйти
                    </button>
                </div>
            </header>

            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}