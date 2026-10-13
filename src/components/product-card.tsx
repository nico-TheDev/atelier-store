import Image from "next/image";
import Link from "next/link";
import { formatPrice, getStockState, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const [image] = product.images;
  const soldOut = getStockState(product).status === "sold-out";
  const badge = soldOut ? "Sold out" : product.badge;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="media aspect-product">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw"
          className="object-cover transition-transform duration-(--duration-slow) ease-luxe group-hover:scale-103"
        />
        {badge && <span className="badge absolute top-3 left-3">{badge}</span>}
      </div>
      <div className="mt-3 px-2 text-center">
        <h3 className="type-product">
          <span className="link-quiet">{product.name}</span>
        </h3>
        <p className="type-caption">{product.color}</p>
        <p className="type-price mt-1">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
