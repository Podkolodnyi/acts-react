import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
    getDeletedActs,
    purgeDeletedActs,
    purgeDeletedActsByPeriod,
    restoreDeletedAct,
} from "../api/admin";
import { Notice, type NoticeData } from "../components/Notice";
import { extractErrorMessage, extractRepairedBy } from "../utils/apiError";
import type { DeletedAct, PurgePeriod } from "../api/types";
import styles from "./AdminDeletedActsPage.module.css";

const PERIOD_LABELS: Record<PurgePeriod, string> = {
    all: "все удалённые акты",
    month: "акты, удалённые за последние 30 дней",
    week: "акты, удалённые за последние 7 дней",
};

export function AdminDeletedActsPage() {
    const [acts, setActs] = useState<DeletedAct[]>([]);
    const [loading, setLoading] = useState(true);
    // Set — набор id отмеченных чекбоксами актов.
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [period, setPeriod] = useState<PurgePeriod>("all");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<NoticeData | null>(null);
    const [busy, setBusy] = useState(false);

    function load() {
        return getDeletedActs().then((data) => {
            setActs(data);
            setSelected(new Set());
            setLoading(false);
        });
    }

    useEffect(() => {
        load();
    }, []);

    const allSelected = acts.length > 0 && selected.size === acts.length;

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
        setSelected(allSelected ? new Set() : new Set(acts.map((act) => act.id)));
    }

    async function runPurge(action: () => Promise<{ purged: number }>) {
        setBusy(true);
        setError(null);
        try {
            await action();
            await load();
        } catch (err) {
            setError(extractErrorMessage(err, "Не удалось удалить акты"));
        } finally {
            setBusy(false);
        }
    }

    async function handleRestore(act: DeletedAct) {
        const confirmed = window.confirm(
            `Восстановить акт ${act.act_number} (прежний номер ` +
                `${act.original_act_number || "—"})? Он получит новый номер.`,
        );
        if (!confirmed) return;

        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            const restored = await restoreDeletedAct(act.id);
            setNotice({
                kind: "success",
                text: `Акт восстановлен под номером ${restored.act_number}.`,
                link: { to: `/acts/${restored.id}`, label: "Открыть акт" },
            });
            await load();
        } catch (err) {
            const repairedBy = extractRepairedBy(err);
            setNotice({
                kind: "error",
                text: extractErrorMessage(err, "Не удалось восстановить акт"),
                link: repairedBy
                    ? { to: `/acts/${repairedBy.id}`, label: `→ ${repairedBy.act_number}` }
                    : undefined,
            });
        } finally {
            setBusy(false);
        }
    }

    function handlePurgeSelected() {
        const confirmed = window.confirm(
            `Окончательно удалить выбранные акты (${selected.size})? ` +
                "Это действие необратимо.",
        );
        if (confirmed) runPurge(() => purgeDeletedActs([...selected]));
    }

    function handlePurgePeriod() {
        const confirmed = window.confirm(
            `Окончательно удалить ${PERIOD_LABELS[period]}? Это действие необратимо.`,
        );
        if (confirmed) runPurge(() => purgeDeletedActsByPeriod(period));
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Удалённые акты</h2>

            {error && <p className={styles.error}>{error}</p>}
            {notice && <Notice notice={notice} />}

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
                        disabled={busy || acts.length === 0}
                        onClick={handlePurgePeriod}
                    >
                        Очистить
                    </button>
                </div>
            </div>

            {loading ? (
                <p className={styles.empty}>Загрузка...</p>
            ) : acts.length === 0 ? (
                <p className={styles.empty}>Удалённых актов нет.</p>
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
                            <th>Номер</th>
                            <th>Прежний номер</th>
                            <th>Клиент</th>
                            <th>Инженер</th>
                            <th>Удалён</th>
                            <th>Кем удалён</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {acts.map((act) => (
                            <tr key={act.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        aria-label={`Выбрать ${act.act_number}`}
                                        checked={selected.has(act.id)}
                                        onChange={() => toggleOne(act.id)}
                                    />
                                </td>
                                <td className={styles.number}>{act.act_number}</td>
                                <td className={styles.number}>
                                    {act.original_act_number || "—"}
                                    {act.number_type === "thermo" && (
                                        <span className={styles.thermo}>термо</span>
                                    )}
                                </td>
                                <td>{act.customer_name || "—"}</td>
                                <td>{act.engineer_name}</td>
                                <td>{act.deleted_at.slice(0, 10)}</td>
                                <td>{act.deleted_by_name || "—"}</td>
                                <td className={styles.rowActions}>
                                    <Link className={styles.link} to={`/acts/${act.id}`}>
                                        Открыть
                                    </Link>
                                    <button
                                        className={styles.linkButton}
                                        type="button"
                                        disabled={busy}
                                        onClick={() => handleRestore(act)}
                                    >
                                        Восстановить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
