import type { ReactNode } from "react";
import type { ActDetail } from "../api/types";
import styles from "./ActDocument.module.css";

interface ActDocumentProps {
    // Нужны только поля документа, поэтому подходит и снимок версии акта.
    act: Pick<
        ActDetail,
        | "number_type"
        | "act_number"
        | "customer_name"
        | "device_model"
        | "serial_number"
        | "counter_bw"
        | "counter_color"
        | "engineer_name"
        | "work_date"
        | "device_condition"
        | "works_text"
        | "materials"
    >;
    // Кнопка в правом верхнем углу листа (например, «Редактировать»).
    action?: ReactNode;
}

// 2026-09-18 → 18.09.2026
function formatDate(value: string): string {
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}.${month}.${year}` : value;
}

// Сам документ акта: используется в карточке акта и при просмотре версии.
export function ActDocument({ act, action }: ActDocumentProps) {
    const isThermo = act.number_type === "thermo";

    return (
        <div className={`${styles.act} ${action ? styles.withAction : ""}`}>
            {action && <div className={styles.action}>{action}</div>}

            <h1 className={styles.actTitle}>
                {isThermo
                    ? "Акт ремонта узла термозакрепления"
                    : "Акт приёма-сдачи выполненных работ"}
            </h1>
            <p className={styles.actNumber}>№ {act.act_number || "без номера"}</p>

            <div className={styles.customerBlock}>
                <div className={styles.customerLabel}>Заказчик</div>
                <div className={styles.customerName}>{act.customer_name || "—"}</div>
            </div>

            {!isThermo && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Сведения об аппарате</h2>
                    <div className={styles.deviceGrid}>
                        {[
                            ["Модель", act.device_model],
                            ["Серийный номер", act.serial_number],
                            ["Счётчик ч/б", act.counter_bw],
                            ["Счётчик цветной", act.counter_color],
                        ].map(([label, value]) => (
                            <div key={label} className={styles.deviceItem}>
                                <div className={styles.deviceLabel}>{label}</div>
                                <div className={styles.deviceValue}>{value || "—"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isThermo && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Выполненные работы</h2>
                    <p className={styles.text}>{act.works_text || "—"}</p>
                </div>
            )}

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>ЗИП</h2>
                {act.materials.length === 0 ? (
                    <p className={styles.text}>—</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <td className={styles.label}>Наименование</td>
                                <td className={styles.label}>Артикул</td>
                                <td className={styles.label}>Кол-во</td>
                            </tr>
                        </thead>
                        <tbody>
                            {act.materials.map((item, index) => (
                                <tr key={index}>
                                    <td className={styles.value}>{item.name || "—"}</td>
                                    <td className={styles.value}>{item.article || "—"}</td>
                                    <td className={styles.value}>{item.quantity || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {!isThermo && (
                <div className={`${styles.section} ${styles.condition}`}>
                    <h2 className={styles.sectionTitle}>
                        Состояние аппарата после выполнения работ
                    </h2>
                    <div className={styles.conditionValue}>
                        {act.device_condition || "—"}
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <div>
                    <div className={styles.footerLabel}>Инженер</div>
                    <div className={styles.footerValue}>{act.engineer_name || "—"}</div>
                </div>
                <div className={styles.footerRight}>
                    <div className={styles.footerLabel}>Дата работ</div>
                    <div className={styles.footerValue}>
                        {act.work_date ? formatDate(act.work_date) : "—"}
                    </div>
                </div>
            </div>
        </div>
    );
}
