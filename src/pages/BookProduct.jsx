import { useState, useEffect } from "react";
import axios from "axios";

const categories = ["All", "3D Printing", "Laser Cutting", "Electronics", "Safety", "Finishing", "CNC", "Other"];

export default function BookProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQty, setProductQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Checkout flow
  const [checkoutStep, setCheckoutStep] = useState(0); // 0=none, 1=cart, 2=delivery, 3=payment, 4=success
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/products");
      setProducts(res.data);
    } catch (err) { console.error("Failed to fetch products"); }
    setLoading(false);
  };

  const filteredProducts = selectedCategory === "All"
    ? products : products.filter(p => p.category === selectedCategory);

  const openProduct = (product) => { setSelectedProduct(product); setProductQty(1); setSelectedImageIndex(0); };
  const closeProduct = () => { setSelectedProduct(null); setProductQty(1); setSelectedImageIndex(0); };

  const addToCart = (product, qty) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c));
    else setCart([...cart, { ...product, qty }]);
    closeProduct();
  };

  const buyNow = (product, qty) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c));
    else setCart([...cart, { ...product, qty }]);
    closeProduct();
    setCheckoutStep(1);
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id));
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshot(file);
      setPaymentPreview(URL.createObjectURL(file));
    }
  };

  const placeOrder = async () => {
    setOrderLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      for (const item of cart) {
        const formData = new FormData();
        formData.append("product_name", item.name);
        formData.append("category", item.category);
        formData.append("quantity", item.qty);
        formData.append("price", item.price);
        formData.append("total_price", item.price * item.qty);
        formData.append("notes", "");
        formData.append("delivery_option", deliveryOption);
        formData.append("delivery_address", deliveryAddress);
        if (paymentScreenshot) formData.append("payment_screenshot", paymentScreenshot);

        await axios.post("http://127.0.0.1:8000/api/product-orders", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      }
      setCart([]);
      setCheckoutStep(4);
    } catch (err) {
      setError("Failed to place order. Please try again.");
    }
    setOrderLoading(false);
  };

  const getImages = (product) => {
    const images = [];
    if (product.image_url) images.push(product.image_url);
    if (product.image_url2) images.push(product.image_url2);
    if (product.image_url3) images.push(product.image_url3);
    return images.length > 0 ? images : null;
  };

  const resetCheckout = () => {
    setCheckoutStep(0);
    setDeliveryOption("pickup");
    setDeliveryAddress("");
    setPaymentScreenshot(null);
    setPaymentPreview(null);
    setError("");
  };

  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
      {[1, 2, 3].map((step, i) => (
        <div key={step} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            background: checkoutStep >= step ? "#1e40af" : "#e2e8f0",
            color: checkoutStep >= step ? "white" : "#94a3b8",
          }}>{step}</div>
          {i < 2 && <div style={{ width: 60, height: 3, background: checkoutStep > step ? "#1e40af" : "#e2e8f0" }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Book a Product</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Order materials and consumables from the Fab Lab</p>
        </div>
        <button onClick={() => setCheckoutStep(1)}
          style={{ padding: "10px 20px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          🛒 Cart ({cart.length})
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: selectedCategory === cat ? "#1e40af" : "#f1f5f9", color: selectedCategory === cat ? "white" : "#64748b" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? <p style={{ color: "#64748b" }}>Loading products...</p> :
        filteredProducts.length === 0 ? <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No products available.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => openProduct(product)}
                style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ width: "100%", height: 160, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 40 }}>📦</span>}
                  {product.stock === 0 && <div style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 10 }}>Out of Stock</div>}
                </div>
                <div style={{ padding: 14 }}>
                  <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{product.category}</span>
                  <h4 style={{ margin: "8px 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{product.name}</h4>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{product.description?.substring(0, 60)}...</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1e40af" }}>Nu. {product.price}</span>
                    <span style={{ fontSize: 11, color: product.stock === 0 ? "#ef4444" : product.stock < 10 ? "#f59e0b" : "#16a34a", fontWeight: 600 }}>
                      {product.stock === 0 ? "Out of Stock" : product.stock < 10 ? `Only ${product.stock} left` : "In Stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 780, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={closeProduct} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", zIndex: 10 }}>✕</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: 24, borderRight: "1px solid #f1f5f9" }}>
                <div style={{ width: "100%", height: 280, background: "#f1f5f9", borderRadius: 12, overflow: "hidden", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getImages(selectedProduct) ? <img src={getImages(selectedProduct)[selectedImageIndex]} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 60 }}>📦</span>}
                </div>
                {getImages(selectedProduct) && getImages(selectedProduct).length > 1 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {getImages(selectedProduct).map((img, i) => (
                      <div key={i} onClick={() => setSelectedImageIndex(i)}
                        style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: selectedImageIndex === i ? "2px solid #1e40af" : "2px solid #e2e8f0" }}>
                        <img src={img} alt={`${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding: 24 }}>
                <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "3px 10px", borderRadius: 10, fontWeight: 600 }}>{selectedProduct.category}</span>
                <h2 style={{ margin: "12px 0 4px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{selectedProduct.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#1e40af" }}>Nu. {selectedProduct.price}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: selectedProduct.stock === 0 ? "#fee2e2" : "#dcfce7", color: selectedProduct.stock === 0 ? "#dc2626" : "#16a34a" }}>
                    {selectedProduct.stock === 0 ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b", lineHeight: 1.7, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>{selectedProduct.description}</p>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#374151" }}>Quantity:</p>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 8, width: "fit-content", overflow: "hidden" }}>
                    <button onClick={() => setProductQty(Math.max(1, productQty - 1))} style={{ width: 40, height: 40, background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>-</button>
                    <span style={{ width: 50, textAlign: "center", fontSize: 15, fontWeight: 700 }}>{productQty}</span>
                    <button onClick={() => setProductQty(Math.min(selectedProduct.stock || 99, productQty + 1))} style={{ width: 40, height: 40, background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => addToCart(selectedProduct, productQty)} disabled={selectedProduct.stock === 0}
                    style={{ flex: 1, padding: "12px", background: "white", color: "#1e40af", border: "2px solid #1e40af", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                    Add to Cart
                  </button>
                  <button onClick={() => buyNow(selectedProduct, productQty)} disabled={selectedProduct.stock === 0}
                    style={{ flex: 1, padding: "12px", background: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutStep > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto" }}>

            {/* Success */}
            {checkoutStep === 4 && (
              <div style={{ textAlign: "center", padding: "60px 40px" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h2 style={{ color: "#16a34a", margin: "0 0 8px", fontSize: 24 }}>Order Placed Successfully!</h2>
                <p style={{ color: "#64748b", margin: "0 0 24px" }}>Your order has been submitted with payment proof. Lab staff will verify and process it soon.</p>
                <button onClick={resetCheckout}
                  style={{ padding: "12px 32px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
                  Continue Shopping
                </button>
              </div>
            )}

            {checkoutStep < 4 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px" }}>

                {/* Left - Steps */}
                <div style={{ padding: 32, borderRight: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Checkout</h3>
                    <button onClick={resetCheckout} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
                  </div>

                  <StepIndicator />

                  {error && <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{error}</div>}

                  {/* Step 1 - Cart */}
                  {checkoutStep === 1 && (
                    <div>
                      <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>🛒 Review Your Cart</h4>
                      {cart.length === 0 ? (
                        <p style={{ color: "#64748b", textAlign: "center", padding: "30px 0" }}>Your cart is empty!</p>
                      ) : (
                        <>
                          {cart.map(item => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 48, height: 48, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
                                <div>
                                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{item.name}</p>
                                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Qty: {item.qty} × Nu. {item.price}</p>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontWeight: 700, color: "#1e40af" }}>Nu. {item.qty * item.price}</span>
                                <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✕</button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => setCheckoutStep(2)} disabled={cart.length === 0}
                            style={{ width: "100%", marginTop: 20, padding: "13px", background: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
                            Continue to Delivery →
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 2 - Delivery */}
                  {checkoutStep === 2 && (
                    <div>
                      <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>🚚 Delivery Option</h4>

                      <div onClick={() => setDeliveryOption("pickup")}
                        style={{ border: `2px solid ${deliveryOption === "pickup" ? "#1e40af" : "#e2e8f0"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, cursor: "pointer", background: deliveryOption === "pickup" ? "#eff6ff" : "white" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${deliveryOption === "pickup" ? "#1e40af" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {deliveryOption === "pickup" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1e40af" }} />}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>📍 Self Pick Up</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>Pick up your order from JNEC Fab Lab during working hours (9 AM - 5 PM)</p>
                          </div>
                        </div>
                      </div>

                      <div onClick={() => setDeliveryOption("delivery")}
                        style={{ border: `2px solid ${deliveryOption === "delivery" ? "#1e40af" : "#e2e8f0"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16, cursor: "pointer", background: deliveryOption === "delivery" ? "#eff6ff" : "white" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${deliveryOption === "delivery" ? "#1e40af" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {deliveryOption === "delivery" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1e40af" }} />}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>🚚 Ship to Address</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>We will ship your order to your provided address</p>
                          </div>
                        </div>
                      </div>

                      {deliveryOption === "delivery" && (
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Delivery Address</label>
                          <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={3}
                            placeholder="Enter your full delivery address..."
                            style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setCheckoutStep(1)}
                          style={{ flex: 1, padding: "12px", background: "white", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                          ← Back
                        </button>
                        <button onClick={() => setCheckoutStep(3)}
                          style={{ flex: 2, padding: "12px", background: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                          Continue to Payment →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 - Payment */}
                  {checkoutStep === 3 && (
                    <div>
                      <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>💳 Payment</h4>
                      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>Transfer the total amount to our bank account and upload the payment screenshot below.</p>

                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#1e40af" }}>🏦 Bank Transfer Details</p>
                        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>Bank: <strong>Bank of Bhutan</strong></p>
                        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>Account Name: <strong>JNEC Fab Lab</strong></p>
                        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>Account No: <strong>100XXXXXXXXX</strong></p>
                        <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>Amount: <strong style={{ color: "#1e40af", fontSize: 15 }}>Nu. {totalPrice}</strong></p>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>📸 Upload Payment Screenshot *</label>
                        <input type="file" accept="image/*" onChange={handleScreenshotChange}
                          style={{ width: "100%", padding: "10px", fontSize: 13, borderRadius: 8, border: "1.5px solid #e2e8f0", boxSizing: "border-box", background: "#f8fafc" }} />
                        {paymentPreview && (
                          <div style={{ marginTop: 12, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                            <img src={paymentPreview} alt="Payment proof" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
                            <p style={{ margin: 0, padding: "6px 12px", fontSize: 12, color: "#16a34a", fontWeight: 600, background: "#f0fdf4" }}>✅ Screenshot uploaded</p>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setCheckoutStep(2)}
                          style={{ flex: 1, padding: "12px", background: "white", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                          ← Back
                        </button>
                        <button onClick={placeOrder} disabled={orderLoading || !paymentScreenshot}
                          style={{ flex: 2, padding: "12px", background: !paymentScreenshot ? "#94a3b8" : "#16a34a", color: "white", border: "none", borderRadius: 10, cursor: !paymentScreenshot ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700 }}>
                          {orderLoading ? "Placing Order..." : "✅ Confirm Order"}
                        </button>
                      </div>
                      {!paymentScreenshot && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#f59e0b", textAlign: "center" }}>Please upload payment screenshot to proceed</p>}
                    </div>
                  )}
                </div>

                {/* Right - Order Summary */}
                <div style={{ padding: 28, background: "#f8fafc" }}>
                  <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Order Summary</h4>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 44, height: 44, background: "#e2e8f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.name.substring(0, 18)}...</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Qty: {item.qty}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Nu. {item.qty * item.price}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Items Total:</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Nu. {totalPrice}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Delivery:</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{deliveryOption === "pickup" ? "Free (Pickup)" : "To be confirmed"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "2px solid #e2e8f0" }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>Total:</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#1e40af" }}>Nu. {totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
