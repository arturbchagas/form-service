"use client";

import { useSession, signOut } from "next-auth/react";
import styles from "./Header.module.css";

export default function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header className={styles.header}>
      <span className={styles.user}>{session.user?.name ?? session.user?.email}</span>
      <button
        className={styles.logout}
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sair
      </button>
    </header>
  );
}
