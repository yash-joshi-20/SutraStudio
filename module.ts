import { module } from "@prisma/composer";
import web from "./service";

export default module("sutrastudio", ({ provision }) => {
  provision(web);
});
