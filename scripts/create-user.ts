/**
 * Script para criar um usuário no banco de dados.
 * Uso: npm run create-user -- --name "Nome" --email "email@exemplo.com" --password "senha123"
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Erro: DATABASE_URL não está definida no .env");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const name = getArg("--name");
  const email = getArg("--email");
  const password = getArg("--password");

  if (!name || !email || !password) {
    console.error(
      "Uso: npm run create-user -- --name \"Nome\" --email \"email@exemplo.com\" --password \"senha\""
    );
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Erro: já existe um usuário com o e-mail "${email}".`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  console.log(`Usuário criado com sucesso!`);
  console.log(`  ID:    ${user.id}`);
  console.log(`  Nome:  ${user.name}`);
  console.log(`  Email: ${user.email}`);
}

main()
  .catch((err) => {
    console.error("Erro ao criar usuário:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
