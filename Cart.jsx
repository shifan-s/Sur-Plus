import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { resolveImage } from "../utils/image";

export default function Cart() {
  const navigate = useNavigate();

  // Initialize state directly from localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ helper: make a stable unique key even if old items don't have cartId
  const getKey = (item) => {
    // if your new cart items have cartId, use it
    if (item?.cartId) return item.cartId;

    // fallback for old items: build from _id + size + color
    const pid = item?._id || item?.id || "";
    const size = item?.size || "";
    const color =
      item?.color ||
      item?.variant?.color ||
      item?.variant?.colorName ||
      "";
    return `${pid}_${size}_${color}`;
  };

  // ✅ normalize old items so your cart works always
  const normalizedCart = useMemo(() => {
    return cart.map((item) => {
      const key = getKey(item);

      // image fix: support multiple possible shapes
      const image =
        item?.image ||
        item?.variant?.image ||
        item?.variant?.images?.[0] ||
        item?.variants?.[0]?.images?.[0] ||
        "";

      const color =
        item?.color ||
        item?.variant?.color ||
        "";

      return {
        ...item,
        cartId: item.cartId || key, // ensure cartId exists
        image,
        color,
        qty: Number(item.qty || 1)
      };
    });
  }, [cart]);

  // keep state as normalized (so next operations use cartId)
  useEffect(() => {
    setCart(normalizedCart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Sync state to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  }, [cart]);

  // Function to change quantity and auto-remove at 0
  const changeQty = (cartId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId ? { ...item, qty: (item.qty || 1) + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setCart([]);
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);
  const gst = subtotal * 0.18;
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 200;
  const total = subtotal + gst + shipping;

  // Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-10 text-center bg-white shadow-xl rounded-3xl">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 mt-6 font-bold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700"
          >
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-800 uppercase">
            Shopping Cart ({cart.length})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm font-bold text-red-500 transition-colors hover:text-red-700"
          >
            CLEAR ALL
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items List */}
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex items-center gap-6 p-5 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md"
              >
                {/* ✅ Product Image */}
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden rounded-xl bg-gray-50">
                  {item.image ? (
                    <img
                      src={resolveImage(item.image)}
                      className="object-cover w-full h-full"
                      alt={item.name}
                      onError={(e) => {
                        // hide broken image
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <div className="flex gap-3 mt-1 text-xs font-bold text-gray-400 uppercase">
                    <span>Size: {item.size || "-"}</span>
                    <span>•</span>
                    <span>Color: {item.color || "-"}</span>
                  </div>

                  <p className="mt-2 font-bold text-blue-600 text-md">
                    ₹{Number(item.price || 0).toLocaleString()}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => changeQty(item.cartId, -1)}
                      className={`w-8 h-8 flex items-center justify-center font-bold rounded-full transition-colors ${
                        item.qty === 1
                          ? "bg-red-50 text-red-500 hover:bg-red-100"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {item.qty === 1 ? "✕" : "−"}
                    </button>

                    <span className="w-4 font-bold text-center text-gray-700">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => changeQty(item.cartId, 1)}
                      className="flex items-center justify-center w-8 h-8 font-bold transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900">
                    ₹{Number((item.price || 0) * (item.qty || 1)).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item.cartId)}
                    className="mt-2 text-[10px] font-bold text-gray-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:relative">
            <div className="sticky p-8 bg-white border shadow-2xl top-8 h-fit rounded-3xl border-blue-50">
              <h2 className="pb-4 mb-6 text-2xl font-bold text-gray-800 border-b">
                Order Summary
              </h2>

              <div className="mb-6 space-y-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-bold text-gray-800">
                    ₹{gst.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 text-2xl font-black text-gray-900 border-t-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate("/payment")}
                className="w-full py-4 mt-8 font-black text-white transition-all bg-blue-600 shadow-lg rounded-2xl hover:bg-blue-700 hover:shadow-blue-200 active:scale-95"
              >
                PROCEED TO CHECKOUT
              </button>

              <p className="mt-4 text-xs text-center text-gray-400">
                Free shipping on orders above ₹5,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
