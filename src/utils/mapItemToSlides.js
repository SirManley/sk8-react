// src/utils/mapItemToSlides.js
export function mapItemToSlides(item) {
  const images = Array.isArray(item?.images) ? item.images : [];

  if (images.length) {
    // Copy so we can safely set a description on slide 1 if not provided
    const slides = images.map((img, idx) => ({
      src: img.src,
      alt: img.alt ?? item?.name ?? "",
      width: img.width,
      height: img.height,
      title: img.title ?? (idx === 0 ? item?.name : undefined),
      description:
        img.description ??
        (idx === 0 ? item?.description : undefined),
    }));
    return slides;
  }

  // Back-compat (legacy single image field names)
  const legacy = item?.fullImageUrl || item?.imageUrl;
  if (legacy) {
    return [
      {
        src: legacy,
        alt: item?.name ?? "",
        title: item?.name,
        description: item?.description,
      },
    ];
  }

  return [];
}

