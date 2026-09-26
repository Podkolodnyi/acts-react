import { Link } from "react-router";
import styles from "./Notice.module.css";

export interface NoticeData {
    kind: "success" | "error" | "warning";
    text: string;
    link?: { to: string; label: string };
}

// Сообщение с необязательной ссылкой, например «…уже отремонтирован → акт X».
export function Notice({ notice }: { notice: NoticeData }) {
    return (
        <p className={`${styles.notice} ${styles[notice.kind]}`}>
            {notice.text}
            {notice.link && (
                <>
                    {" "}
                    <Link className={styles.link} to={notice.link.to}>
                        {notice.link.label}
                    </Link>
                </>
            )}
        </p>
    );
}
