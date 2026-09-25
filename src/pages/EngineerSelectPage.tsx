import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { PasswordInput } from "../components/PasswordInput";
import { getEngineers } from "../api/engineers";
import { claimAccount, login } from "../api/session";
import { useSession } from "../session/session-context";
import { formatEngineerName } from "../utils/engineerName";
import type { EngineerOption } from "../api/types";
import styles from "./EngineerSelectPage.module.css";

const SEARCH_THRESHOLD = 10;

export function EngineerSelectPage() {
    const [engineers, setEngineers] = useState<EngineerOption[]>([]);
    const [search, setSearch] = useState("");
    const [selectedKey, setSelectedKey] = useState("");
    const [firstName, setFirstName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { refresh } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        getEngineers()
            .then(setEngineers)
            .catch(() => setError("Не удалось загрузить список инженеров"));
    }, []);

    const selectedEngineer = engineers.find((e) => e.id === selectedKey);

    const visibleEngineers =
        engineers.length > SEARCH_THRESHOLD && search
            ? engineers.filter((engineer) =>
                  formatEngineerName(engineer)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
              )
            : engineers;

    function selectEngineer(key: string) {
        setSelectedKey(key);
        setFirstName("");
        setPassword("");
        setConfirmPassword("");
        setError(null);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!selectedEngineer) return;

        if (!selectedEngineer.has_password) {
            if (!firstName.trim()) {
                setError("Укажите имя");
                return;
            }
            if (password !== confirmPassword) {
                setError("Пароли не совпадают");
                return;
            }
        }

        setSubmitting(true);
        setError(null);

        try {
            if (selectedEngineer.has_password) {
                await login(selectedEngineer.id, password);
            } else {
                await claimAccount(selectedEngineer.id, firstName, password);
            }
            await refresh();
            navigate("/", { replace: true });
        } catch {
            setError(
                selectedEngineer.has_password
                    ? "Неверный пароль"
                    : "Не удалось задать пароль",
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (!selectedEngineer) {
        return (
            <div className={styles.form}>
                <h2 className={styles.title}>Выберите инженера</h2>

                {error && <p className={styles.error}>{error}</p>}

                {engineers.length > SEARCH_THRESHOLD && (
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Поиск..."
                        autoFocus
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                )}

                <div className={styles.options}>
                    {visibleEngineers.map((engineer) => (
                        <button
                            key={engineer.id}
                            type="button"
                            className={styles.option}
                            onClick={() => selectEngineer(engineer.id)}
                        >
                            {formatEngineerName(engineer)}
                        </button>
                    ))}
                </div>

                <Link className={styles.link} to="/engineer/register">
                    Зарегистрироваться
                </Link>
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.title}>{formatEngineerName(selectedEngineer)}</h2>

            {!selectedEngineer.has_password && (
                <p className={styles.hint}>
                    Для этой учётной записи ещё не задан пароль — укажите имя
                    и придумайте пароль сейчас.
                </p>
            )}

            {error && <p className={styles.error}>{error}</p>}

            {!selectedEngineer.has_password && (
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Имя"
                    autoFocus
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
            )}

            <PasswordInput
                placeholder="Пароль"
                autoFocus={selectedEngineer.has_password}
                value={password}
                onChange={setPassword}
            />

            {!selectedEngineer.has_password && (
                <PasswordInput
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                />
            )}

            <button className={styles.submit} type="submit" disabled={submitting}>
                {submitting
                    ? "Подождите..."
                    : selectedEngineer.has_password
                        ? "Войти"
                        : "Придумать пароль и войти"}
            </button>

            <button
                className={styles.back}
                type="button"
                onClick={() => selectEngineer("")}
            >
                Назад к списку
            </button>
        </form>
    );
}
