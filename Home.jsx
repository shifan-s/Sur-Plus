import React from "react";
import { Link } from "react-router-dom";
import productsData from "../data/products.json";

export default function Home() {
  return (
    <div className="min-h-screen text-black bg-white selection:bg-black selection:text-white">
      {/* ultra-thin minimalist top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between w-full px-8 py-3 bg-white border-b border-slate-100">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">Sur-Plus Edition</span>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
          <span className="transition-colors cursor-pointer hover:text-slate-400">Archive</span>
          <span className="transition-colors cursor-pointer hover:text-slate-400">Cart (0)</span>
        </div>
      </div>

      {/* Structured Hero Section */}
      <header className="px-8 py-20 border-b md:py-32 border-slate-100">
        <div className="flex flex-col items-end justify-between gap-8 mx-auto max-w-screen-2xl md:flex-row">
          <h1 className="text-8xl md:text-[12rem] font-black leading-[0.8] tracking-tighter">
            SUR<br />PLUS<span className="text-blue-600">.</span>
          </h1>
          <div className="max-w-xs space-y-4 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Project 2026 / Series 01</p>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Advanced silhouettes engineered for longevity. We define the intersection of utility and high-luxury.
            </p>
          </div>
        </div>
      </header>

      {/* Product Section - Clean Grid */}
      <main className="px-8 py-20 mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-4 bg-slate-100 border-slate-100">
          {productsData.map((product) => {
            const firstVariant = product.variants?.[0];
            const displayImage = firstVariant?.images ? firstVariant.images[0] : firstVariant?.image;

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="relative p-6 transition-all duration-700 bg-white group hover:bg-slate-50"
              >
                {/* Product Meta */}
                <div className="flex items-start justify-between mb-12">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300 group-hover:text-black transition-colors">
                      ID: {product.id.toString().padStart(4, '0')}
                    </span>
                    <h2 className="mt-1 text-sm font-bold tracking-widest uppercase">{product.name}</h2>
                  </div>
                  <p className="text-sm italic font-black">₹{product.price}</p>
                </div>

                {/* The Image - No rounded corners for a sharper "Industrial" look */}
                <div className="relative aspect-[3/4] mb-12 overflow-hidden bg-slate-50">
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="object-cover w-full h-full transition-all duration-1000 scale-100 grayscale group-hover:grayscale-0 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/800x1000?text=SUR+PLUS"; }}
                  />
                  
                  {/* Luxury Tag on Image */}
                  <div className="absolute bottom-0 left-0 flex items-center justify-center w-full transition-transform duration-500 translate-y-full h-1/3 bg-gradient-to-t from-white/80 to-transparent group-hover:translate-y-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Request Access</span>
                  </div>
                </div>

                {/* Bottom detail */}
                <div className="flex items-center justify-between transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Available in {product.variants?.length || 1} Tones</p>
                  <div className="w-8 h-px bg-black"></div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="flex flex-col items-center justify-between gap-4 p-8 border-t border-slate-100 md:flex-row">
        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">© 2026 SUR-PLUS™</p>
        <div className="flex gap-8">
          {['Instagram', 'Terms', 'Privacy'].map((item) => (
            <span key={item} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-blue-600">{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}