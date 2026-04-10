"use client"; // Precisa rodar no browser para usar hooks e responder a eventos do formulário

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  // Estados controlados: cada campo do formulário tem seu próprio estado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);   // Mensagem de erro visível ao usuário
  const [loading, setLoading] = useState(false);             // Desabilita o botão durante a requisição

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Impede o comportamento padrão do form (recarregar a página)
    setError(null);     // Limpa erro anterior a cada tentativa
    setLoading(true);

    // Chama o NextAuth com o provider "credentials" (e-mail + senha).
    // redirect: false impede o NextAuth de redirecionar automaticamente —
    // assim podemos tratar o erro aqui mesmo, mostrando a mensagem na tela.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    // Se houver erro (credenciais inválidas), mostra mensagem genérica
    // (nunca dizer "e-mail não existe" — isso facilitaria ataques de enumeração)
    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    // Login bem-sucedido: vai para a home e atualiza a sessão no cliente
    router.push("/");
    router.refresh();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>PHC</h1>
        <p className={styles.subtitle}>Acesse sua conta para continuar</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              E-mail
            </label>
            {/* autoComplete="email" ajuda o browser a sugerir e-mails salvos */}
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            {/* autoComplete="current-password" permite que gerenciadores de senha preencham */}
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Renderiza a mensagem de erro apenas se existir */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Botão desabilitado durante o carregamento para evitar cliques duplos */}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
