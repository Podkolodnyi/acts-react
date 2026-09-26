import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { createAct, getAct, repairAct, updateAct } from "../api/acts";
import { ApiError } from "../api/client";
import { getDevice, searchDevices } from "../api/devices";
import { searchIntraservice } from "../api/intraservice";
import { ChangesDialog } from "../components/ChangesDialog";
import { DatePicker } from "../components/DatePicker";
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
    IntraserviceTask,
    Material,
} from "../api/types";
import styles from "./ActFormPage.module.css";

// new        — новый обычный акт
// new-thermo — новый акт ремонта узла термозакрепления
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

// 2026-09-17T07:25:46 → 17.09.2026
function formatTaskDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split("-");
    return year && month && day ? `${day}.${month}.${year}` : "";
}

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
    // /acts/new?device=<id> — новый акт по аппарату из справочника.
    const [searchParams] = useSearchParams();
    const deviceParam = mode === "new" ? searchParams.get("device") : null;
    const deviceId = deviceParam ? Number(deviceParam) : null;
    // /acts/new?serial=…&model=…&customer=…&task=… — новый акт по заявке
    // Intraservice со страницы «Аппараты».
    const prefill: Partial<ActFields> =
        mode === "new"
            ? {
                  serial_number: (searchParams.get("serial") ?? "").toUpperCase(),
                  device_model: searchParams.get("model") ?? "",
                  customer_name: searchParams.get("customer") ?? "",
                  intraservice_task_id: searchParams.get("task") ?? "",
              }
            : {};

    // key заставляет React создать форму заново при переходе, например,
    // с /acts/new на /acts/new-thermo — иначе старые значения полей остались бы.
    return (
        <ActForm
            key={`${mode}-${id ?? ""}-${deviceId ?? ""}-${searchParams.toString()}`}
            mode={mode}
            actId={id ? Number(id) : null}
            deviceId={deviceId}
            prefill={prefill}
        />
    );
}

interface ActFormProps {
    mode: ActFormMode;
    actId: number | null;
    deviceId: number | null;
    prefill: Partial<ActFields>;
}

