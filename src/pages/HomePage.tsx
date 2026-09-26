import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getActs, getActStats } from "../api/acts";
import type { ActListItem, ActStats } from "../api/types";
import styles from "./HomePage.module.css";

export function HomePage() {
    const [acts, setActs] = useState<ActListItem[]>([]);
    const [stats, setStats] = useState<ActStats | null>(null);
    const [period, setPeriod] = useState<"total" | "month">("total");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActs()
            .then(setActs)
            .finally(() => setLoading(false));
        getActStats().then(setStats);
    }, []);

    // Сервер отдаёт оба набора счётчиков сразу — переключение без запроса.
    const counters = stats?.[period];
    const periodDescription = period === "total" ? "За весь период" : "За текущий месяц";
    const recentActs = acts.slice(0, 5);

    return (
        <section className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        Главная
                    </h2>

                    <p className={styles.subtitle}>
                        Система учета ремонтов
                    </p>
                </div>

                <div className={styles.actions}>
                    <Link
                        className={styles.primaryButton}
                        to="/acts/new"
                    >
                        Создать акт
                    </Link>
                </div>
            </div>

            <div className={styles.periodSwitch}>
                <button
                    className={`${styles.periodButton} ${period === "total" ? styles.periodActive : ""}`}
                    type="button"
                    onClick={() => setPeriod("total")}
                >
                    Всего
                </button>
                <button
                    className={`${styles.periodButton} ${period === "month" ? styles.periodActive : ""}`}
                    type="button"
                    onClick={() => setPeriod("month")}
                >
                    За месяц
                </button>
            </div>

            <div className={styles.cards}>
                <article className={styles.card}>
                    <span className={styles.cardLabel}>Работает</span>
                    <strong className={styles.cardValue}>
                        {counters ? counters.working : "…"}
                    </strong>
                    <span className={styles.cardDescription}>{periodDescription}</span>
                </article>

                <article className={styles.card}>
                    <span className={styles.cardLabel}>Не работает</span>
                    <strong className={styles.cardValue}>
                        {counters ? counters.broken : "…"}
                    </strong>
                    <span className={styles.cardDescription}>
                        {periodDescription}, включая отремонтированные
                    </span>
                </article>

                <article className={styles.card}>
                    <span className={styles.cardLabel}>Узлы терморегистрации</span>
                    <strong className={styles.cardValue}>
                        {counters ? counters.thermo : "…"}
                    </strong>
                    <span className={styles.cardDescription}>{periodDescription}</span>
                </article>
            </div>

            <div className={styles.grid}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>
                            Последние акты
                        </h3>

                        <Link
                            className={styles.panelLink}
                            to="/acts"
                        >
                            Все акты
                        </Link>
                    </div>

                    {!loading && recentActs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyTitle}>
                                Актов пока нет
                            </p>

                            <p className={styles.emptyDescription}>
                                Создайте первый акт ремонта, чтобы он появился
                                в этом списке.
                            </p>

                            <Link
                                className={styles.secondaryButton}
                                to="/acts/new"
                            >
                                Создать первый акт
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.quickActions}>
                            {recentActs.map((act) => (
                                <Link
                                    key={act.id}
                                    className={styles.quickAction}
                                    to={`/acts/${act.id}`}
                                >
                                    <span className={styles.quickActionTitle}>
                                        {act.act_number || "Без номера"} · {act.customer_name || "—"}
                                    </span>

                                    <span className={styles.quickActionDescription}>
                                        {act.engineer_name} · {act.device_model || "—"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>
                            Быстрые действия
                        </h3>
                    </div>

                    <div className={styles.quickActions}>
                        <Link
                            className={styles.quickAction}
                            to="/acts/new"
                        >
              <span className={styles.quickActionTitle}>
                Новый акт
              </span>

                            <span className={styles.quickActionDescription}>
                Создать акт ремонта
              </span>
                        </Link>

                        <Link
                            className={styles.quickAction}
                            to="/acts"
                        >
              <span className={styles.quickActionTitle}>
                Список актов
              </span>

                            <span className={styles.quickActionDescription}>
                Найти или открыть акт
              </span>
                        </Link>

                        <Link
                            className={styles.quickAction}
                            to="/settings"
                        >
              <span className={styles.quickActionTitle}>
                Настройки
              </span>

                            <span className={styles.quickActionDescription}>
                Настроить приложение
              </span>
                        </Link>
                    </div>
                </section>
            </div>
        </section>
    );
}
