import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { createAct, getAct, repairAct, updateAct } from "../api/acts";
import { ApiError } from "../api/client";
import { searchDevices } from "../api/devices";
import { ChangesDialog } from "../components/ChangesDialog";
import { MaterialsEditor } from "../components/MaterialsEditor";
import { useSession } from "../session/session-context";
import { getActChanges, type ActChange } from "../utils/actChanges";
import { extractErrorMessage } from "../utils/apiError";
import type {
    ActDetail,
    ActFields,
    ActPayload,
    Device,
    DeviceCondition,
    Material,
} from "../api/types";
import styles from "./ActFormPage.module.css";

// new        — новый обычный акт
// new-thermo — новый акт ремонта узла терморегистрации
// edit       — редактирование существующего акта
// repair     — копия акта «Не работает» с состоянием «Работает»
export type ActFormMode = "new" | "new-thermo" | "edit" | "repair";

const EMPTY_FIELDS: ActFields = {
    customer_name: "",
    customer_representative: "",
    device_model: "",
    serial_number: "",
    printeco_label: "",
    device_type: "",
    comment_label: "",
    address: "",
    phone: "",
    fault: "",
    counter_bw: "",
    counter_color: "",
    service_kind: "",
    diagnostics_result: "",
    works_text: "",
    work_date: "",
    start_time: "",
    end_time: "",
    customer_signatory: "",
    intraservice_task_id: "",
};

const CONDITIONS: DeviceCondition[] = ["Работает", "Не работает"];

