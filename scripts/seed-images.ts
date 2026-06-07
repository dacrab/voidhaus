import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { IMAGES } from "../src/lib/data/images.js";

async function main() {
  const url = process.env.CONVEX_URL;
  if (!url) {
    console.error("CONVEX_URL env var required");
    process.exit(1);
  }
  const client = new ConvexHttpClient(url);
  const entries = Object.entries(IMAGES).map(([key, url]) => ({ key, url }));
  const result = await client.mutation(api.images.seed, { images: entries });
  console.log(result);
}

main().catch(console.error);
