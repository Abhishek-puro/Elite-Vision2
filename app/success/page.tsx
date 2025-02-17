"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [customerDetails, setCustomerDetails] = useState({
    phone: "",
    address: "",
    paymentMode: "",
  });

  const GST_RATE = 0.18; // 18% GST

  // Generate Order ID, Date, and Load Cart Data
  useEffect(() => {
    const randomOrderId = `#${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderId(randomOrderId);

    const now = new Date();
    setDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Load Customer Details
  useEffect(() => {
    const storedCustomer = localStorage.getItem("customerDetails");
    if (storedCustomer) {
      setCustomerDetails(JSON.parse(storedCustomer));
    }
  }, []);

  // Calculate Totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const gstAmount = subtotal * GST_RATE;
  const totalAmount = subtotal + gstAmount;

  // Generate PDF Receipt
  const downloadReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightX = pageWidth - 20;

    // Load and Add Logo
    const logoUrl = "/pdflogo.png";
    const img = new Image();
    img.src = logoUrl;
    img.onload = function () {
      doc.addImage(img, "PNG", 14, 0, 100, 40);

      // Order Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Order Details:", 14, 40);
      doc.text(`Order ID: ${orderId}`, 14, 50);
      
      doc.setFont("helvetica", "bold");
      doc.text("Date & Time:", 14, 60);
      doc.setFont("helvetica", "normal");
      doc.text(dateTime, 40, 60);
      
      doc.setFont("helvetica", "bold");
      doc.text("Customer Phone:", 14, 70);
      doc.setFont("helvetica", "normal");
      doc.text(customerDetails.phone, 50, 70);
      
      doc.setFont("helvetica", "bold");
      doc.text("Address:", 14, 80);
      doc.setFont("helvetica", "normal");
      doc.text(customerDetails.address, 33, 80, { maxWidth: 140 });
      
      doc.setFont("helvetica", "bold");
      doc.text("Payment Mode:", 14, 90);
      doc.setFont("helvetica", "normal");
      doc.text(customerDetails.paymentMode, 45, 90);
      

      // Store Address - Right Aligned
      doc.setFont("helvetica", "bold");
      doc.text("Elite Vision Store", rightX, 20, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text("123, Lokhandwala Market Street,", rightX, 30, { align: "right" });
      doc.text("Andheri West, Mumbai - 400058", rightX, 40, { align: "right" });
      doc.text("Maharashtra, India", rightX, 50, { align: "right" });
      doc.text("Phone: +91 70399 99010", rightX, 60, { align: "right" });
      doc.text("Email: contact@elitevision.com", rightX, 70, { align: "right" });

      // Generate Table
      const tableData = cartItems.map((item) => [
        item.name,
        item.quantity,
        item.price.toLocaleString(),
        (item.price * item.quantity).toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 100,
        head: [["Item", "Quantity", "Price", "Total"]],
        body: tableData,
      });

      // Totals
      const finalY = doc.lastAutoTable?.finalY || 120;
      doc.setFont("helvetica", "bold");
      doc.text(`Subtotal: ${subtotal.toLocaleString()}`, 14, finalY + 10);
      doc.text(`GST (18%): ${gstAmount.toLocaleString()}`, 14, finalY + 20);
      doc.text(`Total Amount: ${totalAmount.toLocaleString()}`, 14, finalY + 30);

      doc.save(`Elite-Vision_Receipt_${orderId}.pdf`);
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Order Successful!</h1>
        <p className="text-gray-600 mt-2">Thank you for your purchase.</p>

        <div className="mt-4 text-left">
          <p className="text-lg font-semibold">Order ID: {orderId}</p>
          <p className="text-gray-600">Date & Time: {dateTime}</p>
          <ul className="mt-3">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <li key={index} className="flex justify-between text-gray-700">
                  <span>{item.quantity} x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No items found.</p>
            )}
          </ul>
          <hr className="my-3" />
          <p className="text-lg font-semibold">Subtotal: ₹{subtotal.toLocaleString()}</p>
          <p className="text-lg font-semibold">GST (18%): ₹{gstAmount.toLocaleString()}</p>
          <p className="text-lg font-semibold">Total: ₹{totalAmount.toLocaleString()}</p>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            onClick={() => router.push("/products")}
          >
            Return to Home
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
            onClick={downloadReceipt}
          >
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
