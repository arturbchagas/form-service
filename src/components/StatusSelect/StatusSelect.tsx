"use client";

import { useEffect, useRef, useState } from "react";
import { OrderStatus } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { ORDER_STATUS_OPTIONS, getOrderStatusLabel } from "@/lib/orderStatus";
import styles from "./StatusSelect.module.css";

type StatusSelectProps = {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  "aria-label"?: string;
};

export default function StatusSelect({
  value,
  onChange,
  "aria-label": ariaLabel = "Alterar status da ordem de serviço",
}: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        data-status={value}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.triggerLabel}>{getOrderStatusLabel(value)}</span>
        <ChevronDown
          size={16}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>

      {open && (
        <ul className={styles.list} role="listbox" aria-label={ariaLabel}>
          {ORDER_STATUS_OPTIONS.map(({ value: optionValue, label }) => (
            <li key={optionValue} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={optionValue === value}
                className={styles.option}
                data-status={optionValue}
                data-selected={optionValue === value}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                <span className={styles.dot} aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
