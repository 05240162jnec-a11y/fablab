import { useState, useEffect } from "react";
import axios from "axios";

const categories = ["3D Printing", "Laser Cutting", "Electronics", "Safety", "Finishing", "CNC", "Other"];
const units = ["piece", "kg", "g", "ml", "l", "meter", "set"];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    unit: "piece",
    is_available: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openAddForm = () => {
    setEditProduct(null);
    setForm({ name: "", category: "", description: "", price: "", stock: "", unit: "piece", is_available: true });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      is_available: product.is_available,
    });
    setImageFile(null);
    setImagePreview(product.image_url || null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // use FormData to send image
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("unit", form.unit);
    formData.append("is_available", form.is_available ? 1 : 0);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editProduct) {
        formData.append("_method", "PUT");
        await axios.post(
          `http://127.0.0.1:8000/api/admin/products/${editProduct.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        setMessage("Product updated successfully");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/admin/products",
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        setMessage("Product added successfully");
      }
      setShowForm(false);
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to save product");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Product deleted successfully");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to delete product");
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Product Management</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Add and manage products for users to book</p>
        </div>
        <button
          onClick={openAddForm}
          style={{ padding: "10px 20px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          + Add Product
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#16a34a", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading products...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {products.map((product) => (
            <div key={product.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              {/* Product Image */}
              <div style={{ width: "100%", height: 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 40, color: "#94a3b8" }}>No Image</span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: 14 }}>
                <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                  {product.category}
                </span>
                <h4 style={{ margin: "8px 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{product.name}</h4>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{product.description?.substring(0, 60)}...</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1e40af" }}>Nu. {product.price}/{product.unit}</span>
                  <span style={{ fontSize: 11, color: product.stock < 10 ? "#f59e0b" : "#16a34a", fontWeight: 600 }}>
                    Stock: {product.stock}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: product.is_available ? "#dcfce7" : "#fee2e2", color: product.is_available ? "#16a34a" : "#dc2626" }}>
                  {product.is_available ? "Available" : "Unavailable"}
                </span>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => openEditForm(product)}
                    style={{ flex: 1, padding: "6px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{ flex: 1, padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>
              No products yet. Click Add Product to get started!
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>x</button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Product Image</label>
                <div
                  onClick={() => document.getElementById("productImage").click()}
                  style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", background: "#f8fafc" }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div>
                      <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Click to upload image</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>JPG, PNG (Max 2MB)</p>
                    </div>
                  )}
                </div>
                <input id="productImage" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </div>

              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Product Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Category and Unit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} required
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>

              {/* Price and Stock */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Price (Nu.)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="0"
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Stock</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
                    style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Available */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} />
                  Available for booking
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit"
                  style={{ flex: 1, padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                  {editProduct ? "Update Product" : "Add Product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "12px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}