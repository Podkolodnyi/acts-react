import styles from "./HomePage.module.css";

export function HomePage() {
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
                    <a
                        className={styles.primaryButton}
                        href="/acts/new"
                    >
                        Создать акт
                    </a>
                </div>
            </div>

            <div className={styles.cards}>
                <article className={styles.card}>
          <span className={styles.cardLabel}>
            Всего актов
          </span>

                    <strong className={styles.cardValue}>
                        0
                    </strong>

                    <span className={styles.cardDescription}>
            За весь период
          </span>
                </article>

                <article className={styles.card}>
          <span className={styles.cardLabel}>
            Черновики
          </span>

                    <strong className={styles.cardValue}>
                        0
                    </strong>

                    <span className={styles.cardDescription}>
            Требуют завершения
          </span>
                </article>

                <article className={styles.card}>
          <span className={styles.cardLabel}>
            Завершенные
          </span>

                    <strong className={styles.cardValue}>
                        0
                    </strong>

                    <span className={styles.cardDescription}>
            Готовы к выгрузке
          </span>
                </article>
            </div>

            <div className={styles.grid}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>
                            Последние акты
                        </h3>

                        <a
                            className={styles.panelLink}
                            href="/acts"
                        >
                            Все акты
                        </a>
                    </div>

                    <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>
                            Актов пока нет
                        </p>

                        <p className={styles.emptyDescription}>
                            Создайте первый акт ремонта, чтобы он появился
                            в этом списке.
                        </p>

                        <a
                            className={styles.secondaryButton}
                            href="/acts/new"
                        >
                            Создать первый акт
                        </a>
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>
                            Быстрые действия
                        </h3>
                    </div>

                    <div className={styles.quickActions}>
                        <a
                            className={styles.quickAction}
                            href="/acts/new"
                        >
              <span className={styles.quickActionTitle}>
                Новый акт
              </span>

                            <span className={styles.quickActionDescription}>
                Создать акт ремонта
              </span>
                        </a>

                        <a
                            className={styles.quickAction}
                            href="/acts"
                        >
              <span className={styles.quickActionTitle}>
                Список актов
              </span>

                            <span className={styles.quickActionDescription}>
                Найти или открыть акт
              </span>
                        </a>

                        <a
                            className={styles.quickAction}
                            href="/settings"
                        >
              <span className={styles.quickActionTitle}>
                Настройки
              </span>

                            <span className={styles.quickActionDescription}>
                Настроить приложение
              </span>
                        </a>
                    </div>
                </section>
            </div>
        </section>
    );
}