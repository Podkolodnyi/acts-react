import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteAct, getAct } from "../api/acts";
import { ApiError } from "../api/client";
import { ActDocument } from "../components/ActDocument";
import { ActStateBadge } from "../components/ActStateBadge";
import { extractErrorMessage } from "../utils/apiError";
import type { ActDetail } from "../api/types";
import styles from "./ActDetailsPage.module.css";

export function ActDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [act, setAct] = useState<ActDetail | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        let ignore = false;

        getAct(Number(id))
            .then((data) => {
                if (!ignore) {
                    setAct(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (ignore) return;
                if (err instanceof ApiError && err.status === 404) {
                    setNotFound(true);
                }
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    if (loading) {
        return <p className={styles.empty}>Загрузка...</p>;
    }

    if (notFound || !act) {
        return (
            <div className={styles.page}>
                <p className={styles.empty}>Акт не найден.</p>
                <Link className={styles.back} to="/acts">
                    ← К списку актов
                </Link>
            </div>
        );
    }

    const isThermo = act.number_type === "thermo";
    const listPath = act.is_deleted
        ? "/admin/deleted-acts"
        : isThermo
          ? "/acts?type=thermo"
          : "/acts";

    async function handleDelete() {
        if (!act) return;
        const confirmed = window.confirm(
            `Удалить акт ${act.act_number}? Он будет перенесён в удалённые, ` +
                "а его номер освободится.",
        );
        if (!confirmed) return;

        setDeleting(true);
        setError(null);
        try {
            await deleteAct(act.id);
            navigate(isThermo ? "/acts?type=thermo" : "/acts");
        } catch (err) {
            setError(extractErrorMessage(err, "Не удалось удалить акт"));
            setDeleting(false);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link className={styles.back} to={listPath}>
                    ← {act.is_deleted ? "К удалённым актам" : "К списку актов"}
                </Link>

                <div className={styles.actions}>
                    {act.can_repair && (
                        <Link
                            className={styles.primaryButton}
                            to={`/acts/${act.id}/repair`}
                        >
                            Отремонтирован
                        </Link>
                    )}
                    {act.can_edit && (
                        <Link
                            className={styles.secondaryButton}
                            to={`/acts/${act.id}/edit`}
                        >
                            Редактировать
                        </Link>
                    )}
                    {!act.is_deleted && <ActStateBadge state={act.state} />}
                </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {act.is_deleted && (
                <p className={styles.deletedNote}>
                    Акт удалён {act.deleted_at.slice(0, 10)}
                    {act.deleted_by_name && ` (${act.deleted_by_name})`}.
                    Прежний номер: <strong>{act.original_act_number || "—"}</strong>
                </p>
            )}

            {act.repaired_by && (
                <p className={styles.linkNote}>
                    Отремонтирован →{" "}
                    <Link to={`/acts/${act.repaired_by.id}`}>
                        акт {act.repaired_by.act_number}
                    </Link>
                </p>
            )}
            {act.repair_of && (
                <p className={styles.linkNote}>
                    Ремонт по акту{" "}
                    <Link to={`/acts/${act.repair_of.id}`}>
                        {act.repair_of.act_number}
                    </Link>
                </p>
            )}

            <ActDocument act={act} />

            {act.can_delete && (
                <div className={styles.bottomActions}>
                    <button
                        className={styles.dangerButton}
                        type="button"
                        disabled={deleting}
                        onClick={handleDelete}
                    >
                        {deleting ? "Удаление..." : "Удалить акт"}
                    </button>
                </div>
            )}
        </div>
    );
}
