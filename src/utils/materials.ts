export interface MaterialItem {
  name: string;
  article: string;
  quantity: string;
}

const PREFIXES: [string, keyof MaterialItem][] = [
  ["Наименование:", "name"],
  ["Парт:", "article"],
  ["Артикул:", "article"],
  ["Кол-во:", "quantity"],
];

export function parseMaterials(text: string): MaterialItem[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const item: MaterialItem = { name: "", article: "", quantity: "" };

      for (const chunk of line.split(";")) {
        const part = chunk.trim();
        const prefix = PREFIXES.find(([key]) => part.startsWith(key));
        if (prefix) {
          const [key, field] = prefix;
          item[field] = part.slice(key.length).trim();
        }
      }

      return item;
    });
}
