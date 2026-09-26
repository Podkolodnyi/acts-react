import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import styles from "./DatePicker.module.css";

const MONTHS = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Даты храним как «YYYY-MM-DD» — так их ждёт сервер и так их отдавал
// <input type="date">. Все расчёты в местном времени, без UTC.
function toIso(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayIso(): string {
    const now = new Date();
    return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

// 2026-09-18 → 18.09.2026
function isoToText(iso: string): string {
    const [year, month, day] = iso.split("-");
    return year && month && day ? `${day}.${month}.${year}` : "";
}

// 18.09.2026 → 2026-09-18, или null, если дата неполная или не существует.
function textToIso(text: string): string | null {
    const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (date.getMonth() !== Number(mm) - 1 || date.getDate() !== Number(dd)) {
        return null; // например, 31.02.2026
    }
    return `${yyyy}-${mm}-${dd}`;
}

// Ввод с клавиатуры: оставляем цифры и сами расставляем точки.
function maskDigits(text: string): string {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
    return parts.filter(Boolean).join(".");
}

interface DatePickerProps {
    // С name значение попадает в FormData формы (как у <input type="date">).
    name?: string;
    // Управляемый режим: value + onChange. Иначе — defaultValue.
    value?: string;
    defaultValue?: string;
    onChange?: (iso: string) => void;
    required?: boolean;
    inputClassName?: string;
}

export function DatePicker({
    name,
    value,
    defaultValue = "",
    onChange,
    required,
    inputClassName = "",
}: DatePickerProps) {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const iso = value ?? innerValue;

    const [text, setText] = useState(isoToText(iso));
    const [open, setOpen] = useState(false);
    const [view, setView] = useState(() => {
        const base = iso || todayIso();
        return { year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 };
    });
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Если значение поменяли снаружи (например, загрузили акт), обновляем текст.
    const [lastIso, setLastIso] = useState(iso);
    if (iso !== lastIso) {
        setLastIso(iso);
        setText(isoToText(iso));
    }

    // Клик вне компонента закрывает календарь.
    useEffect(() => {
        if (!open) return;
        function handleMouseDown(event: MouseEvent) {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [open]);

    function commit(next: string) {
        if (value === undefined) setInnerValue(next);
        onChange?.(next);
    }

    function pick(nextIso: string) {
        commit(nextIso);
        setText(isoToText(nextIso));
        setOpen(false);
    }

    function openCalendar() {
        const base = iso || todayIso();
        setView({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 });
        setOpen(true);
    }

    function shiftMonth(delta: number) {
        setView(({ year, month }) => {
            const date = new Date(year, month + delta, 1);
            return { year: date.getFullYear(), month: date.getMonth() };
        });
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") setOpen(false);
    }

    // Сетка 6×7, неделя с понедельника; дни соседних месяцев — бледные.
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() + 6) % 7;
    const cells = Array.from({ length: 42 }, (_, index) => {
        const date = new Date(view.year, view.month, 1 - offset + index);
        return {
            iso: toIso(date.getFullYear(), date.getMonth(), date.getDate()),
            day: date.getDate(),
            outside: date.getMonth() !== view.month,
        };
    });
    const today = todayIso();

    return (
        <div className={styles.wrapper} ref={wrapperRef} onKeyDown={handleKeyDown}>
            {name && <input type="hidden" name={name} value={iso} />}

            <input
                className={`${inputClassName} ${styles.input}`}
                inputMode="numeric"
                placeholder="дд.мм.гггг"
                required={required}
                value={text}
                onChange={(event) => {
                    const masked = maskDigits(event.target.value);
                    setText(masked);
                    if (!masked) {
                        commit("");
                        return;
                    }
                    const parsed = textToIso(masked);
                    if (parsed) {
                        commit(parsed);
                        setView({
                            year: Number(parsed.slice(0, 4)),
                            month: Number(parsed.slice(5, 7)) - 1,
                        });
                    }
                }}
                // Недописанную дату при уходе с поля возвращаем к последней верной.
                onBlur={() => setText(isoToText(iso))}
            />
            <button
                className={styles.iconButton}
                type="button"
                aria-label="Открыть календарь"
                onClick={() => (open ? setOpen(false) : openCalendar())}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            </button>

            {open && (
                <div className={styles.popup} role="dialog" aria-label="Выбор даты">
                    <div className={styles.header}>
                        <button
                            className={styles.navButton}
                            type="button"
                            aria-label="Предыдущий месяц"
                            onClick={() => shiftMonth(-1)}
                        >
                            ‹
                        </button>
                        <span className={styles.month}>
                            {MONTHS[view.month]} {view.year}
                        </span>
                        <button
                            className={styles.navButton}
                            type="button"
                            aria-label="Следующий месяц"
                            onClick={() => shiftMonth(1)}
                        >
                            ›
                        </button>
                    </div>

                    <div className={styles.grid}>
                        {WEEKDAYS.map((weekday) => (
                            <span key={weekday} className={styles.weekday}>
                                {weekday}
                            </span>
                        ))}
                        {cells.map((cell) => (
                            <button
                                key={cell.iso}
                                type="button"
                                className={[
                                    styles.day,
                                    cell.outside ? styles.outside : "",
                                    cell.iso === today ? styles.today : "",
                                    cell.iso === iso ? styles.selected : "",
                                ].join(" ")}
                                onClick={() => pick(cell.iso)}
                            >
                                {cell.day}
                            </button>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <button
                            className={styles.footerButton}
                            type="button"
                            onClick={() => {
                                commit("");
                                setText("");
                                setOpen(false);
                            }}
                        >
                            Очистить
                        </button>
                        <button
                            className={styles.footerButton}
                            type="button"
                            onClick={() => pick(today)}
                        >
                            Сегодня
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
