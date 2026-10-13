import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export type Picture = {
  src: string;
  alt: string;
};

export const productBadge = pgEnum("product_badge", ["New", "Exclusive"]);

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    slug: text().notNull().unique(),
    name: text().notNull(),
    color: text().notNull(),
    /* USD cents. */
    priceCents: integer("price_cents").notNull(),
    badge: productBadge(),
    description: text().notNull(),
    details: text().array().notNull().default(sql`'{}'::text[]`),
    composition: text().notNull(),
    /* The first image is the listing image. */
    images: jsonb().$type<Picture[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_cents_check", sql`${t.priceCents} >= 0`),
  ],
);

/*
 * Stock per size. One-size items have a single "One size" row. This is not
 * a variant system: size is only a label, with no SKU or price of its own.
 */
export const productStock = pgTable(
  "product_stock",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text().notNull(),
    quantity: integer().notNull().default(0),
    /* Display order of sizes (XS→XL, 36→41). */
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    unique("product_stock_product_id_size_unique").on(t.productId, t.size),
    check("product_stock_quantity_check", sql`${t.quantity} >= 0`),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stock: many(productStock),
}));

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, {
    fields: [productStock.productId],
    references: [products.id],
  }),
}));

export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type ProductStockRow = typeof productStock.$inferSelect;
