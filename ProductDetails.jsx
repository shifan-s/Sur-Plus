import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsData from "../data/products.json";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productsData.find((p) => p.id === Number(id));

  const [vIdx, setVIdx] = useState(0); 
  const [imgIdx, setImgIdx] = useState(0); 
  const [selectedSize, setSelectedSize] = useState("");

  if (!product) return <div className="flex items-center justify-center h-screen font-black">PRODUCT NOT FOUND</div>;

  const activeV = product.variants[vIdx];
  const activeImg = activeV.images[imgIdx];

  // --- ADD TO BAG LOGIC ---
  const handleAddToBag = () => {
    if (!selectedSize) {
      alert("Please select a size before adding to bag!");
      return;
    }

    // 1. Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    // 2. Create a unique ID for this specific variation
    const cartId = `${product.id}-${activeV.color}-${selectedSize}`;

    // 3. Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item.cartId === cartId);

    if (existingItemIndex > -1) {
      // Increase quantity if it exists
      existingCart[existingItemIndex].qty += 1;
    } else {
      // Add new item if it doesn't
      const newItem = {
        cartId,
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        color: activeV.color,
        image: activeV.images[0], // Use the first image of the selected color
        qty: 1
      };
      existingCart.push(newItem);
    }

    // 4. Save back to localStorage
    localStorage.setItem("cart", JSON.stringify(existingCart));

    // 5. Navigate to Cart page
    navigate("/cart");
  };

  return (
    <div className="min-h-screen p-6 bg-white md:p-12 lg:p-20">
      <div className="grid grid-cols-1 gap-16 mx-auto max-w-7xl lg:grid-cols-12">
        
        {/* LEFT: GALLERY */}
        <div className="space-y-6 lg:col-span-7">
          <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100">
            <img 
              src={activeImg} 
              key={activeImg} 
              className="object-contain w-full h-full transition-all duration-500 md:object-cover" 
              alt={product.name}
            />
          </div>
          
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {activeV.images.map((url, i) => (
              <button 
                key={i} 
                onClick={() => setImgIdx(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  imgIdx === i ? "border-blue-600 scale-105 shadow-md" : "border-transparent opacity-40"
                }`}
              >
                <img src={url} className="object-cover w-full h-full" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="flex flex-col justify-center py-10 lg:col-span-5">
          <h1 className="text-5xl font-black leading-tight tracking-tighter uppercase text-slate-900">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-light text-blue-600">₹{product.price}</p>
          
          <div className="w-full h-px my-8 bg-slate-100" />
          
          <p className="mb-10 font-medium leading-relaxed text-slate-500">
            {product.description}
          </p>

          {/* COLOR SELECTOR */}
          <div className="mb-10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Color: <span className="text-black">{activeV.color}</span>
            </h3>
            <div className="flex gap-4">
              {product.variants.map((v, i) => (
                <button 
                  key={i} 
                  onClick={() => { setVIdx(i); setImgIdx(0); }} 
                  className={`w-12 h-12 rounded-full p-1 border-2 transition-all ${
                    vIdx === i ? "border-blue-600 scale-110 shadow-lg" : "border-transparent opacity-40"
                  }`}
                >
                  <div className="w-full h-full rounded-full" style={{ backgroundColor: v.colorCode }} />
                </button>
              ))}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mb-10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button 
                  key={s} 
                  disabled={product.stock[s] === 0}
                  onClick={() => setSelectedSize(s)}
                  className={`px-8 py-4 rounded-2xl font-black text-xs transition-all border-2 ${
                    product.stock[s] === 0 ? "opacity-20 cursor-not-allowed line-through" :
                    selectedSize === s ? "bg-black text-white border-black" : "bg-white border-slate-100 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button 
            onClick={handleAddToBag}
            className="w-full py-6 text-xs font-black tracking-widest text-white uppercase transition-all bg-black rounded-full shadow-2xl hover:bg-blue-600 active:scale-95"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}