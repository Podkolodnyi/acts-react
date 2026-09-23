import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { register } from "../api/session";
import { extractErrorMessage } from "../utils/apiError";
import styles from "./EngineerSelectPage.module.css";

export function RegisterPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await register(firstName, lastName, password);
            setDone(true);
        } catch (err) {
            setError(
                extractErrorMessage(
                    err,
                    "Не удалось отправить заявку — проверьте данные",
                ),
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (done) {
        return (
            <div className={styles.form}>
                <h2 className={styles.title}>Заявка отправлена</h2>
                <p className={styles.hint}>
                    Дождитесь подтверждения администратором, затем сможете
                    войти, выбрав своё имя из списка.
                </p>
                <Link className={styles.link} to="/engineer">
                    К выбору инженера
                </Link>
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.title}>Регистрация</h2>

            {error && <p className={styles.error}>{error}</p>}

            <input
                className={styles.input}
                type="text"
                placeholder="Имя"
                autoFocus
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
            />

            <input
                className={styles.input}
                type="text"
                placeholder="Фамилия"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
            />

            <input
                className={styles.input}
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />

            <input
                className={styles.input}
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
            />

            <button
                className={styles.submit}
                type="submit"
                disabled={submitting || !firstName || !lastName || !password}
            >
                {submitting ? "Отправка..." : "Отправить заявку"}
            </button>

            <Link className={styles.link} to="/engineer">
                Назад к выбору инженера
            </Link>
        </form>
    );
}
