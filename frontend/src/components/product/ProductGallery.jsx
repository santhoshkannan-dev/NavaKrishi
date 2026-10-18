import { useEffect, useMemo, useState } from "react";

const thumbnails = [
  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",

  "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",

  "https://images.unsplash.com/photo-1518977676601-b53f82aba655",

  "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c",
];

const ProductGallery = ({ product }) => {

  const productImages = useMemo(() => {
    const apiImages = (product?.images || []).map((item) => item.image).filter(Boolean);
    const merged = product?.image ? [product.image, ...apiImages] : apiImages;
    const unique = [...new Set(merged)];
    return unique.length ? unique : thumbnails;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(productImages[0]);

  useEffect(() => {
    setSelectedImage(productImages[0]);
  }, [productImages]);

  return (
    <div className="space-y-6">

      {/* Main Image */}
      <div className="h-[500px] lg:h-[620px] rounded-3xl overflow-hidden border border-gray-200 shadow-sm">

        <img
          src={selectedImage}
          alt=""
          className="w-full h-full object-cover hover:scale-105 transition duration-700"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">

        {productImages.map((image, index) => (
          <div
            key={index}
            onClick={() =>
              setSelectedImage(image)
            }
            className={`aspect-square rounded-2xl overflow-hidden cursor-pointer border transition-all ${
              selectedImage === image
                ? "border-2 border-[#1f6d1a]"
                : "border-gray-200 hover:border-[#1f6d1a]"
            }`}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;