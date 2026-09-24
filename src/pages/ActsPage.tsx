import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { getActs } from "../api/acts";
import { getEngineers } from "../api/engineers";
import { formatEngineerName } from "../utils/engineerName";
import type { ActListItem, EngineerOption } from "../api/types";
import styles from "./ActsPage.module.css";

const STATUS_LABELS: Record<string, string> = {
    draft: "Черновик",
    completed: "Завершён",
};

const FILTER_KEYS = ["q", "engineer", "status", "date_from", "date_to"];

export function ActsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [acts, setActs] = useState<ActListItem[]>([]);
    const [engineers, setEngineers] = useState<EngineerOption[]>([]);
    const [loading, setLoading] = useState(true);

    const q = searchParams.get("q") ?? "";
    const engineer = searchParams.get("engineer") ?? "";
    const status = searchParams.get("status") ?? "";
    const dateFrom = searchParams.get("date_from") ?? "";
    const dateTo = searchParams.get("date_to") ?? "";

    useEffect(() => {
        getEngineers().then(setEngineers);
    }, []);

    useEffect(() => {
        let ignore = false;

        getActs({
            q: q || undefined,
            engineer: engineer || undefined,
            status: status === "draft" || status === "completed" ? status : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }).then((data) => {
            if (!ignore) {
                setActs(data);
                setLoading(false);
            }
        });

        return () => {
            ignore = true;
        };
    }, [q, engineer, status, dateFrom, dateTo]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = new URLSearchParams();

        for (const key of FILTER_KEYS) {
            const value = form.get(key);
            if (value) next.set(key, String(value));
        }

        setSearchParams(next);
    }

    function handleReset() {
        setSearchParams({});
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Акты</h2>

                <Link className={styles.primaryButton} to="/acts/new">
                    Создать акт
                </Link>
            </div>

            <form className={styles.filters} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    name="q"
                    defaultValue={q}
                    placeholder="Номер, серийник, клиент, модель"
                />

                <select
                    className={styles.input}
                    name="engineer"
                    defaultValue={engineer}
                >
                    <option value="">Все инженеры</option>
                    {engineers.map((item) => (
                        <option key={item.id} value={item.id}>
                            {formatEngineerName(item)}
                        </option>
                    ))}
                </select>

                <select className={styles.input} name="status" defaultValue={status}>
                    <option value="">Все статусы</option>
                    <option value="draft">Черновик</option>
                    <option value="completed">Завершён</option>
                </select>

                <input
                    className={styles.input}
                    type="date"
                    name="date_from"
                    defaultValue={dateFrom}
                />

                <input
                    className={styles.input}
                    type="date"
                    name="date_to"
                    defaultValue={dateTo}
                />

                <div className={styles.filterActions}>
                    <button className={styles.primaryButton} type="submit">
                        Применить
                    </button>

                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={handleReset}
                    >
                        Сбросить
                    </button>
                </div>
            </form>

            {loading ? (
                <p className={styles.empty}>Загрузка...</p>
            ) : acts.length === 0 ? (
                <p className={styles.empty}>Акты не найдены.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Статус</th>
                            <th>Клиент</th>
                            <th>Модель</th>
                            <th>Серийный номер</th>
                            <th>Инженер</th>
                            <th>Дата создания</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {acts.map((act) => (
                            <tr key={act.id}>
                                <td>{act.act_number || "—"}</td>
                                <td>
                                    <span
                                        className={`${styles.badge} ${styles[act.status] ?? ""}`}
                                    >
                                        {STATUS_LABELS[act.status] ?? act.status}
                                    </span>
                                </td>
                                <td>{act.customer_name || "—"}</td>
                                <td>{act.device_model || "—"}</td>
                                <td>{act.serial_number || "—"}</td>
                                <td>{act.engineer_name}</td>
                                <td>{act.created_at.slice(0, 10)}</td>
                                <td>
                                    <Link className={styles.link} to={`/acts/${act.id}`}>
                                        Открыть
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
