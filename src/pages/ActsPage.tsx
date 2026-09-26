import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { getActs } from "../api/acts";
import { getEngineers } from "../api/engineers";
import { ActStateBadge } from "../components/ActStateBadge";
import { CopyButton } from "../components/CopyButton";
import { DatePicker } from "../components/DatePicker";
import { SearchSelect } from "../components/SearchSelect";
import { formatEngineerName } from "../utils/engineerName";
import type { ActListItem, EngineerOption } from "../api/types";
import styles from "./ActsPage.module.css";

const STANDARD_FILTER_KEYS = ["q", "engineer", "state", "date_from", "date_to"];
const THERMO_FILTER_KEYS = ["customer", "date_from", "date_to"];

export function ActsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [acts, setActs] = useState<ActListItem[]>([]);
    const [engineers, setEngineers] = useState<EngineerOption[]>([]);
    const [loading, setLoading] = useState(true);

    // Вкладка хранится в URL (?type=thermo), поэтому переживает обновление страницы.
    const isThermo = searchParams.get("type") === "thermo";
    const q = searchParams.get("q") ?? "";
    const customer = searchParams.get("customer") ?? "";
    const engineer = searchParams.get("engineer") ?? "";
    const state = searchParams.get("state") ?? "";
    const dateFrom = searchParams.get("date_from") ?? "";
    const dateTo = searchParams.get("date_to") ?? "";

    useEffect(() => {
        getEngineers().then(setEngineers);
    }, []);

    useEffect(() => {
        let ignore = false;

        getActs(
            isThermo
                ? {
                      type: "thermo",
                      customer: customer || undefined,
                      date_from: dateFrom || undefined,
                      date_to: dateTo || undefined,
                  }
                : {
                      q: q || undefined,
                      engineer: engineer || undefined,
                      state: state === "working" || state === "broken" ? state : undefined,
                      date_from: dateFrom || undefined,
                      date_to: dateTo || undefined,
                  },
        ).then((data) => {
            if (!ignore) {
                setActs(data);
                setLoading(false);
            }
        });

        return () => {
            ignore = true;
        };
    }, [isThermo, q, customer, engineer, state, dateFrom, dateTo]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = new URLSearchParams();
        if (isThermo) next.set("type", "thermo");

        for (const key of isThermo ? THERMO_FILTER_KEYS : STANDARD_FILTER_KEYS) {
            const value = form.get(key);
            if (value) next.set(key, String(value));
        }

        setSearchParams(next);
    }

    function handleReset() {
        setSearchParams(isThermo ? { type: "thermo" } : {});
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Акты</h2>

                {isThermo ? (
                    <Link className={styles.primaryButton} to="/acts/new-thermo">
                        Создать акт ремонта узла термозакрепления
                    </Link>
                ) : (
                    <Link className={styles.primaryButton} to="/acts/new">
                        Создать акт
                    </Link>
                )}
            </div>

            <div className={styles.tabs}>
                <Link
                    className={`${styles.tab} ${!isThermo ? styles.tabActive : ""}`}
                    to="/acts"
                >
                    Аппараты
                </Link>
                <Link
                    className={`${styles.tab} ${isThermo ? styles.tabActive : ""}`}
                    to="/acts?type=thermo"
                >
                    Узлы термозакрепления
                </Link>
            </div>

            {/* key пересоздаёт форму при смене URL: поля с defaultValue
                иначе не обновились бы после «Сбросить» или смены вкладки. */}
            <form
                key={searchParams.toString()}
                className={`${styles.filters} ${isThermo ? styles.filtersThermo : ""}`}
                onSubmit={handleSubmit}
            >
                {isThermo ? (
                    <input
                        className={styles.input}
                        name="customer"
                        defaultValue={customer}
                        placeholder="Клиент"
                    />
                ) : (
                    <>
                        <input
                            className={styles.input}
                            name="q"
                            defaultValue={q}
                            placeholder="Номер, серийный номер, клиент, модель"
                        />

                        <SearchSelect
                            name="engineer"
                            inputClassName={styles.input}
                            emptyLabel="Все инженеры"
                            defaultValue={engineer}
                            options={engineers.map((item) => ({
                                value: item.id,
                                label: formatEngineerName(item),
                            }))}
                        />

                        <select className={styles.input} name="state" defaultValue={state}>
                            <option value="">Все состояния</option>
                            <option value="working">Работает</option>
                            <option value="broken">Не работает</option>
                        </select>
                    </>
                )}

                <DatePicker
                    name="date_from"
                    defaultValue={dateFrom}
                    inputClassName={styles.input}
                />

                <DatePicker
                    name="date_to"
                    defaultValue={dateTo}
                    inputClassName={styles.input}
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
            ) : isThermo ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Клиент</th>
                            <th>Инженер</th>
                            <th>Дата создания</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {acts.map((act) => (
                            <tr key={act.id}>
                                <td>{act.act_number || "—"}</td>
                                <td className={styles.copyCell}>
                                    {act.customer_name || "—"}
                                    {act.customer_name && (
                                        <CopyButton text={act.customer_name} className={styles.copy} />
                                    )}
                                </td>
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
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Состояние</th>
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
                                    <ActStateBadge state={act.state} />
                                </td>
                                <td className={styles.copyCell}>
                                    {act.customer_name || "—"}
                                    {act.customer_name && (
                                        <CopyButton text={act.customer_name} className={styles.copy} />
                                    )}
                                </td>
                                <td>{act.device_model || "—"}</td>
                                <td className={styles.copyCell}>
                                    {act.serial_number || "—"}
                                    {act.serial_number && (
                                        <CopyButton text={act.serial_number} className={styles.copy} />
                                    )}
                                </td>
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
