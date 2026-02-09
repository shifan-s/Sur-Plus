import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resolveImage } from "../utils/image";

const API = "http://localhost:5000/api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/products/${id}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setProduct(null);
          return;
        }

        setProduct(data);
        setSelectedColorIndex(0);
        setSelectedSize(data?.sizes?.[0] || "");
        setSelectedImageIndex(0);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const currentVariant = useMemo(() => {
    return product?.variants?.[selectedColorIndex] || product?.variants?.[0] || null;
  }, [product, selectedColorIndex]);

  const images = currentVariant?.images || [];

  // ✅ main image based on selected thumbnail
  const mainImage = resolveImage(images[selectedImageIndex] || images[0] || "");

  // ✅ reset main image when color changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColorIndex]);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const size = selectedSize || product?.sizes?.[0] || "";
    const color = currentVariant?.color || "";
    const image = images[0] || ""; // store filename (or url)

    // ✅ stable unique id for cart operations
    const cartId = `${product._id}_${size}_${color}`;

    const item = {
      cartId,
      _id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      size,
      color,
      image,
      qty: 1,
    };

    const idx = cart.findIndex((x) => x.cartId === cartId);
    if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + 1;
    else cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold">PRODUCT NOT FOUND</h2>
          <p className="mb-6 text-slate-400">This product id doesn’t exist in MongoDB.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 font-bold text-black bg-white rounded-xl hover:bg-indigo-400"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="p-10 mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 mb-8 border rounded-xl border-white/20 hover:bg-white/5"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden border bg-white/5 border-white/10 rounded-3xl">
            <div className="h-[520px] bg-slate-900">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
              )}
            </div>

            {/* ✅ Thumbnails (click to change main image) */}
            <div className="flex gap-3 p-4 overflow-auto">
              {images.length === 0 ? (
                <div className="text-sm text-slate-400">No images uploaded.</div>
              ) : (
                images.map((img, i) => {
                  const src = resolveImage(img);
                  const active = i === selectedImageIndex;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-20 h-20 border rounded-xl overflow-hidden ${
                        active ? "border-indigo-400" : "border-white/10"
                      }`}
                      title={`Image ${i + 1}`}
                    >
                      <img src={src} alt="thumb" className="object-cover w-full h-full" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-5xl font-black">{product.name}</h1>
            <p className="mt-4 text-slate-300">{product.description}</p>

            <p className="mt-6 text-4xl font-black text-indigo-400">₹{product.price}</p>

            {/* Colors */}
            <div className="mt-8">
              <p className="mb-2 text-sm text-slate-300">Color</p>
              <div className="flex gap-3">
                {(product.variants || []).map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-10 h-10 rounded-full border ${
                      idx === selectedColorIndex ? "border-indigo-400" : "border-white/20"
                    }`}
                    style={{ backgroundColor: v.colorCode }}
                    title={v.color}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-8">
              <p className="mb-2 text-sm text-slate-300">Size</p>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-2 rounded-xl border text-sm ${
                      selectedSize === s ? "border-indigo-400" : "border-white/20"
                    } hover:bg-white/5`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={addToCart}
                className="flex-1 py-4 font-bold text-black bg-white rounded-2xl hover:bg-indigo-400"
              >
                Add to Cart
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="flex-1 py-4 font-bold border rounded-2xl border-white/20 hover:bg-white/5"
              >
                Go to Cart
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-500">Product ID: {product._id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
