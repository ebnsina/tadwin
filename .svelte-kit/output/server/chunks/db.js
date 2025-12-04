import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
const config = {
  "previewFeatures": [],
  "clientVersion": "7.1.0",
  "engineVersion": "ab635e6b9d606fa5c8fb8b1a7f909c3c3c1c98ba",
  "activeProvider": "sqlite",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "sqlite"\n}\n\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  password  String\n  name      String?\n  plan      String   @default("free") // free, pro, team\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  sessions   Session[]\n  workspaces Workspace[]\n}\n\nmodel Session {\n  id         String   @id @default(cuid())\n  userId     String\n  token      String   @unique\n  expiresAt  DateTime\n  rememberMe Boolean  @default(false)\n  createdAt  DateTime @default(now())\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([token])\n}\n\nmodel Workspace {\n  id        String   @id @default(cuid())\n  name      String\n  userId    String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)\n  categories Category[]\n  notes      Note[]\n\n  @@index([userId])\n}\n\nmodel Category {\n  id          String   @id @default(cuid())\n  name        String\n  color       String?\n  workspaceId String\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)\n  notes     Note[]\n\n  @@index([workspaceId])\n}\n\nmodel Note {\n  id           String   @id @default(cuid())\n  title        String\n  content      String\n  workspaceId  String\n  categoryId   String?\n  isPinned     Boolean  @default(false)\n  isArchived   Boolean  @default(false)\n  isTrashed    Boolean  @default(false)\n  lastModified DateTime @default(now())\n  clientRev    Int      @default(0)\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)\n  category  Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)\n\n  @@index([workspaceId])\n  @@index([categoryId])\n  @@index([isTrashed])\n  @@index([isArchived])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"plan","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"workspaces","kind":"object","type":"Workspace","relationName":"UserToWorkspace"}],"dbName":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"rememberMe","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":null},"Workspace":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToWorkspace"},{"name":"categories","kind":"object","type":"Category","relationName":"CategoryToWorkspace"},{"name":"notes","kind":"object","type":"Note","relationName":"NoteToWorkspace"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"color","kind":"scalar","type":"String"},{"name":"workspaceId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"workspace","kind":"object","type":"Workspace","relationName":"CategoryToWorkspace"},{"name":"notes","kind":"object","type":"Note","relationName":"CategoryToNote"}],"dbName":null},"Note":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"workspaceId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"isPinned","kind":"scalar","type":"Boolean"},{"name":"isArchived","kind":"scalar","type":"Boolean"},{"name":"isTrashed","kind":"scalar","type":"Boolean"},{"name":"lastModified","kind":"scalar","type":"DateTime"},{"name":"clientRev","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"workspace","kind":"object","type":"Workspace","relationName":"NoteToWorkspace"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToNote"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.sqlite.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.sqlite.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}
runtime.Extensions.getExtensionContext;
({
  DbNull: runtime.NullTypes.DbNull,
  JsonNull: runtime.NullTypes.JsonNull,
  AnyNull: runtime.NullTypes.AnyNull
});
runtime.makeStrictEnum({
  Serializable: "Serializable"
});
runtime.Extensions.defineExtension;
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass();
const globalForPrisma = globalThis;
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const db = globalForPrisma.prisma ?? new PrismaClient({
  adapter
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
export {
  db as d
};
