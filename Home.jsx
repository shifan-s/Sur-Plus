import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveImage } from "../utils/image";
export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-8 border-b border-white/5 backdrop-blur-md">
        <h1 className="text-2xl font-black">LUXE.</h1>

        <div className="flex items-center space-x-8">
          <button onClick={() => navigate("/cart")} className="hover:text-indigo-400">
            Cart
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-500 border rounded-lg border-red-500/50 hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-10 mx-auto max-w-7xl">
        <h2 className="mb-12 text-5xl font-bold">Latest Arrivals</h2>

        {loading ? (
          <div className="text-slate-400">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {products.map((product) => {
              const firstImage = product?.variants?.[0]?.images?.[0];

              return (
                <div
                  key={product._id}
                  className="p-6 transition-all border bg-white/5 border-white/10 rounded-3xl group hover:border-indigo-500/50"
                >
                  <div className="h-64 mb-4 overflow-hidden rounded-2xl bg-slate-900">
                    {firstImage ? (
                      <img
                        src={resolveImage(firstImage)}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-4xl">
                        📷
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold">{product.name}</h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {product.description}
                  </p>

                  <p className="mt-2 text-2xl font-black text-indigo-400">
                    ₹{product.price}
                  </p>

                  <div className="flex gap-2 mt-3">
                    {product?.variants?.map((v, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 border border-white rounded-full"
                        style={{ backgroundColor: v.colorCode }}
                        title={v.color}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {product?.sizes?.map((size) => (
                      <span
                        key={size}
                        className="px-2 py-1 text-xs border rounded-md border-white/20"
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="w-full py-3 mt-5 font-bold text-black bg-white rounded-xl hover:bg-indigo-400"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
