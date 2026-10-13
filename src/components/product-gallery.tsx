import Image from "next/image";
import type { Picture } from "@/lib/catalog";

/*
 * Swipeable, snapping strip on small screens (the next image peeks in);
 * a two-up grid from lg, where an odd first image spans both columns.
 */
export function ProductGallery({ images }: { images: Picture[] }) {
  const multiple = images.length > 1;
  const spanFirst = images.length % 2 === 1;

  return (
    <div
      role="region"
      aria-label="Product images"
      tabIndex={multiple ? 0 : undefined}
      className="flex snap-x snap-mandatory gap-grid-x overflow-x-auto [scrollbar-width:none] lg:grid lg:grid-cols-2 lg:overflow-visible"
    >
      {images.map((image, i) => (
        <div
          key={image.src}
          className={[
            "media aspect-product shrink-0 snap-start lg:w-auto",
            multiple ? "w-[88%] md:w-[60%]" : "w-full",
            i === 0 && spanFirst ? "lg:col-span-2" : "",
          ].join(" ")}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading={i === 0 ? "eager" : "lazy"}
            sizes={
              i === 0 && spanFirst
                ? "(min-width: 64rem) 60vw, 88vw"
                : "(min-width: 64rem) 30vw, 88vw"
            }
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
