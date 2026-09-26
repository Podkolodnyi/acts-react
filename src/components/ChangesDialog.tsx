import type { ActChange } from "../utils/actChanges";
import styles from "./ChangesDialog.module.css";

interface ChangesDialogProps {
    changes: ActChange[];
    saving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

// Окно «Проверьте изменения» перед сохранением отредактированного акта.
export function ChangesDialog({
    changes,
    saving,
    onConfirm,
    onCancel,
}: ChangesDialogProps) {
    const empty = changes.length === 0;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true">
            <div className={styles.dialog}>
                <h3 className={styles.title}>
                    {empty ? "Изменений нет" : "Проверьте изменения"}
                </h3>

                {empty ? (
                    <p className={styles.hint}>
                        Вы ничего не поменяли — сохранять нечего.
                    </p>
                ) : (
                    <ul className={styles.list}>
                        {changes.map((change, index) => (
                            <li key={index} className={styles.item}>
                                <span className={styles.label}>{change.label}</span>
                                <span className={styles.values}>
                                    {change.before && (
                                        <span className={styles.before}>{change.before}</span>
                                    )}
                                    {change.before && change.after && (
                                        <span className={styles.arrow}>→</span>
                                    )}
                                    {change.after && (
                                        <span className={styles.after}>{change.after}</span>
                                    )}
                                    {!change.before && !change.after && "—"}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className={styles.actions}>
                    {!empty && (
                        <button
                            className={styles.primaryButton}
                            type="button"
                            disabled={saving}
                            onClick={onConfirm}
                        >
                            {saving ? "Сохранение..." : "Всё верно, сохранить"}
                        </button>
                    )}
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        disabled={saving}
                        onClick={onCancel}
                    >
                        {empty ? "Закрыть" : "Вернуться к редактированию"}
                    </button>
                </div>
            </div>
        </div>
    );
}
