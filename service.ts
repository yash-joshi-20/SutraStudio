import { compute } from "@prisma/composer-prisma-cloud";
import nextjsBuild from "@prisma/composer/nextjs";

export default compute({
  name: "web",
  deps: {},
  build: nextjsBuild({
    module: import.meta.url,
    appDir: ".",
  }),
});
