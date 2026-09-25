import { useState, type ChangeEvent } from "react";
import styles from "./PasswordInput.module.css";

interface PasswordInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
}

export function PasswordInput({
    placeholder,
    value,
    onChange,
    autoFocus,
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return (
        <div className={styles.wrapper}>
            <input
                className={styles.input}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                autoFocus={autoFocus}
                value={value}
                onChange={handleChange}
            />

            <button
                type="button"
                className={styles.toggle}
                tabIndex={-1}
                onClick={() => setVisible((current) => !current)}
            >
                {visible ? "Скрыть" : "Показать"}
            </button>
        </div>
    );
}