function ActForm({ mode, actId, deviceId, prefill }: ActFormProps) {
    const navigate = useNavigate();
    const { engineer } = useSession();
    const needsSource = mode === "edit" || mode === "repair";
    // Номер акта вручную правит только админ и только при редактировании.
    const canEditNumber = mode === "edit" && Boolean(engineer?.is_admin);

    // Акт, который редактируем или ремонтируем.
    const [source, setSource] = useState<ActDetail | null>(null);
    const [loading, setLoading] = useState(needsSource);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [fields, setFields] = useState<ActFields>(() => ({
        ...EMPTY_FIELDS,
        work_date: today(),
        // Пустые значения из ссылки не перетирают поля по умолчанию.
        ...Object.fromEntries(Object.entries(prefill).filter(([, value]) => value)),
    }));
    const [condition, setCondition] = useState<DeviceCondition | "">("");
    const [materials, setMaterials] = useState<Material[]>([]);
    const [sourceDeviceId, setSourceDeviceId] = useState<number | null>(null);
    const [actNumber, setActNumber] = useState("");

    const [devices, setDevices] = useState<Device[] | null>(null);
    const [searching, setSearching] = useState(false);
    // Заявки Intraservice — ищем, только если в справочнике ничего нет.
    const [tasks, setTasks] = useState<IntraserviceTask[] | null>(null);
    const [tasksError, setTasksError] = useState<string | null>(null);

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

    // Новый акт по аппарату из справочника: подставляем его данные.
    useEffect(() => {
        if (deviceId === null) return;
        let ignore = false;

        getDevice(deviceId)
            .then((device) => {
                if (ignore) return;
                setFields((prev) => ({
                    ...prev,
                    customer_name: device.customer_name,
                    device_model: device.device_model,
                    serial_number: device.serial_number.toUpperCase(),
                    address: device.address,
                }));
                setSourceDeviceId(device.id);
            })
            .catch(() => {
                // Аппарат не найден — просто пустая форма.
            });

        return () => {
            ignore = true;
        };
    }, [deviceId]);

    const isThermo =
        mode === "new-thermo" || source?.number_type === "thermo";

    function setField(name: keyof ActFields, value: string) {
        setFields((prev) => ({ ...prev, [name]: value }));
    }

    async function handleDeviceSearch() {
        const query = fields.serial_number.trim();
        if (!query) return;

        setSearching(true);
        setTasks(null);
        setTasksError(null);
        try {
            const found = await searchDevices(query).catch(() => []);
            setDevices(found);
            if (found.length === 0) {
                try {
                    setTasks((await searchIntraservice(query)).tasks);
                } catch (err) {
                    setTasksError(
                        extractErrorMessage(err, "Не удалось выполнить поиск в Intraservice"),
                    );
                }
            }
        } finally {
            setSearching(false);
        }
    }

    // Из заявки берём только модель и клиента (если сервер их нашёл)
    // и запоминаем номер заявки в акте.
    function handleTaskPick(task: IntraserviceTask) {
        setFields((prev) => ({
            ...prev,
            device_model: task.model || prev.device_model,
            customer_name: task.customer || prev.customer_name,
            intraservice_task_id: String(task.id),
        }));
        setDevices(null);
        setTasks(null);
    }

    function handleDevicePick(device: Device) {
        setFields((prev) => ({
            ...prev,
            customer_name: device.customer_name,
            device_model: device.device_model,
            serial_number: device.serial_number.toUpperCase(),
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
              ? "Новый акт ремонта узла термозакрепления"
              : mode === "edit"
                ? `Редактирование акта ${source?.act_number ?? ""}`
                : `Ремонт по акту ${source?.act_number ?? ""}`;

    return (
        <div className={styles.page}>
            <Link className={styles.back} to={cancelTo}>
                ← {actId !== null ? "К акту" : "К списку актов"}
            </Link>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>

                    {/* Переход между двумя видами нового акта (без сохранения). */}
                    {mode === "new" && (
                        <Link className={styles.switchLink} to="/acts/new-thermo">
                            Создать акт ремонта узла термозакрепления
                        </Link>
                    )}
                    {mode === "new-thermo" && (
                        <Link className={styles.switchLink} to="/acts/new">
                            Создать обычный акт
                        </Link>
                    )}
                </div>

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
                                        setField(
                                            "serial_number",
                                            event.target.value.toUpperCase(),
                                        );
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
                                        <>
                                            <p className={styles.deviceEmpty}>
                                                {searching
                                                    ? "В справочнике не найдено, ищем в Intraservice..."
                                                    : tasksError
                                                      ? tasksError
                                                      : tasks && tasks.length > 0
                                                        ? "В справочнике не найдено. Заявки в Intraservice:"
                                                        : "Не найдено ни в справочнике, ни в Intraservice — заполните данные вручную."}
                                            </p>
                                            {tasks?.map((task) => (
                                                <div key={task.id} className={styles.taskItem}>
                                                    <button
                                                        className={styles.taskPick}
                                                        type="button"
                                                        onClick={() => handleTaskPick(task)}
                                                    >
                                                        <strong>№ {task.id}</strong>
                                                        {" · "}
                                                        {task.type || "заявка"}
                                                        {task.created && ` · ${formatTaskDate(task.created)}`}
                                                        <span className={styles.deviceAddress}>
                                                            {task.model || "модель не указана"}
                                                            {" · "}
                                                            {task.customer || "клиент не указан"}
                                                        </span>
                                                    </button>
                                                    <a
                                                        className={styles.taskLink}
                                                        href={task.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Открыть
                                                    </a>
                                                </div>
                                            ))}
                                        </>
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

                <div className={`${styles.field} ${styles.dateField}`}>
                    <span className={styles.label}>Дата работ *</span>
                    <DatePicker
                        required
                        value={fields.work_date}
                        onChange={(iso) => setField("work_date", iso)}
                        inputClassName={styles.input}
                    />
                </div>

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
