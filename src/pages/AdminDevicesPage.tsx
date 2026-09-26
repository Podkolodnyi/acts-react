import { useState } from "react";
import { syncDevices } from "../api/admin";
import { extractErrorMessage } from "../utils/apiError";
import styles from "./AdminDevicesPage.module.css";

export function AdminDevicesPage() {
    const [syncing, setSyncing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSync() {
        setSyncing(true);
        setResult(null);
        setError(null);

        try {
            const { imported } = await syncDevices();
            setResult(`Справочник обновлён: загружено аппаратов — ${imported}.`);
        } catch (err) {
            setError(extractErrorMessage(err, "Не удалось обновить справочник"));
        } finally {
            setSyncing(false);
        }
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Справочник аппаратов</h2>

            <div className={styles.card}>
                <p className={styles.text}>
                    Справочник используется для поиска аппарата по серийному номеру
                    в форме акта. Данные загружаются из Google-таблицы.
                </p>

                <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={syncing}
                    onClick={handleSync}
                >
                    {syncing ? "Загрузка..." : "Обновить справочник аппаратов"}
                </button>

                {result && <p className={styles.success}>{result}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
}
