import 'dotenv/config';
import { definePrismaConfig } from "prisma/config";
import { defineConfig as composer } from "@prisma/composer/config";
import { prismaCloud, prismaState } from "@prisma/composer-prisma-cloud/control";
import { nextjsBuild } from "@prisma/composer/nextjs/control";
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  composer: composer({
    entry: "./module.ts",
    extensions: [prismaCloud(), nextjsBuild()],
    state: prismaState(),
  }),
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env['DATABASE_URL'] || "postgresql://postgres:postgres@localhost:5432/sutrastudio",
    },
  }),
});
