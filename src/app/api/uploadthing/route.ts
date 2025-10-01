import { createRouteHandler } from "uploadthing/next";

import { onFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: onFileRouter,
});