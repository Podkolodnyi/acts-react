import { useEffect, useState } from "react";
import {
    deleteEngineer,
    demoteEngineer,
    getAdminEngineers,
    promoteEngineer,
} from "../api/admin";
import { useSession } from "../session/session-context";
import { extractErrorMessage } from "../utils/apiError";
import { formatEngineerName } from "../utils/engineerName";
import type { AdminEngineer } from "../api/types";
import styles from "./AdminPendingPage.module.css";

export function AdminEngineersPage() {
    const [engineers, setEngineers] = useState<AdminEngineer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { engineer: currentEngineer } = useSession();

    function load() {
        getAdminEngineers().then(setEngineers);
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(target: AdminEngineer) {
        const confirmed = window.confirm(
            `Удалить инженера «${formatEngineerName(target)}»? Это действие необратимо.`,
        );
        if (!confirmed) return;

        setError(null);

        try {
            await deleteEngineer(target.id);
            load();
        } catch {
            setError("Не удалось удалить инженера");
        }
    }

    async function handleToggleAdmin(target: AdminEngineer) {
        setError(null);

        try {
            if (target.is_admin) {
                await demoteEngineer(target.id);
            } else {
                await promoteEngineer(target.id);
            }
            load();
        } catch (err) {
            setError(
                extractErrorMessage(err, "Не удалось изменить права"),
            );
        }
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Инженеры</h2>

            {error && <p className={styles.empty}>{error}</p>}

            <div className={styles.list}>
                {engineers.map((engineer) => (
                    <div key={engineer.id} className={styles.row}>
                        <div className={styles.info}>
                            <span className={styles.name}>
                                {formatEngineerName(engineer)}
                                {engineer.is_admin && " · админ"}
                            </span>
                            <span className={styles.meta}>
                                Логин: {engineer.id} · Код: {engineer.code}
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.reject}
                                type="button"
                                onClick={() => handleToggleAdmin(engineer)}
                            >
                                {engineer.is_admin
                                    ? "Убрать права админа"
                                    : "Сделать админом"}
                            </button>

                            <button
                                className={styles.reject}
                                type="button"
                                disabled={engineer.id === currentEngineer?.id}
                                onClick={() => handleDelete(engineer)}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
