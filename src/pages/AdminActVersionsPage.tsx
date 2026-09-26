import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
    getActVersions,
    purgeActVersions,
    purgeActVersionsByPeriod,
} from "../api/admin";
import { extractErrorMessage } from "../utils/apiError";
import type { ActVersion, PurgePeriod } from "../api/types";
import styles from "./AdminDeletedActsPage.module.css";

const PERIOD_LABELS: Record<PurgePeriod, string> = {
    all: "все версии актов",
    month: "версии, сохранённые за последние 30 дней",
    week: "версии, сохранённые за последние 7 дней",
};

export function AdminActVersionsPage() {
    const [versions, setVersions] = useState<ActVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [period, setPeriod] = useState<PurgePeriod>("all");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    function load() {
        return getActVersions().then((data) => {
            setVersions(data);
            setSelected(new Set());
            setLoading(false);
        });
    }

    useEffect(() => {
        load();
    }, []);

    const allSelected = versions.length > 0 && selected.size === versions.length;

    function toggleOne(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function toggleAll() {
        setSelected(
            allSelected ? new Set() : new Set(versions.map((item) => item.id)),
        );
    }

    async function runPurge(action: () => Promise<{ purged: number }>) {
        setBusy(true);
        setError(null);
        try {
            await action();
            await load();
        } catch (err) {
            setError(extractErrorMessage(err, "Не удалось удалить версии"));
        } finally {
            setBusy(false);
        }
    }

    function handlePurgeSelected() {
        const confirmed = window.confirm(
            `Окончательно удалить выбранные версии (${selected.size})? ` +
                "Это действие необратимо.",
        );
        if (confirmed) runPurge(() => purgeActVersions([...selected]));
    }

    function handlePurgePeriod() {
        const confirmed = window.confirm(
            `Окончательно удалить ${PERIOD_LABELS[period]}? Это действие необратимо.`,
        );
        if (confirmed) runPurge(() => purgeActVersionsByPeriod(period));
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Версии актов</h2>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.toolbar}>
                <button
                    className={styles.dangerButton}
                    type="button"
                    disabled={busy || selected.size === 0}
                    onClick={handlePurgeSelected}
                >
                    Удалить выбранные{selected.size > 0 && ` (${selected.size})`}
                </button>

                <div className={styles.purge}>
                    <select
                        className={styles.select}
                        value={period}
                        onChange={(event) =>
                            setPeriod(event.target.value as PurgePeriod)
                        }
                    >
                        <option value="all">Все</option>
                        <option value="month">За последние 30 дней</option>
                        <option value="week">За последние 7 дней</option>
                    </select>
                    <button
                        className={styles.dangerButton}
                        type="button"
                        disabled={busy || versions.length === 0}
                        onClick={handlePurgePeriod}
                    >
                        Очистить
                    </button>
                </div>
            </div>

            {loading ? (
                <p className={styles.empty}>Загрузка...</p>
            ) : versions.length === 0 ? (
                <p className={styles.empty}>Сохранённых версий нет.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.checkColumn}>
                                <input
                                    type="checkbox"
                                    aria-label="Выбрать все"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th>Версия</th>
                            <th>Текущий акт</th>
                            <th>Клиент</th>
                            <th>Изменён</th>
                            <th>Кем изменён</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {versions.map((version) => (
                            <tr key={version.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        aria-label={`Выбрать ${version.version_number}`}
                                        checked={selected.has(version.id)}
                                        onChange={() => toggleOne(version.id)}
                                    />
                                </td>
                                <td className={styles.number}>
                                    {version.version_number}
                                </td>
                                <td className={styles.number}>
                                    <Link className={styles.link} to={`/acts/${version.act_id}`}>
                                        {version.current_act_number}
                                    </Link>
                                    {version.act_deleted && (
                                        <span className={styles.thermo}>удалён</span>
                                    )}
                                </td>
                                <td>{version.customer_name || "—"}</td>
                                <td>{version.created_at.slice(0, 16).replace("T", " ")}</td>
                                <td>{version.created_by_name || "—"}</td>
                                <td>
                                    <Link
                                        className={styles.link}
                                        to={`/admin/act-versions/${version.id}`}
                                    >
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
