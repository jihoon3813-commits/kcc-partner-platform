/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admins from "../admins.js";
import type * as contracts from "../contracts.js";
import type * as customers from "../customers.js";
import type * as estimates from "../estimates.js";
import type * as init from "../init.js";
import type * as installmentApplications from "../installmentApplications.js";
import type * as notices from "../notices.js";
import type * as partners from "../partners.js";
import type * as products from "../products.js";
import type * as rentalApplications from "../rentalApplications.js";
import type * as resources from "../resources.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  contracts: typeof contracts;
  customers: typeof customers;
  estimates: typeof estimates;
  init: typeof init;
  installmentApplications: typeof installmentApplications;
  notices: typeof notices;
  partners: typeof partners;
  products: typeof products;
  rentalApplications: typeof rentalApplications;
  resources: typeof resources;
  settings: typeof settings;
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
