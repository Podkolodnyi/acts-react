import { useEffect, useState } from "react";
import { approveEngineer, getPendingEngineers, rejectEngineer } from "../api/admin";
import { formatEngineerName } from "../utils/engineerName";
import type { PendingEngineer } from "../api/types";
import styles from "./AdminPendingPage.module.css";

export function AdminPendingPage() {
    const [pending, setPending] = useState<PendingEngineer[]>([]);
    const [loading, setLoading] = useState(true);

    function load() {
        getPendingEngineers()
            .then(setPending)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
    }, []);

    async function handleApprove(key: string) {
        await approveEngineer(key);
        load();
    }

    async function handleReject(key: string) {
        await rejectEngineer(key);
        load();
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Заявки на регистрацию</h2>

            {!loading && pending.length === 0 && (
                <p className={styles.empty}>Заявок пока нет.</p>
            )}

            <div className={styles.list}>
                {pending.map((engineer) => (
                    <div key={engineer.id} className={styles.row}>
                        <div className={styles.info}>
                            <span className={styles.name}>
                                {formatEngineerName(engineer)}
                            </span>
                            <span className={styles.meta}>
                                Логин: {engineer.id} · Код: {engineer.code}
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.approve}
                                type="button"
                                onClick={() => handleApprove(engineer.id)}
                            >
                                Одобрить
                            </button>

                            <button
                                className={styles.reject}
                                type="button"
                                onClick={() => handleReject(engineer.id)}
                            >
                                Отклонить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
