import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PremiumPayment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [isLocating, setIsLocating] = useState(false);
  
  // State for two addresses
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: "", 
    address: "",
    address2: "", // Second location slot
    activeAddress: 1,
    locationStatus: "" 
  });
  
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Geolocation Logic ---
  const handleGetLocation = (slot) => {
    if (!navigator.geolocation) return alert("Not supported");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const addrField = slot === 1 ? 'address' : 'address2';
        
        setFormData(prev => ({
          ...prev,
          [addrField]: data.display_name || `${latitude}, ${longitude}`,
          locationStatus: `📍 Slot ${slot} Updated`
        }));
      } catch (e) { console.error(e); }
      setIsLocating(false);
    });
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === "number") value = value.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry") value = value.replace(/\D/g, "").substring(0, 4).replace(/(.{2})/, "$1/");
    setCard({ ...card, [name]: value });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 p-4 md:p-12 font-sans">
      <div className="grid max-w-6xl grid-cols-1 gap-16 mx-auto lg:grid-cols-12">
        
        {/* Left Column */}
        <div className="space-y-12 lg:col-span-7">
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight uppercase">Checkout</h2>
              {formData.locationStatus && (
                <span className="text-[10px] font-bold text-blue-600 animate-pulse">{formData.locationStatus}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <input type="text" placeholder="Full Name" onChange={(e)=>setFormData({...formData, fullName: e.target.value})} className="py-2 border-b-2 outline-none border-slate-100 focus:border-black" />
              <input type="email" placeholder="Email Address" onChange={(e)=>setFormData({...formData, email: e.target.value})} className="py-2 border-b-2 outline-none border-slate-100 focus:border-black" />
              
              {/* Address Slot 1 */}
              <div className="relative flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Primary Delivery Address</label>
                <div className="flex gap-2">
                   <input type="text" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="flex-1 py-2 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="Home Address" />
                   <button onClick={() => handleGetLocation(1)} className="p-2 hover:text-blue-600">📍</button>
                </div>
              </div>

              {/* Address Slot 2 */}
              <div className="relative flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Secondary / Office Address</label>
                <div className="flex gap-2">
                   <input type="text" value={formData.address2} onChange={(e)=>setFormData({...formData, address2: e.target.value})} className="flex-1 py-2 border-b-2 outline-none border-slate-100 focus:border-black" placeholder="Office Address" />
                   <button onClick={() => handleGetLocation(2)} className="p-2 hover:text-blue-600">🏢</button>
                </div>
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
                <div className="relative w-full h-48 max-w-sm p-6 mx-auto text-white shadow-2xl bg-gradient-to-br from-slate-800 to-black rounded-3xl">
                   <div className="mt-12 font-mono text-xl tracking-widest">{card.number || "•••• •••• •••• ••••"}</div>
                   <div className="flex justify-between mt-8 uppercase text-[10px]">
                      <span>{formData.fullName || "Card Holder"}</span>
                      <span>{card.expiry || "MM/YY"}</span>
                   </div>
                </div>
                <div className="grid max-w-sm grid-cols-2 gap-4 mx-auto">
                   <input name="number" placeholder="Card Number" onChange={handleCardChange} className="col-span-2 p-4 outline-none bg-slate-50 rounded-2xl focus:ring-2 ring-slate-200" />
                   <input name="expiry" placeholder="MM/YY" onChange={handleCardChange} className="p-4 outline-none bg-slate-50 rounded-2xl focus:ring-2 ring-slate-200" />
                   <input name="cvc" placeholder="CVC" className="p-4 outline-none bg-slate-50 rounded-2xl focus:ring-2 ring-slate-200" />
                </div>
              </div>
            )}

            {/* UPI QR VIEW */}
            {method === "upi" && (
              <div className="flex flex-col items-center p-8 space-y-4 text-center animate-in zoom-in-95">
                <div className="p-4 bg-white border-4 border-black shadow-xl rounded-3xl">
                  {/* Dummy QR Placeholder */}
                  <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed bg-slate-100 rounded-xl border-slate-300">
                    <span className="text-4xl">🏁</span> 
                  </div>
                </div>
                <p className="text-sm font-bold">Scan to pay via Any UPI App</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Transaction ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
              </div>
            )}

            {/* COD VIEW */}
            {method === "cod" && (
              <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-[40px] animate-in fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                  <span className="text-2xl">📦</span>
                </div>
                <h4 className="text-lg font-bold">Cash on Delivery</h4>
                <p className="max-w-xs mx-auto mt-2 text-sm text-slate-500">
                  Pay securely with cash or card when your package arrives at your doorstep.
                </p>
                <div className="mt-4 text-[10px] font-bold text-green-600 uppercase">No extra service charges</div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-12 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
            <h3 className="mb-8 text-xl font-bold">Summary</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="font-bold text-green-500 uppercase">Free</span>
              </div>
              <div className="flex items-end justify-between pt-4 border-t">
                <span className="text-xs font-bold uppercase text-slate-400">Total</span>
                <span className="text-4xl font-black">₹899</span>
              </div>
            </div>
            <button 
              onClick={() => {setIsProcessing(true); setTimeout(()=>navigate("/invoice"), 2000)}}
              className={`w-full mt-12 py-5 rounded-full font-black text-sm uppercase transition-all shadow-xl ${isProcessing ? "bg-slate-200" : "bg-black text-white hover:scale-[1.02]"}`}
            >
              {isProcessing ? "Confirming..." : "Complete Purchase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}