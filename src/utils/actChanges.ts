import type { ActDetail, ActFields, Material } from "../api/types";

export interface ActChange {
    label: string;
    before: string;
    after: string;
}

// Поля, которые видны в форме (и адрес — он меняется при выборе аппарата).
const STANDARD_FIELDS: [keyof ActFields, string][] = [
    ["customer_name", "Заказчик"],
    ["serial_number", "Серийный номер"],
    ["device_model", "Модель аппарата"],
    ["address", "Адрес"],
    ["counter_bw", "Счётчик ч/б"],
    ["counter_color", "Счётчик цветной"],
    ["work_date", "Дата работ"],
    ["works_text", "Выполненные работы"],
];

const THERMO_FIELDS: [keyof ActFields, string][] = [
    ["customer_name", "Заказчик"],
    ["work_date", "Дата работ"],
];

// Сервер схлопывает пробелы и убирает пустые строки — сравниваем так же,
// иначе лишний пробел в конце выглядел бы как изменение.
function normalize(value: string): string {
    return value
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/).join(" "))
        .filter(Boolean)
        .join("\n");
}

function describeMaterial(item: Material): string {
    const parts = [normalize(item.name) || "без названия"];
    if (normalize(item.article)) parts.push(`арт. ${normalize(item.article)}`);
    if (normalize(item.quantity)) parts.push(`× ${normalize(item.quantity)}`);
    return parts.join(" ");
}

function materialKeys(items: Material[]): string[] {
    return items
        .filter((item) => normalize(item.name + item.article + item.quantity))
        .map(describeMaterial);
}

// Элементы a, которых нет в b (с учётом повторов).
function subtract(a: string[], b: string[]): string[] {
    const rest = [...b];
    return a.filter((item) => {
        const index = rest.indexOf(item);
        if (index === -1) return true;
        rest.splice(index, 1);
        return false;
    });
}

export function getActChanges(
    source: ActDetail,
    fields: ActFields,
    materials: Material[],
    actNumber: string | null,
): ActChange[] {
    const changes: ActChange[] = [];

    if (actNumber !== null && normalize(actNumber) !== source.act_number) {
        changes.push({
            label: "Номер акта",
            before: source.act_number,
            after: normalize(actNumber),
        });
    }

    const fieldList =
        source.number_type === "thermo" ? THERMO_FIELDS : STANDARD_FIELDS;
    for (const [key, label] of fieldList) {
        const before = normalize(source[key] ?? "");
        const after = normalize(fields[key]);
        if (before !== after) {
            changes.push({ label, before, after });
        }
    }

    const oldItems = materialKeys(source.materials);
    const newItems = materialKeys(materials);
    for (const item of subtract(oldItems, newItems)) {
        changes.push({ label: "ЗИП: удалено", before: item, after: "" });
    }
    for (const item of subtract(newItems, oldItems)) {
        changes.push({ label: "ЗИП: добавлено", before: "", after: item });
    }

    return changes;
}
