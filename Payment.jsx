import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PremiumPayment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    address2: "",
    activeAddress: 1,
    locationStatus: "",
  });

  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // 📍 Location
  const handleGetLocation = (slot) => {
    if (!navigator.geolocation) return alert("Not supported");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const addrField = slot === 1 ? "address" : "address2";

        setFormData((prev) => ({
          ...prev,
          [addrField]: data.display_name || `${latitude}, ${longitude}`,
          activeAddress: slot,
          locationStatus: `📍 Slot ${slot} Updated`,
        }));
      } catch (e) {
        console.error(e);
      }
      setIsLocating(false);
    });
  };

  // 💳 Card formatting
  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === "number")
      value = value
        .replace(/\D/g, "")
        .substring(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    if (name === "expiry")
      value = value
        .replace(/\D/g, "")
        .substring(0, 4)
        .replace(/(.{2})/, "$1/");
    setCard({ ...card, [name]: value });
  };

  // ✅ CHECKOUT → SAVE ORDER → INVOICE
  const handleCheckout = () => {
    setIsProcessing(true);

    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cartItems.length) {
      alert("Cart is empty");
      setIsProcessing(false);
      return;
    }

    const order = {
      invoiceNo: "INV-" + Date.now(),
      date: new Date().toLocaleDateString(),
      customer: {
        fullName: formData.fullName || "Customer",
        email: formData.email || "N/A",
        phone: "N/A",
        address:
          formData.activeAddress === 2
            ? formData.address2
            : formData.address,
      },
      items: cartItems,
      paymentMethod: method,
    };

    localStorage.setItem("lastOrder", JSON.stringify(order));
    navigate("/invoice");
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 p-4 md:p-12 font-sans">
      <div className="grid max-w-6xl grid-cols-1 gap-16 mx-auto lg:grid-cols-12">

        {/* LEFT COLUMN */}
        <div className="space-y-12 lg:col-span-7">
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight uppercase">
                Checkout
              </h2>
              {formData.locationStatus && (
                <span className="text-[10px] font-bold text-blue-600 animate-pulse">
                  {formData.locationStatus}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="py-2 border-b-2 outline-none border-slate-100 focus:border-black"
              />
              <input
                type="email"
                placeholder="Email Address"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="py-2 border-b-2 outline-none border-slate-100 focus:border-black"
              />

              {/* Address 1 */}
              <div className="relative flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Primary Delivery Address
                </label>
                <div className="flex gap-2">
                  <input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="flex-1 py-2 border-b-2 outline-none border-slate-100 focus:border-black"
                    placeholder="Home Address"
                  />
                  <button onClick={() => handleGetLocation(1)}>📍</button>
                </div>
              </div>

              {/* Address 2 */}
              <div className="relative flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Secondary / Office Address
                </label>
                <div className="flex gap-2">
                  <input
                    value={formData.address2}
                    onChange={(e) =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                    className="flex-1 py-2 border-b-2 outline-none border-slate-100 focus:border-black"
                    placeholder="Office Address"
                  />
                  <button onClick={() => handleGetLocation(2)}>🏢</button>
                </div>
              </div>
            </div>
          </section>

          {/* PAYMENT METHOD */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Payment Method</h3>
              <div className="flex p-1 rounded-full bg-slate-100">
                {["card", "upi", "cod"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                      method === m
                        ? "bg-white shadow-sm"
                        : "text-slate-400"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* CARD */}
            {method === "card" && (
              <div className="grid max-w-sm grid-cols-2 gap-4">
                <input
                  name="number"
                  placeholder="Card Number"
                  onChange={handleCardChange}
                  className="col-span-2 p-4 outline-none bg-slate-50 rounded-2xl"
                />
                <input
                  name="expiry"
                  placeholder="MM/YY"
                  onChange={handleCardChange}
                  className="p-4 outline-none bg-slate-50 rounded-2xl"
                />
                <input
                  name="cvc"
                  placeholder="CVC"
                  className="p-4 outline-none bg-slate-50 rounded-2xl"
                />
              </div>
            )}

            {/* UPI */}
            {method === "upi" && (
              <div className="flex flex-col items-center p-8 space-y-4 text-center">
                <div className="p-4 bg-white border-4 border-black rounded-3xl">
                  <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed bg-slate-100 rounded-xl">
                    <span className="text-4xl">📱</span>
                  </div>
                </div>
                <p className="text-sm font-bold">
                  Scan to pay using any UPI app
                </p>
                <p className="text-[10px] text-slate-400 uppercase">
                  Transaction ID:{" "}
                  {Math.random().toString(36).substring(7).toUpperCase()}
                </p>
              </div>
            )}

            {/* COD */}
            {method === "cod" && (
              <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-[40px]">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                  <span className="text-2xl">📦</span>
                </div>
                <h4 className="text-lg font-bold">Cash on Delivery</h4>
                <p className="mt-2 text-sm text-slate-500">
                  Pay when your order arrives at your doorstep.
                </p>
                <div className="mt-4 text-[10px] font-bold text-green-600 uppercase">
                  No extra charges
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5">
          <div className="sticky top-12 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
            <h3 className="mb-8 text-xl font-bold">Summary</h3>

            <div className="flex items-end justify-between pt-4 border-t">
              <span className="text-xs font-bold uppercase text-slate-400">
                Total
              </span>
              <span className="text-4xl font-black">₹899</span>
            </div>

            <button
              onClick={handleCheckout}
              className={`w-full mt-12 py-5 rounded-full font-black text-sm uppercase transition-all shadow-xl ${
                isProcessing
                  ? "bg-slate-200"
                  : "bg-black text-white hover:scale-[1.02]"
              }`}
            >
              {isProcessing ? "Confirming..." : "Complete Purchase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
