import {
    NavLink,
    Outlet
} from "react-router";

import styles from "./AppLayout.module.css";

export function AppLayout() {
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
                </nav>

                <div className={styles.userPanel}>
          <span className={styles.userName}>
            Пользователь
          </span>

                    <button
                        className={styles.logoutButton}
                        type="button"
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