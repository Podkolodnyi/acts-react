import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAct } from "../api/acts";
import { ApiError } from "../api/client";
import { parseMaterials } from "../utils/materials";
import type { ActDetail } from "../api/types";
import styles from "./ActDetailsPage.module.css";

const STATUS_LABELS: Record<string, string> = {
    draft: "Черновик",
    completed: "Завершён",
};

export function ActDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [act, setAct] = useState<ActDetail | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let ignore = false;

        getAct(Number(id))
            .then((data) => {
                if (!ignore) {
                    setAct(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (ignore) return;
                if (err instanceof ApiError && err.status === 404) {
                    setNotFound(true);
                }
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    if (loading) {
        return <p className={styles.empty}>Загрузка...</p>;
    }

    if (notFound || !act) {
        return (
            <div className={styles.page}>
                <p className={styles.empty}>Акт не найден.</p>
                <Link className={styles.back} to="/acts">
                    ← К списку актов
                </Link>
            </div>
        );
    }

    const materials = parseMaterials(act.materials_text || "");

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link className={styles.back} to="/acts">
                    ← К списку актов
                </Link>

                <span className={`${styles.badge} ${styles[act.status] ?? ""}`}>
                    {STATUS_LABELS[act.status] ?? act.status}
                </span>
            </div>

            <div className={styles.act}>
                <h1 className={styles.actTitle}>
                    Акт приёма-сдачи выполненных работ
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

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>ЗИП</h2>
                    {materials.length === 0 ? (
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
                                {materials.map((item, index) => (
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
        </div>
    );
}
