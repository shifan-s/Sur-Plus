import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

export default function Invoice() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedOrder = JSON.parse(localStorage.getItem("lastOrder"));
      if (!savedOrder || !savedOrder.items) {
        navigate("/");
      } else {
        setOrder(savedOrder);
      }
    } catch (err) {
      console.error("Error loading invoice:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Invoice...</div>;
  if (!order) return null;

  // Final Calculations
  const subtotal = order.items.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);
  const tax = subtotal * 0.18;
  const deliveryFee = subtotal > 5000 ? 0 : 200;
  const discount = subtotal > 10000 ? subtotal * 0.10 : 0;
  const grandTotal = subtotal + tax + deliveryFee - discount;

  const downloadPDF = () => {
    const element = document.getElementById("invoice-content");
    const opt = {
      margin: [0.2, 0.2], // Reduced margins
      filename: `Invoice_${order.invoiceNo || 'Order'}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true 
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }, // Switched to A4 for better compatibility
    };

    // Use a promise-based approach to avoid lag
    html2pdf().set(opt).from(element).save();
  };

  const handleDone = () => {
    localStorage.removeItem("lastOrder");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-12 bg-gray-100">
      <div 
        id="invoice-content" 
        className="w-full max-w-3xl overflow-hidden bg-white border-gray-200 shadow-lg rounded-xl print:shadow-none print:border"
      >
        {/* 🏢 Company Header */}
        <div className="flex justify-between p-10 text-white bg-gray-900">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Surplus SHOP CO.</h1>
            <p className="mt-1 text-sm italic text-gray-400">Your premium Costume store</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-widest text-blue-400 uppercase">Invoice</h2>
            <p className="mt-1 text-gray-300">#{order.invoiceNo}</p>
            <p className="text-gray-300">{order.date}</p>
          </div>
        </div>

        <div className="p-10">
          {/* 👤 Customer & Shipping */}
          <div className="grid grid-cols-2 gap-10 pb-8 mb-12 border-b border-gray-100">
            <div>
              <h3 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">Customer Info</h3>
              <p className="text-lg font-bold text-gray-800">{order.customer.fullName}</p>
              <p className="text-gray-600">{order.customer.email}</p>
              <p className="text-gray-600">{order.customer.phone}</p>
            </div>
            <div className="text-right">
              <h3 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">Shipping To</h3>
              <p className="leading-relaxed text-gray-600 whitespace-pre-wrap">
                {order.customer.address}
              </p>
            </div>
          </div>

          {/* 🛒 Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full mb-10 text-left">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="px-2 py-4 text-sm font-bold text-gray-800 uppercase">Product</th>
                  <th className="px-2 py-4 text-sm font-bold text-center text-gray-800 uppercase">Unit Price</th>
                  <th className="px-2 py-4 text-sm font-bold text-center text-gray-800 uppercase">Qty</th>
                  <th className="px-2 py-4 text-sm font-bold text-right text-gray-800 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-2 py-5 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-2 py-5 text-center text-gray-600">₹{Number(item.price).toLocaleString()}</td>
                    <td className="px-2 py-5 text-center text-gray-600">{item.qty}</td>
                    <td className="px-2 py-5 font-bold text-right text-gray-900">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 💵 Financials */}
          <div className="flex justify-end pt-6">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (GST 18%)</span>
                <span className="font-semibold text-gray-800">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-gray-800">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between p-2 font-bold text-green-600 rounded bg-green-50">
                  <span>Discount (10%)</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-5 text-3xl font-black text-gray-900 border-t-4 border-gray-900">
                <span>TOTAL</span>
                <span>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note for PDF */}
        <div className="p-6 text-xs text-center text-gray-400 border-t border-gray-100 bg-gray-50">
          This is a computer generated invoice. No signature required.
        </div>
      </div>

      {/* ⚙️ Control Panel */}
      <div className="flex flex-wrap w-full max-w-3xl gap-4 mt-8 print:hidden">
        <button 
          onClick={() => window.print()} 
          className="flex-1 min-w-[120px] py-4 font-bold bg-white text-gray-800 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          🖨️ Print
        </button>
        <button 
          onClick={downloadPDF} 
          className="flex-1 min-w-[120px] py-4 font-bold text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          📥 Download PDF
        </button>
        <button 
          onClick={handleDone} 
          className="flex-1 min-w-[120px] py-4 font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          🏠 Return to Store
        </button>
      </div>
    </div>
  );
}