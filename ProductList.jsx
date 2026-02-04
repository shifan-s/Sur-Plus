import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PremiumPayment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("card"); // Default to card
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    locationStatus: "",
  });

  // 2. Card State
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });

  // 3. Dynamic Cart Calculations
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const gst = subtotal * 0.18;
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 200;
  const total = subtotal + gst + shipping;

  // Save total to localStorage so the Invoice can see it
  useEffect(() => {
    localStorage.setItem("totalPrice", total);
  }, [total]);

  // Handle Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address;
          setFormData((prev) => ({
            ...prev,
            street: addr.road || "",
            city: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            pinCode: addr.postcode || "",
            locationStatus: "📍 Auto-filled",
          }));
        } catch (error) {
          console.error("Location error", error);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        alert("Permission denied.");
        setIsLocating(false);
      }
    );
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === "number") value = value.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry") value = value.replace(/\D/g, "").substring(0, 4).replace(/(.{2})/, "$1/");
    if (name === "cvc") value = value.replace(/\D/g, "").substring(0, 3);
    setCard({ ...card, [name]: value });
  };

  const handlePayment = () => {
    if (!formData.fullName || !formData.street) {
      alert("Please fill in your shipping details.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const orderData = {
        customer: formData,
        items: cart,
        invoiceNo: `SUR-${Math.floor(Math.random() * 1000000)}`,
        date: new Date().toLocaleDateString(),
        total: total,
        paymentMethod: method,
      };
      localStorage.setItem("lastOrder", JSON.stringify(orderData));
      localStorage.removeItem("cart"); // Clear cart after success
      navigate("/invoice");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 p-4 md:p-12">
      <div className="grid max-w-6xl grid-cols-1 gap-16 mx-auto lg:grid-cols-12">
        
        {/* Left Column: Form & Methods */}
        <div className="space-y-12 lg:col-span-7">
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight">SHIPPING</h2>
              {formData.locationStatus && (
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{formData.locationStatus}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="py-2 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="py-2 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="john@example.com" />
              </div>

              <div className="relative flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Street Address</label>
                <input type="text" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="py-2 pr-10 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="House No, Street name" />
                <button onClick={handleGetLocation} className="absolute right-0 p-2 transition-colors bottom-1 text-slate-400 hover:text-blue-600">
                  {isLocating ? <div className="w-4 h-4 border-2 rounded-full border-t-blue-600 animate-spin" /> : "📍"}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="py-2 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="New York" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PIN Code</label>
                <input type="text" value={formData.pinCode} onChange={(e) => setFormData({...formData, pinCode: e.target.value})} className="py-2 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="10001" />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Payment Method</h3>
              <div className="flex p-1 rounded-full bg-slate-100">
                {["card", "upi", "cod"].map((m) => (
                  <button key={m} onClick={() => setMethod(m)} className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${method === m ? "bg-white shadow-sm" : "text-slate-400"}`}>{m}</button>
                ))}
              </div>
            </div>

            {/* CARD VIEW */}
            {method === "card" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="relative w-full h-48 max-w-sm p-8 mx-auto text-white shadow-2xl bg-gradient-to-br from-slate-800 to-black rounded-3xl">
                   <div className="relative z-10 flex flex-col justify-between h-full">
                     <div className="w-10 h-8 rounded bg-yellow-400/80" />
                     <div className="font-mono text-xl tracking-widest">{card.number || "•••• •••• •••• ••••"}</div>
                     <div className="flex justify-between text-[10px] uppercase opacity-70">
                       <span>{formData.fullName || "NAME"}</span>
                       <span>{card.expiry || "MM/YY"}</span>
                     </div>
                   </div>
                </div>
                <div className="grid max-w-sm grid-cols-2 gap-4 mx-auto">
                  <input type="text" name="number" value={card.number} onChange={handleCardChange} placeholder="Card Number" className="col-span-2 p-4 outline-none bg-slate-50 rounded-2xl focus:ring-2 ring-slate-200" />
                  <input type="text" name="expiry" value={card.expiry} onChange={handleCardChange} placeholder="MM/YY" className="p-4 outline-none bg-slate-50 rounded-2xl focus:ring-2 ring-slate-200" />
                  <input type="text" name="cvc" value={card.cvc} onChange={handleCardChange} placeholder="CVC" className="p-4 outline-none bg-slate-50 rounded-2xl focus:ring-2 ring-slate-200" />
                </div>
              </div>
            )}

            {/* UPI / QR VIEW */}
            {method === "upi" && (
              <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center duration-500 animate-in fade-in zoom-in-95 bg-slate-50 rounded-3xl">
                <div className="p-4 bg-white shadow-xl rounded-2xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=surplus@okaxis&pn=SURPLUS&am=${total}`} 
                    alt="Payment QR" 
                    className="w-48 h-48"
                  />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">Scan to Pay ₹{total.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GPay, PhonePe, Paytm</p>
                </div>
              </div>
            )}

            {/* COD VIEW */}
            {method === "cod" && (
              <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl animate-in fade-in">
                <div className="mb-4 text-4xl">📦</div>
                <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Cash on Delivery</h4>
                <p className="max-w-xs mx-auto mt-2 text-sm font-medium text-slate-600">
                  Pay in cash when your SUR-PLUS package is delivered.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-12 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
            <h3 className="mb-8 text-xl font-bold tracking-tighter uppercase">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span>
                <span className="font-bold text-green-500">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-end justify-between pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Amount</span>
                <span className="text-4xl font-black tracking-tighter">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={isProcessing || total === 0}
              className={`w-full mt-10 py-5 rounded-full font-black text-sm tracking-widest uppercase transition-all shadow-2xl
                ${isProcessing ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-black text-white hover:bg-blue-600 active:scale-95 shadow-blue-100"}
              `}
            >
              {isProcessing ? "Verifying..." : "Place Order"}
            </button>
            <p className="mt-6 text-[9px] text-center text-slate-400 uppercase font-bold tracking-[0.2em]">
              Secure SSL Encrypted Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}