// Сегодняшняя дата в формате YYYY-MM-DD по местному времени.
// toISOString() не подходит: он даёт дату по UTC.
function today(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

// Берёт из акта только поля формы (без id, номера, ссылок и т.п.).
function pickFields(act: ActDetail): ActFields {
    const fields = { ...EMPTY_FIELDS };
    for (const key of Object.keys(EMPTY_FIELDS) as (keyof ActFields)[]) {
        fields[key] = act[key] ?? "";
    }
    return fields;
}

interface ActFormPageProps {
    mode: ActFormMode;
}

export function ActFormPage({ mode }: ActFormPageProps) {
    const { id } = useParams<{ id: string }>();

    // key заставляет React создать форму заново при переходе, например,
    // с /acts/new на /acts/new-thermo — иначе старые значения полей остались бы.
    return <ActForm key={`${mode}-${id ?? ""}`} mode={mode} actId={id ? Number(id) : null} />;
}

interface ActFormProps {
    mode: ActFormMode;
    actId: number | null;
}

function ActForm({ mode, actId }: ActFormProps) {
    const navigate = useNavigate();
    const { engineer } = useSession();
    const needsSource = mode === "edit" || mode === "repair";
    // Номер акта вручную правит только админ и только при редактировании.
    const canEditNumber = mode === "edit" && Boolean(engineer?.is_admin);

    // Акт, который редактируем или ремонтируем.
    const [source, setSource] = useState<ActDetail | null>(null);
    const [loading, setLoading] = useState(needsSource);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [fields, setFields] = useState<ActFields>({
        ...EMPTY_FIELDS,
        work_date: today(),
    });
    const [condition, setCondition] = useState<DeviceCondition | "">("");
    const [materials, setMaterials] = useState<Material[]>([]);
    const [sourceDeviceId, setSourceDeviceId] = useState<number | null>(null);
    const [actNumber, setActNumber] = useState("");

    const [devices, setDevices] = useState<Device[] | null>(null);
    const [searching, setSearching] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    // Список изменений для окна подтверждения (только при редактировании).
    const [pendingChanges, setPendingChanges] = useState<ActChange[] | null>(null);

    useEffect(() => {
        if (!needsSource || actId === null) return;
        let ignore = false;

        getAct(actId)
            .then((act) => {
                if (ignore) return;
                setSource(act);
                setFields({
                    ...pickFields(act),
                    // Ремонт — это новый визит, поэтому дата сегодняшняя.
                    work_date: mode === "repair" ? today() : act.work_date,
                });
                setCondition(
                    mode === "repair"
                        ? "Работает"
                        : (act.device_condition as DeviceCondition),
                );
                setMaterials(act.materials);
                setSourceDeviceId(act.source_device_id);
                setActNumber(act.act_number);
                setLoading(false);
            })
            .catch((err) => {
                if (ignore) return;
                setLoadError(
                    err instanceof ApiError && err.status === 404
                        ? "Акт не найден."
                        : "Не удалось загрузить акт.",
                );
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [needsSource, actId, mode]);

    const isThermo =
        mode === "new-thermo" || source?.number_type === "thermo";

    function setField(name: keyof ActFields, value: string) {
        setFields((prev) => ({ ...prev, [name]: value }));
    }

    async function handleDeviceSearch() {
        const query = fields.serial_number.trim();
        if (!query) return;

        setSearching(true);
        try {
            setDevices(await searchDevices(query));
        } catch {
            setDevices([]);
        } finally {
            setSearching(false);
        }
    }

    function handleDevicePick(device: Device) {
        setFields((prev) => ({
            ...prev,
            customer_name: device.customer_name,
            device_model: device.device_model,
            serial_number: device.serial_number,
            address: device.address,
        }));
        setSourceDeviceId(device.id);
        setDevices(null);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        // При редактировании сначала показываем, что изменится.
        if (mode === "edit" && source) {
            setPendingChanges(
                getActChanges(
                    source,
                    fields,
                    materials,
                    canEditNumber ? actNumber : null,
                ),
            );
            return;
        }

        save();
    }

    async function save() {
        const payload: ActPayload = {
            ...fields,
            materials,
            source_device_id: sourceDeviceId,
        };
        if (mode === "new" || mode === "new-thermo") {
            payload.number_type = isThermo ? "thermo" : "standard";
        }
        if (!isThermo) {
            payload.device_condition = condition;
        }
        if (canEditNumber) {
            payload.act_number = actNumber;
        }

        setSubmitting(true);
        setError(null);

        try {
            let saved: ActDetail;
            if (mode === "edit" && actId !== null) {
                saved = await updateAct(actId, payload);
            } else if (mode === "repair" && actId !== null) {
                saved = await repairAct(actId, payload);
            } else {
                saved = await createAct(payload);
            }
            navigate(`/acts/${saved.id}`);
        } catch (err) {
            setError(extractErrorMessage(err, "Не удалось сохранить акт"));
            setSubmitting(false);
            setPendingChanges(null);
        }
    }

    const cancelTo =
        actId !== null
            ? `/acts/${actId}`
            : isThermo
              ? "/acts?type=thermo"
              : "/acts";

    if (loading) {
        return <p className={styles.empty}>Загрузка...</p>;
    }

    // Не показываем форму, если сохранить её всё равно не получится.
    const blockedMessage =
        loadError ??
        (mode === "edit" && source && !source.can_edit
            ? "У вас нет прав на редактирование этого акта."
            : mode === "repair" && source && !source.can_repair
              ? "Этот акт нельзя отметить как отремонтированный."
              : null);

    if (blockedMessage) {
        return (
            <div className={styles.page}>
                <p className={styles.empty}>{blockedMessage}</p>
                <Link className={styles.back} to={cancelTo}>
                    ← Назад
                </Link>
            </div>
        );
    }

    const title =
        mode === "new"
            ? "Новый акт"
            : mode === "new-thermo"
              ? "Новый акт ремонта узла терморегистрации"
              : mode === "edit"
                ? `Редактирование акта ${source?.act_number ?? ""}`
                : `Ремонт по акту ${source?.act_number ?? ""}`;

    return (
        <div className={styles.page}>
            <Link className={styles.back} to={cancelTo}>
                ← {actId !== null ? "К акту" : "К списку актов"}
            </Link>

            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>{title}</h2>

                {mode === "repair" && (
                    <p className={styles.hint}>
                        Будет создан новый акт с состоянием «Работает» и следующим
                        свободным номером. Исходный акт останется без изменений
                        и получит пометку «Отремонтирован».
                    </p>
                )}

                {error && <p className={styles.error}>{error}</p>}

                {canEditNumber && (
                    <label className={styles.field}>
                        <span className={styles.label}>Номер акта *</span>
                        <input
                            className={styles.input}
                            required
                            value={actNumber}
                            onChange={(event) => setActNumber(event.target.value)}
                        />
                        {source && actNumber.trim() !== source.act_number && (
                            <span className={styles.warning}>
                                Новые акты нумеруются как «наибольший номер в месяце + 1».
                                Если новый номер больше текущих, пропущенные номера
                                выдаваться не будут. Прежний номер {source.act_number}{" "}
                                освободится и может достаться следующему новому акту.
                            </span>
                        )}
                    </label>
                )}

                <label className={styles.field}>
                    <span className={styles.label}>Заказчик *</span>
                    <input
                        className={styles.input}
                        required
                        value={fields.customer_name}
                        onChange={(event) =>
                            setField("customer_name", event.target.value)
                        }
                    />
                </label>

                {!isThermo && (
                    <>
                        <div className={styles.field}>
                            <span className={styles.label}>Серийный номер *</span>
                            <div className={styles.inline}>
                                <input
                                    className={styles.input}
                                    required
                                    value={fields.serial_number}
                                    onChange={(event) => {
                                        setField("serial_number", event.target.value);
                                        // Серийник поменяли вручную — связь со
                                        // справочником больше не актуальна.
                                        setSourceDeviceId(null);
                                    }}
                                />
                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    disabled={searching || !fields.serial_number.trim()}
                                    onClick={handleDeviceSearch}
                                >
                                    {searching ? "Поиск..." : "Найти в справочнике"}
                                </button>
                            </div>

                            {devices !== null && (
                                <div className={styles.deviceResults}>
                                    {devices.length === 0 ? (
                                        <p className={styles.deviceEmpty}>
                                            Аппарат не найден — заполните данные вручную.
                                        </p>
                                    ) : (
                                        devices.map((device) => (
                                            <button
                                                key={device.id}
                                                className={styles.deviceItem}
                                                type="button"
                                                onClick={() => handleDevicePick(device)}
                                            >
                                                <strong>{device.serial_number}</strong>
                                                {" · "}
                                                {device.device_model || "—"}
                                                {" · "}
                                                {device.customer_name}
                                                {device.address && (
                                                    <span className={styles.deviceAddress}>
                                                        {device.address}
                                                    </span>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <label className={styles.field}>
                            <span className={styles.label}>Модель аппарата</span>
                            <input
                                className={styles.input}
                                value={fields.device_model}
                                onChange={(event) =>
                                    setField("device_model", event.target.value)
                                }
                            />
                        </label>

                        <div className={styles.row}>
                            <label className={styles.field}>
                                <span className={styles.label}>Счётчик ч/б</span>
                                <input
                                    className={styles.input}
                                    value={fields.counter_bw}
                                    onChange={(event) =>
                                        setField("counter_bw", event.target.value)
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span className={styles.label}>Счётчик цветной</span>
                                <input
                                    className={styles.input}
                                    value={fields.counter_color}
                                    onChange={(event) =>
                                        setField("counter_color", event.target.value)
                                    }
                                />
                            </label>
                        </div>
                    </>
                )}

                <label className={`${styles.field} ${styles.dateField}`}>
                    <span className={styles.label}>Дата работ *</span>
                    <input
                        className={styles.input}
                        type="date"
                        required
                        value={fields.work_date}
                        onChange={(event) => setField("work_date", event.target.value)}
                    />
                </label>

                {!isThermo && (
                    <>
                        <fieldset className={styles.field}>
                            <legend className={styles.label}>
                                Состояние аппарата после работ *
                            </legend>
                            {mode === "new" ? (
                                <div className={styles.conditions}>
                                    {CONDITIONS.map((value) => (
                                        <label key={value} className={styles.radio}>
                                            <input
                                                type="radio"
                                                name="device_condition"
                                                value={value}
                                                required
                                                checked={condition === value}
                                                onChange={() => setCondition(value)}
                                            />
                                            {value}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.frozen}>
                                    {condition || "—"}
                                    <span className={styles.frozenHint}>
                                        {mode === "repair"
                                            ? "задаётся автоматически"
                                            : "изменить нельзя"}
                                    </span>
                                </p>
                            )}
                        </fieldset>

                        <label className={styles.field}>
                            <span className={styles.label}>Выполненные работы</span>
                            <textarea
                                className={`${styles.input} ${styles.textarea}`}
                                value={fields.works_text}
                                onChange={(event) =>
                                    setField("works_text", event.target.value)
                                }
                            />
                        </label>
                    </>
                )}

                <div className={styles.field}>
                    <span className={styles.label}>ЗИП</span>
                    <MaterialsEditor items={materials} onChange={setMaterials} />
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Сохранение..."
                            : mode === "repair"
                              ? "Создать акт ремонта"
                              : "Сохранить"}
                    </button>

                    <Link className={styles.secondaryButton} to={cancelTo}>
                        Отмена
                    </Link>
                </div>
            </form>

            {pendingChanges && (
                <ChangesDialog
                    changes={pendingChanges}
                    saving={submitting}
                    onConfirm={save}
                    onCancel={() => setPendingChanges(null)}
                />
            )}
        </div>
    );
}
