import type { Material } from "../api/types";
import styles from "./MaterialsEditor.module.css";

// Новая строка сразу получает количество 1.
const EMPTY_MATERIAL: Material = { name: "", article: "", quantity: "1" };

// Допустимое количество: от 1 до 10 (сервер проверяет то же самое).
const QUANTITIES = Array.from({ length: 10 }, (_, i) => String(i + 1));

interface MaterialsEditorProps {
    items: Material[];
    onChange: (items: Material[]) => void;
}

// Таблица ЗИП: строки «Наименование / Артикул / Кол-во».
// Строки без наименования и артикула сервер при сохранении отбрасывает.
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
                                    <select
                                        className={styles.input}
                                        value={item.quantity}
                                        onChange={(event) =>
                                            updateItem(index, "quantity", event.target.value)
                                        }
                                    >
                                        {QUANTITIES.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
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
