"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import styles from "./Header.module.css";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Principal">
        <Link
          href="/"
          className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
        >
          Ordens de serviço
        </Link>
        <Link
          href="/clientes"
          className={`${styles.navLink} ${pathname.startsWith("/clientes") ? styles.navLinkActive : ""}`}
        >
          Clientes
        </Link>
      </nav>
      <div className={styles.actions}>
        <span className={styles.user}>{session.user?.name ?? session.user?.email}</span>
        <button
          className={styles.logout}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
