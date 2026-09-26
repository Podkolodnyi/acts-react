import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getActVersion, restoreActVersion } from "../api/admin";
import { ActDocument } from "../components/ActDocument";
import { Notice, type NoticeData } from "../components/Notice";
import { extractErrorMessage, extractRepairedBy } from "../utils/apiError";
import type { ActVersionDetail } from "../api/types";
import styles from "./ActDetailsPage.module.css";

// Просмотр сохранённой версии акта (только для админа).
export function AdminActVersionPage() {
    const { id } = useParams<{ id: string }>();
    const [version, setVersion] = useState<ActVersionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState<NoticeData | null>(null);
    const [restoring, setRestoring] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        let ignore = false;

        getActVersion(Number(id))
            .then((data) => {
                if (!ignore) setVersion(data);
            })
            .catch(() => {})
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    async function handleRestore() {
        if (!version) return;
        const confirmed = window.confirm(
            version.act_deleted
                ? `Акт удалён. Восстановить его с новым номером и заменить ` +
                      `содержимое версией ${version.version_number}? ` +
                      "Все версии этого акта будут удалены."
                : `Заменить текущее содержимое акта ${version.current_act_number} ` +
                      `версией ${version.version_number}? Текущее содержимое ` +
                      "не сохранится, все версии этого акта будут удалены.",
        );
        if (!confirmed) return;

        setRestoring(true);
        setNotice(null);
        try {
            const act = await restoreActVersion(version.id);
            navigate(`/acts/${act.id}`);
        } catch (err) {
            const repairedBy = extractRepairedBy(err);
            setNotice({
                kind: "error",
                text: extractErrorMessage(err, "Не удалось восстановить версию"),
                link: repairedBy
                    ? { to: `/acts/${repairedBy.id}`, label: `→ ${repairedBy.act_number}` }
                    : undefined,
            });
            setRestoring(false);
        }
    }

    if (loading) {
        return <p className={styles.empty}>Загрузка...</p>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link className={styles.back} to="/admin/act-versions">
                    ← К версиям актов
                </Link>

                {version && (
                    <button
                        className={styles.dangerButton}
                        type="button"
                        disabled={restoring}
                        onClick={handleRestore}
                    >
                        {restoring
                            ? "Восстановление..."
                            : version.act_deleted
                              ? "Восстановить акт и заменить этой версией"
                              : "Восстановить эту версию"}
                    </button>
                )}
            </div>

            {notice && <Notice notice={notice} />}

            {!version ? (
                <p className={styles.empty}>Версия не найдена.</p>
            ) : (
                <>
                    {version.act_deleted && (
                        <Notice
                            notice={{
                                kind: "warning",
                                text:
                                    "Акт удалён. При восстановлении этой версии он " +
                                    "вернётся из удалённых с новым номером.",
                            }}
                        />
                    )}
                    <p className={styles.deletedNote}>
                        Версия <strong>{version.version_number}</strong> — так акт
                        выглядел до изменения{" "}
                        {version.created_at.slice(0, 16).replace("T", " ")}
                        {version.created_by_name && ` (${version.created_by_name})`}.
                        Текущий акт:{" "}
                        <Link to={`/acts/${version.act_id}`}>
                            {version.current_act_number}
                        </Link>
                        {version.act_deleted && " (удалён)"}
                    </p>

                    <ActDocument act={version.act} />
                </>
            )}
        </div>
    );
}
