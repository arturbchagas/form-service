# Deploy — form-service (Vercel + Neon + domínio)

Guia para publicar o sistema online **sem perder os dados** que já estão no banco PostgreSQL.

---

## Já está na Vercel (plano Free)?

Se o projeto **já está deployado** na Vercel no plano gratuito, você **não precisa** de plano pago só para:

- Manter os dados do banco (ficam no **Neon**, não na Vercel)
- Usar um **domínio próprio** (ex.: `minhaoficina.com.br`) — o plano Free permite domínio customizado
- Continuar usando a URL `*.vercel.app`

**O que falta fazer, na prática:**

1. Comprar o domínio (Registro.br, Hostinger, etc.)
2. Vercel → projeto → **Settings** → **Domains** → adicionar o domínio
3. Configurar DNS no registrador (a Vercel mostra os registros)
4. Atualizar `NEXTAUTH_URL` para `https://seudominio.com.br` e fazer **Redeploy**
5. Confirmar que `DATABASE_URL` na Vercel é a **mesma** do Neon onde estão seus dados

Os dados **só se perdem** se você trocar a `DATABASE_URL` por um banco novo/vazio. Domínio e plano Free **não apagam** o banco.

Pule para [Passo 5 — Comprar e configurar o domínio](#passo-5--comprar-e-configurar-o-domínio) se o deploy já funciona.

---

## Visão geral

| Peça | Função | Onde contratar |
|------|--------|----------------|
| **App** (Next.js) | Site que você acessa no navegador | [Vercel](https://vercel.com) (plano gratuito disponível) |
| **Banco** (PostgreSQL) | Clientes, ordens de serviço, fotos, áudios, usuários | [Neon](https://neon.tech) (provavelmente o que você já usa) |
| **Domínio** | Endereço tipo `minhaempresa.com.br` | [Registro.br](https://registro.br), Hostinger, GoDaddy, etc. |

O **domínio** e a **hospedagem do app** são separados do **banco de dados**. Para manter tudo que já cadastrou, use **a mesma `DATABASE_URL`** que você usa hoje no `.env` local.

---

## Pré-requisitos

- Conta no [GitHub](https://github.com) com este repositório
- Conta no [Neon](https://neon.tech) (banco já existente com seus dados)
- Conta na [Vercel](https://vercel.com)
- Node.js 20+ instalado localmente (para testes)

---

## Passo 1 — Anotar as variáveis do ambiente local

No seu computador, abra o arquivo `.env` (não commite esse arquivo).

Você precisa destes valores para a produção:

| Variável | O que é |
|----------|---------|
| `DATABASE_URL` | Connection string do PostgreSQL (Neon) |
| `POSTGRES_PRISMA_URL` | (Opcional) URL pooled do Neon; se existir no `.env`, use também |
| `NEXTAUTH_SECRET` | Segredo para sessões de login |
| `NEXTAUTH_URL` | URL pública do site em produção (ex.: `https://seudominio.com.br`) |

**Importante:** copie a `DATABASE_URL` **do banco atual** — não crie um banco novo na Vercel/Neon se quiser manter clientes e ordens de serviço.

---

## Passo 2 — Subir o código para o GitHub

Se ainda não estiver no GitHub:

```bash
git add .
git commit -m "Preparar deploy"
git push origin main
```

(Ajuste o nome da branch se for `master` ou outro.)

---

## Passo 3 — Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. **Import** do repositório GitHub `form-service`
3. Framework: **Next.js** (detectado automaticamente)
4. Em **Environment Variables**, adicione:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `DATABASE_URL` | *(cole do seu `.env` local)* | Production, Preview, Development |
   | `NEXTAUTH_SECRET` | *(mesmo valor do `.env` ou gere um novo)* | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://seu-projeto.vercel.app` *(temporário; troque pelo domínio depois)* | Production |

   Se você tiver `POSTGRES_PRISMA_URL` no `.env`, adicione também.

5. Clique em **Deploy**

O build roda automaticamente:

- `prisma generate` (postinstall)
- `prisma migrate deploy` (aplica migrations no banco)
- `next build`

Quando terminar, você terá uma URL tipo `https://form-service-xxx.vercel.app`.

---

## Passo 4 — Testar antes do domínio

1. Abra a URL da Vercel no navegador
2. Faça login com o **mesmo e-mail e senha** que usa localmente
3. Confira se clientes e ordens de serviço aparecem

Se os dados sumirem, quase sempre é porque a `DATABASE_URL` na Vercel aponta para **outro banco** (vazio). Corrija em **Project → Settings → Environment Variables** e faça **Redeploy**.

---

## Passo 5 — Comprar e configurar o domínio

### 5.1 Registrar o domínio

Compre em Registro.br, Hostinger, GoDaddy, etc. (ex.: `minhaoficina.com.br`).

### 5.2 Adicionar na Vercel

1. Vercel → seu projeto → **Settings** → **Domains**
2. Adicione o domínio (ex.: `minhaoficina.com.br` e opcionalmente `www.minhaoficina.com.br`)
3. A Vercel mostra os registros DNS necessários

### 5.3 Apontar o DNS

No painel onde comprou o domínio, configure conforme a Vercel indicar. Exemplos comuns:

**Opção A — usar nameservers da Vercel (mais simples)**

- Troque os nameservers do domínio pelos que a Vercel fornece

**Opção B — manter DNS no registrador**

- Registro **A** apontando para o IP da Vercel, ou
- Registro **CNAME** `www` → `cname.vercel-dns.com`

A propagação pode levar de alguns minutos até 48 horas.

### 5.4 Atualizar NEXTAUTH_URL

1. Vercel → **Settings** → **Environment Variables**
2. Altere `NEXTAUTH_URL` para `https://minhaoficina.com.br` (com `https://`, sem barra no final)
3. **Deployments** → último deploy → **⋯** → **Redeploy**

Sem isso, o login pode falhar em produção.

---

## Passo 6 — Criar usuário (só se o banco for novo)

Se você **não** reutilizou o banco antigo e começou do zero, crie o primeiro usuário **no seu PC** (com o `.env` apontando para o banco de produção):

```bash
npm run create-user -- --name "Seu Nome" --email "voce@email.com" --password "sua-senha-forte"
```

---

## Manutenção

### Novo deploy após alterações no código

```bash
git push origin main
```

A Vercel redeploya automaticamente se o repositório estiver conectado.

### Alterações no banco (novas migrations)

1. Desenvolva localmente: `npx prisma migrate dev --name descricao`
2. Commit das pastas em `prisma/migrations/`
3. Push — o `prisma migrate deploy` no build aplica na produção

### Backup do banco

No painel Neon: **Branches** / **Backups** ou export via `pg_dump`. Recomendado antes de mudanças grandes.

---

## Checklist rápido

- [ ] `DATABASE_URL` na Vercel = **mesmo banco** que você usa localmente
- [ ] `NEXTAUTH_SECRET` definido
- [ ] `NEXTAUTH_URL` = URL final com `https://`
- [ ] Login testado na URL da Vercel
- [ ] Dados (clientes/ordens) visíveis após deploy
- [ ] Domínio adicionado na Vercel e DNS configurado
- [ ] `NEXTAUTH_URL` atualizado para o domínio final + redeploy

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| App sobe vazia | `DATABASE_URL` errada ou banco novo — use a connection string do Neon com dados |
| Erro de login em produção | Confira `NEXTAUTH_URL` e `NEXTAUTH_SECRET` |
| Erro de conexão com banco | Neon exige `?sslmode=require` na URL; use a string “Prisma” do painel Neon |
| Build falha no Prisma | Verifique se `DATABASE_URL` está nas env vars da Vercel **antes** do build |
| Fotos/áudios não aparecem | Estão no PostgreSQL; se o resto aparece, o banco está correto |

---

## Custos estimados (referência)

- **Vercel:** gratuito para projetos pessoais/pequenos
- **Neon:** plano gratuito com limites; suficiente para começar
- **Domínio `.com.br`:** ~R$ 40/ano (Registro.br)

Não é necessário contratar “hospedagem PHP/cPanel” tradicional — este projeto roda na Vercel + Neon.

---

## Plano Free da Vercel — o que importa para você

| Recurso | Plano Free |
|---------|------------|
| Domínio customizado | Sim |
| HTTPS automático | Sim |
| Deploy via GitHub | Sim |
| Dados no Neon | Independente da Vercel; não some ao mudar domínio |
| Uso comercial intensivo | Plano Free é para uso pessoal/hobby; negócio grande pode exigir Pro |

**Limites do Free** (geralmente suficientes para uma oficina/serviço pequeno):

- Builds e bandwidth com limites mensais (raro estourar no início)
- Funções serverless com timeout (uploads muito grandes podem falhar — seu app aceita até ~120 MB por request)
- Sem suporte prioritário

**Quando considerar plano pago:** tráfego alto, vários usuários simultâneos, ou requisitos comerciais da Vercel para empresas.

