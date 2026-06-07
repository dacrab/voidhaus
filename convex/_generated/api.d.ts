/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as coupons from "../coupons.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as images from "../images.js";
import type * as messages from "../messages.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as stockists from "../stockists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  coupons: typeof coupons;
  emails: typeof emails;
  files: typeof files;
  images: typeof images;
  messages: typeof messages;
  orders: typeof orders;
  products: typeof products;
  seed: typeof seed;
  stockists: typeof stockists;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
