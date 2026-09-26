import type { Material } from "../api/types";
import styles from "./MaterialsEditor.module.css";

const EMPTY_MATERIAL: Material = { name: "", article: "", quantity: "" };

interface MaterialsEditorProps {
    items: Material[];
    onChange: (items: Material[]) => void;
}

// Таблица ЗИП: строки «Наименование / Артикул / Кол-во».
// Пустые строки сервер при сохранении отбрасывает сам.
export function MaterialsEditor({ items, onChange }: MaterialsEditorProps) {
    function updateItem(index: number, field: keyof Material, value: string) {
        onChange(
            items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
    }

    function removeItem(index: number) {
        onChange(items.filter((_, i) => i !== index));
    }

    function addItem() {
        onChange([...items, EMPTY_MATERIAL]);
    }

    return (
        <div>
            {items.length > 0 && (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Наименование</th>
                            <th className={styles.articleColumn}>Артикул</th>
                            <th className={styles.quantityColumn}>Кол-во</th>
                            <th className={styles.removeColumn}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        className={styles.input}
                                        value={item.name}
                                        onChange={(event) =>
                                            updateItem(index, "name", event.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className={styles.input}
                                        value={item.article}
                                        onChange={(event) =>
                                            updateItem(index, "article", event.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className={styles.input}
                                        value={item.quantity}
                                        onChange={(event) =>
                                            updateItem(index, "quantity", event.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        className={styles.removeButton}
                                        type="button"
                                        title="Удалить строку"
                                        onClick={() => removeItem(index)}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button className={styles.addButton} type="button" onClick={addItem}>
                + Добавить строку
            </button>
        </div>
    );
}
