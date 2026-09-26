import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { getIntraserviceDevice, newActFromTask } from "../api/intraservice";
import { ActStateBadge } from "../components/ActStateBadge";
import { extractErrorMessage } from "../utils/apiError";
import type { IntraserviceDevice } from "../api/types";
import actsStyles from "./ActsPage.module.css";
import styles from "./DevicesPage.module.css";

// Временная карточка аппарата, которого нет в справочнике: данные берутся
// из заявки Intraservice и никуда не сохраняются. Показываем только то,
// что попадёт в акт: серийный номер, модель и клиента.
export function IntraserviceDevicePage() {
    const { taskId } = useParams<{ taskId: string }>();
    const [searchParams] = useSearchParams();
    const serial = searchParams.get("serial") ?? "";
    const [device, setDevice] = useState<IntraserviceDevice | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!taskId || !serial) return;
        let ignore = false;

        getIntraserviceDevice(Number(taskId), serial)
            .then((data) => {
                if (!ignore) setDevice(data);
            })
            .catch((err) => {
                if (!ignore) setError(extractErrorMessage(err, "Не удалось загрузить заявку"));
            });

        return () => {
            ignore = true;
        };
    }, [taskId, serial]);

    const back = (
        <Link className={styles.back} to={`/devices?q=${encodeURIComponent(serial)}`}>
            ← К аппаратам
        </Link>
    );

    if (!serial || error) {
        return (
            <div className={actsStyles.page}>
                {back}
                <p className={actsStyles.empty}>{error ?? "Не указан серийный номер."}</p>
            </div>
        );
    }

    if (!device) {
        return <p className={actsStyles.empty}>Загрузка...</p>;
    }

    const info: [string, string][] = [
        ["Серийный номер", device.serial_number],
        ["Модель", device.model],
        ["Клиент", device.customer],
        ["SAP", device.sap_id],
    ];

    return (
        <div className={actsStyles.page}>
            {back}

            <div className={actsStyles.header}>
                <h2 className={actsStyles.title}>{device.serial_number}</h2>
                <div className={styles.rowActions}>
                    <a
                        className={actsStyles.secondaryButton}
                        href={device.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Открыть в Intraservice
                    </a>
                    <Link
                        className={actsStyles.primaryButton}
                        to={newActFromTask(device.serial_number, device)}
                    >
                        Создать акт
                    </Link>
                </div>
            </div>

            <p className={styles.hint}>
                Временная карточка — аппарата нет в справочнике, данные из заявки
                Intraservice № {device.id}.
            </p>

            <div className={styles.info}>
                {info.map(([label, value]) => (
                    <div key={label}>
                        <div className={styles.infoLabel}>{label}</div>
                        <div className={styles.infoValue}>{value || "—"}</div>
                    </div>
                ))}
            </div>

            <h3 className={styles.sectionTitle}>Акты по аппарату</h3>
            {device.acts.length === 0 ? (
                <p className={actsStyles.empty}>Актов по этому аппарату пока нет.</p>
            ) : (
                <table className={actsStyles.table}>
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Состояние</th>
                            <th>Клиент</th>
                            <th>Инженер</th>
                            <th>Дата работ</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {device.acts.map((act) => (
                            <tr key={act.id}>
                                <td>{act.act_number || "—"}</td>
                                <td>
                                    <ActStateBadge state={act.state} />
                                </td>
                                <td>{act.customer_name || "—"}</td>
                                <td>{act.engineer_name}</td>
                                <td>{act.work_date || "—"}</td>
                                <td>
                                    <Link className={actsStyles.link} to={`/acts/${act.id}`}>
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
