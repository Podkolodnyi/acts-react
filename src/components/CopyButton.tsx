import { useState } from "react";
import styles from "./CopyButton.module.css";

// Старый способ через временное текстовое поле: работает и на обычном
// http://, где navigator.clipboard недоступен.
function copyWithTextarea(text: string): void {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (!ok) throw new Error("copy failed");
}

// navigator.clipboard есть только на HTTPS и localhost и может отказать
// (например, если окно не в фокусе) — тогда пробуем старый способ.
async function copyText(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // падаем на запасной способ ниже
        }
    }
    copyWithTextarea(text);
}

interface CopyButtonProps {
    text: string;
    className?: string;
}

// Маленький значок «копировать»; после клика на секунду показывает галочку.
export function CopyButton({ text, className = "" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleClick() {
        try {
            await copyText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // Браузер запретил доступ к буферу — ничего не делаем.
        }
    }

    return (
        <button
            className={`${styles.button} ${copied ? styles.copied : ""} ${className}`}
            type="button"
            title={copied ? "Скопировано" : "Копировать"}
            aria-label={copied ? "Скопировано" : `Копировать ${text}`}
            onClick={handleClick}
        >
            {copied ? (
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            )}
        </button>
    );
}
