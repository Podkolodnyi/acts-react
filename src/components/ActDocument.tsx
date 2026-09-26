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
}

// Сам документ акта: используется в карточке акта и при просмотре версии.
export function ActDocument({ act }: ActDocumentProps) {
    const isThermo = act.number_type === "thermo";

    return (
            <div className={styles.act}>
                <h1 className={styles.actTitle}>
                    {isThermo
                        ? "Акт ремонта узла терморегистрации"
                        : "Акт приёма-сдачи выполненных работ"}
                </h1>
                <p className={styles.actNumber}>
                    № {act.act_number || "без номера"}
                </p>

                <div className={styles.customerBlock}>
                    <div className={styles.customerLabel}>Заказчик</div>
                    <div className={styles.customerName}>
                        {act.customer_name || "—"}
                    </div>
                </div>

                {!isThermo && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Сведения об аппарате</h2>
                        <table className={styles.table}>
                            <tbody>
                                <tr>
                                    <td className={styles.label}>Модель</td>
                                    <td className={styles.value}>
                                        {act.device_model || "—"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.label}>Серийный номер</td>
                                    <td className={styles.value}>
                                        {act.serial_number || "—"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.label}>Счётчик ч/б</td>
                                    <td className={styles.value}>
                                        {act.counter_bw || "—"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.label}>Счётчик цветной</td>
                                    <td className={styles.value}>
                                        {act.counter_color || "—"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Исполнитель и дата</h2>
                    <table className={styles.table}>
                        <tbody>
                            <tr>
                                <td className={styles.label}>Инженер</td>
                                <td className={styles.value}>
                                    {act.engineer_name || "—"}
                                </td>
                            </tr>
                            <tr>
                                <td className={styles.label}>Дата работ</td>
                                <td className={styles.value}>
                                    {act.work_date || "—"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {!isThermo && (
                    <>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                Состояние аппарата после выполнения работ
                            </h2>
                            <p className={styles.text}>{act.device_condition || "—"}</p>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Выполненные работы</h2>
                            <p className={styles.text}>{act.works_text || "—"}</p>
                        </div>
                    </>
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
                                        <td className={styles.value}>
                                            {item.name || "—"}
                                        </td>
                                        <td className={styles.value}>
                                            {item.article || "—"}
                                        </td>
                                        <td className={styles.value}>
                                            {item.quantity || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
    );
}
