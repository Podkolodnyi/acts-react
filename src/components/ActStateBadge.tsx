import type { ActState } from "../api/types";
import styles from "./ActStateBadge.module.css";

const STATE_LABELS: Record<ActState, string> = {
    working: "Работает",
    broken: "Не работает",
    repaired: "Отремонтирован",
};

interface ActStateBadgeProps {
    state: ActState | null;
}

export function ActStateBadge({ state }: ActStateBadgeProps) {
    // У актов термозакрепления состояния нет — бейдж не рисуем.
    if (!state) return null;

    return (
        <span className={`${styles.badge} ${styles[state]}`}>
            {STATE_LABELS[state]}
        </span>
    );
}
