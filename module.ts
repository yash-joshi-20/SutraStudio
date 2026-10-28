import { module } from "@prisma/composer";
import { compute } from "@prisma/composer-prisma-cloud";
import nextjsBuild from "@prisma/composer/nextjs";

export const web = compute({
  name: "web",
  deps: {},
  build: nextjsBuild({
    module: import.meta.url,
    appDir: ".",
  }),
});

export default module("sutra-studio", ({ provision }) => {
  provision(web);
});
