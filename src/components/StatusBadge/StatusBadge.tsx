import { OrderStatus } from "@prisma/client";
import { getOrderStatusLabel, ORDER_STATUS_PENDING } from "@/lib/orderStatus";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const sizeClass = styles[size];
  const combinedClass = [styles.badge, sizeClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={combinedClass}
      data-status={status}
      data-pulse={ORDER_STATUS_PENDING.has(status) ? "true" : "false"}
      title={getOrderStatusLabel(status)}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{getOrderStatusLabel(status)}</span>
    </span>
  );
}
