import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getDevice } from "../api/devices";
import { ApiError } from "../api/client";
import { ActStateBadge } from "../components/ActStateBadge";
import type { DeviceDetail } from "../api/types";
import actsStyles from "./ActsPage.module.css";
import styles from "./DevicesPage.module.css";

// Карточка аппарата: данные справочника и история актов по серийнику.
export function DevicePage() {
    const { id } = useParams<{ id: string }>();
    const [device, setDevice] = useState<DeviceDetail | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        let ignore = false;

        getDevice(Number(id))
            .then((data) => {
                if (!ignore) setDevice(data);
            })
            .catch((err) => {
                if (!ignore && err instanceof ApiError && err.status === 404) {
                    setNotFound(true);
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    if (loading) {
        return <p className={actsStyles.empty}>Загрузка...</p>;
    }

    if (notFound || !device) {
        return (
            <div className={actsStyles.page}>
                <p className={actsStyles.empty}>Аппарат не найден.</p>
            </div>
        );
    }

    const info: [string, string][] = [
        ["Серийный номер", device.serial_number],
        ["Модель", device.device_model],
        ["Клиент", device.customer_name],
        ["Адрес", device.address],
        ["SAP", device.sap_id],
        ["МВЗ", device.mvz],
        ["Формат объекта", device.object_format],
    ];

    return (
        <div className={actsStyles.page}>
            <Link className={styles.back} to="/devices">
                ← К аппаратам
            </Link>

            <div className={actsStyles.header}>
                <h2 className={actsStyles.title}>{device.serial_number}</h2>
                <Link className={actsStyles.primaryButton} to={`/acts/new?device=${device.id}`}>
                    Создать акт
                </Link>
            </div>

            <div className={styles.info}>
                {/* Пустые поля не показываем (у «ручных» аппаратов их много). */}
                {info
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                        <div key={label}>
                            <div className={styles.infoLabel}>{label}</div>
                            <div className={styles.infoValue}>{value}</div>
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
