"use server";

import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/session";

/*
 * Every admin action authorises itself: the page check doesn't protect an
 * action, which can be called directly with a POST.
 */
export async function refreshCatalogue() {
  await requireAdmin();
  updateTag("products");
}
