import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAct } from "../api/acts";
import { ApiError } from "../api/client";
import { ActStateBadge } from "../components/ActStateBadge";
import type { ActDetail } from "../api/types";
import styles from "./ActDetailsPage.module.css";

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

    const isThermo = act.number_type === "thermo";

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link
                    className={styles.back}
                    to={isThermo ? "/acts?type=thermo" : "/acts"}
                >
                    ← К списку актов
                </Link>

                <div className={styles.actions}>
                    {act.can_repair && (
                        <Link
                            className={styles.primaryButton}
                            to={`/acts/${act.id}/repair`}
                        >
                            Отремонтирован
                        </Link>
                    )}
                    {act.can_edit && (
                        <Link
                            className={styles.secondaryButton}
                            to={`/acts/${act.id}/edit`}
                        >
                            Редактировать
                        </Link>
                    )}
                    <ActStateBadge state={act.state} />
                </div>
            </div>

            {act.repaired_by && (
                <p className={styles.linkNote}>
                    Отремонтирован →{" "}
                    <Link to={`/acts/${act.repaired_by.id}`}>
                        акт {act.repaired_by.act_number}
                    </Link>
                </p>
            )}
            {act.repair_of && (
                <p className={styles.linkNote}>
                    Ремонт по акту{" "}
                    <Link to={`/acts/${act.repair_of.id}`}>
                        {act.repair_of.act_number}
                    </Link>
                </p>
            )}

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
        </div>
    );
}
