import { useId, useState, type KeyboardEvent } from "react";
import styles from "./SearchSelect.module.css";

export interface SearchSelectOption {
    value: string;
    label: string;
}

interface SearchSelectProps {
    // Имя скрытого поля: значение попадает в FormData формы, как у <select>.
    name: string;
    options: SearchSelectOption[];
    defaultValue?: string;
    // Первый пункт с пустым значением, например «Все инженеры».
    emptyLabel: string;
    // Класс для поля ввода, чтобы оно выглядело как соседние поля формы.
    inputClassName?: string;
}

// Выпадающий список с поиском: при вводе текста остаются только
// подходящие пункты. Выбор — кликом или ↑ ↓ Enter, Esc закрывает.
export function SearchSelect({
    name,
    options,
    defaultValue = "",
    emptyLabel,
    inputClassName = "",
}: SearchSelectProps) {
    const listId = useId();
    const [value, setValue] = useState(defaultValue);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);

    const allOptions: SearchSelectOption[] = [{ value: "", label: emptyLabel }, ...options];
    const selectedLabel =
        allOptions.find((option) => option.value === value)?.label ?? emptyLabel;

    const needle = query.trim().toLowerCase();
    // «Все …» показываем всегда, остальное — по совпадению с текстом.
    const visible = needle
        ? [
              allOptions[0],
              ...options.filter((option) =>
                  option.label.toLowerCase().includes(needle),
              ),
          ]
        : allOptions;

    function openList() {
        setOpen(true);
        setQuery("");
        setHighlight(Math.max(0, allOptions.findIndex((o) => o.value === value)));
    }

    function choose(option: SearchSelectOption) {
        setValue(option.value);
        setOpen(false);
        setQuery("");
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
            event.preventDefault();
            openList();
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlight((index) => Math.min(index + 1, visible.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter") {
            // Не отправляем форму: Enter здесь выбирает пункт.
            event.preventDefault();
            if (visible[highlight]) choose(visible[highlight]);
        } else if (event.key === "Escape") {
            setOpen(false);
            setQuery("");
        }
    }

    return (
        <div className={styles.wrapper}>
            <input type="hidden" name={name} value={value} />

            <input
                className={`${inputClassName} ${styles.input}`}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                value={open ? query : selectedLabel}
                placeholder={selectedLabel}
                onFocus={openList}
                onClick={() => !open && openList()}
                onBlur={() => {
                    setOpen(false);
                    setQuery("");
                }}
                onChange={(event) => {
                    setQuery(event.target.value);
                    // Пока что-то введено, подсвечиваем первое совпадение
                    // (индекс 1), а не «Все …», чтобы Enter выбирал найденное.
                    setHighlight(event.target.value.trim() ? 1 : 0);
                    setOpen(true);
                }}
                onKeyDown={handleKeyDown}
            />
            <span className={styles.arrow} aria-hidden="true">
                ▾
            </span>

            {open && (
                <ul className={styles.list} id={listId} role="listbox">
                    {visible.map((option, index) => (
                        <li
                            key={option.value || "__all"}
                            role="option"
                            aria-selected={option.value === value}
                            className={[
                                styles.option,
                                option.value === value ? styles.selected : "",
                                index === highlight ? styles.highlighted : "",
                            ].join(" ")}
                            // mousedown, а не click: иначе поле потеряет фокус
                            // и список закроется раньше, чем сработает выбор.
                            onMouseDown={(event) => {
                                event.preventDefault();
                                choose(option);
                            }}
                            onMouseEnter={() => setHighlight(index)}
                        >
                            {option.label}
                        </li>
                    ))}
                    {needle && visible.length === 1 && (
                        <li className={styles.empty}>Не найдено</li>
                    )}
                </ul>
            )}
        </div>
    );
}
