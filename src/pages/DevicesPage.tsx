import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { searchDeviceCatalog } from "../api/devices";
import { newActFromTask, searchIntraservice } from "../api/intraservice";
import { CopyButton } from "../components/CopyButton";
import { extractErrorMessage } from "../utils/apiError";
import type { DeviceCatalogResult, IntraserviceTask } from "../api/types";
import actsStyles from "./ActsPage.module.css";
import styles from "./DevicesPage.module.css";

interface SearchResult {
    q: string;
    data: DeviceCatalogResult;
    // Заявки Intraservice: ищем, только если в справочнике пусто.
    // undefined — не искали, null — ищем сейчас.
    tasks?: IntraserviceTask[] | null;
    tasksError?: string;
}

// Поиск по русскому тексту в Intraservice сломан (висит ~30 с и падает),
// поэтому туда идём только с запросами, похожими на серийный номер.
function looksLikeSerial(query: string): boolean {
    return !/\s/.test(query) && !/[А-Яа-яЁё]/.test(query);
}

// 2026-09-17T07:25:46 → 17.09.2026
function formatTaskDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split("-");
    return year && month && day ? `${day}.${month}.${year}` : "";
}

// Справочник аппаратов: поиск по серийнику, модели, клиенту и адресу.
// Если в справочнике пусто — ищем серийный номер в Intraservice.
export function DevicesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") ?? "";
    // Результат вместе с запросом, для которого он получен: так понятно,
    // идёт ли сейчас поиск, без отдельного состояния «загрузка».
    const [result, setResult] = useState<SearchResult | null>(null);

    useEffect(() => {
        if (!q) return;
        let ignore = false;

        (async () => {
            const data = await searchDeviceCatalog(q);
            if (ignore) return;
            if (data.items.length > 0 || !looksLikeSerial(q)) {
                setResult({ q, data });
                return;
            }
            setResult({ q, data, tasks: null });
            try {
                const { tasks } = await searchIntraservice(q);
                if (!ignore) setResult({ q, data, tasks });
            } catch (err) {
                if (!ignore) {
                    setResult({
                        q,
                        data,
                        tasks: [],
                        tasksError: extractErrorMessage(err, "Не удалось выполнить поиск в Intraservice"),
                    });
                }
            }
        })();

        return () => {
            ignore = true;
        };
    }, [q]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        setSearchParams(value ? { q: value } : {});
    }

    // Показываем только результат текущего запроса.
    const current = q && result?.q === q ? result : null;
    const shown = current?.data ?? null;
    const loading = Boolean(q) && !shown;
    const tasks = current?.tasks;

    return (
        <div className={actsStyles.page}>
            <div className={actsStyles.header}>
                <h2 className={actsStyles.title}>Аппараты</h2>
            </div>

            {/* key пересоздаёт форму при смене URL, чтобы поле показывало q. */}
            <form key={q} className={styles.search} onSubmit={handleSubmit}>
                <input
                    className={actsStyles.input}
                    name="q"
                    defaultValue={q}
                    placeholder="Серийный номер, модель, клиент или адрес"
                    autoFocus
                />
                <button className={actsStyles.primaryButton} type="submit">
                    Найти
                </button>
            </form>

            {!q ? (
                <p className={actsStyles.empty}>Введите серийный номер, модель или клиента</p>
            ) : loading ? (
                <p className={actsStyles.empty}>Поиск...</p>
            ) : !shown || shown.items.length === 0 ? (
                tasks === null ? (
                    <p className={actsStyles.empty}>В справочнике не найдено, ищем в Intraservice...</p>
                ) : tasks && tasks.length > 0 ? (
                    <>
                        <p className={styles.hint}>
                            В справочнике не найдено. Заявки в Intraservice:
                        </p>
                        <table className={actsStyles.table}>
                            <thead>
                                <tr>
                                    <th>Заявка</th>
                                    <th>Тип</th>
                                    <th>Дата</th>
                                    <th>Модель</th>
                                    <th>Клиент</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>№ {task.id}</td>
                                        <td>{task.type || "—"}</td>
                                        <td>{formatTaskDate(task.created) || "—"}</td>
                                        <td>{task.model || "—"}</td>
                                        <td>{task.customer || "—"}</td>
                                        <td className={styles.rowActions}>
                                            <Link
                                                className={actsStyles.link}
                                                to={`/devices/intraservice/${task.id}?serial=${encodeURIComponent(q)}`}
                                            >
                                                Открыть
                                            </Link>
                                            <Link
                                                className={actsStyles.link}
                                                to={newActFromTask(q, task)}
                                            >
                                                Создать акт
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className={actsStyles.empty}>
                        {current?.tasksError ?? "Ничего не найдено."}
                    </p>
                )
            ) : (
                <>
                    {shown.total > shown.items.length && (
                        <p className={styles.hint}>
                            Найдено {shown.total}, показаны первые {shown.items.length} —
                            уточните поиск.
                        </p>
                    )}
                    <table className={actsStyles.table}>
                        <thead>
                            <tr>
                                <th>Серийный номер</th>
                                <th>Модель</th>
                                <th>Клиент</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.items.map((device) => (
                                <tr key={device.id}>
                                    <td className={styles.serial}>
                                        {device.serial_number}
                                        <CopyButton
                                            text={device.serial_number}
                                            className={styles.copy}
                                        />
                                    </td>
                                    <td>{device.device_model || "—"}</td>
                                    <td className={styles.serial}>
                                        {device.customer_name || "—"}
                                        {device.customer_name && (
                                            <CopyButton
                                                text={device.customer_name}
                                                className={styles.copy}
                                            />
                                        )}
                                    </td>
                                    <td className={styles.rowActions}>
                                        <Link className={actsStyles.link} to={`/devices/${device.id}`}>
                                            Открыть
                                        </Link>
                                        <Link
                                            className={actsStyles.link}
                                            to={`/acts/new?device=${device.id}`}
                                        >
                                            Создать акт
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
