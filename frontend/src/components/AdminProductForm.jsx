import React, { useState } from "react";
import productService from "../services/productService";

const initialForm = {
  name: "",
  brand: "",
  category: "",
  concern: "",
  price: "",
  description: "",
  skin_type: "",
  image_url: "",
  product_url: "",
  ingredients: "",
};

const parameterOptions = [
  "Redness", "Pimples", "Dark Spots", "Wrinkles", "Texture",
  "Oiliness", "Dryness", "Skin Tone", "Tone Uniformity",
];

const AdminProductForm = ({ onCreated, onCancel, product }) => {
  const [form, setForm] = useState(product ? { ...initialForm, ...product, image_url: product.image || "" } : initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = product
        ? await productService.updateProductImage(product.id, form.image_url)
        : await productService.createProduct(form);
      onCreated(response.product);
      setForm(initialForm);
    } catch (error) {
      setMessage(error.message || "Unable to add product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card border-success shadow-sm mb-4" onSubmit={submit}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">{product ? "Edit Product Image" : "Add Product (Admin)"}</h5>
          <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
        </div>
        {message && <div className="alert alert-danger py-2">{message}</div>}
        <div className="row g-3">
          {[
            ["name", "Product name", true],
            ["brand", "Brand", false],
            ["category", "Category", false],
            ["price", "Price", false],
            ["skin_type", "Suitable skin type", false],
            ["image_url", "Image URL", false],
            ["product_url", "Product URL", false],
            ["ingredients", "Ingredients", false],
          ].map(([name, label, required]) => (
            <div className="col-md-6" key={name}>
              <label className="form-label fw-semibold" htmlFor={`product-${name}`}>{label}</label>
              <input id={`product-${name}`} name={name} value={form[name]} onChange={update} required={required} type={name === "price" ? "number" : "text"} min={name === "price" ? "0" : undefined} step={name === "price" ? "0.01" : undefined} className="form-control" />
            </div>
          ))}
          <div className="col-md-6">
            <label className="form-label fw-semibold" htmlFor="product-concern">Parameter / concern</label>
            <select id="product-concern" name="concern" value={form.concern} onChange={update} className="form-select">
              <option value="">General skincare</option>
              {parameterOptions.map((parameter) => (
                <option key={parameter} value={parameter}>{parameter}</option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" htmlFor="product-description">Description</label>
            <textarea id="product-description" name="description" value={form.description} onChange={update} className="form-control" rows="3" />
          </div>
        </div>
        <button className="btn btn-success mt-3" disabled={saving}>{saving ? "Saving..." : product ? "Save Image" : "Add Product"}</button>
      </div>
    </form>
  );
};

export default AdminProductForm;
