"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Package, Trash2, Plus, Pencil, X, Check, Upload as UploadIcon, Video } from "lucide-react";
import { useClient } from "@/lib/client-context";

type Product = {
  id: string;
  productName: string;
  keyBenefits: string | null;
  imageUrl: string | null;
  videoImageUrl: string | null;
  status: string;
};

export function ClientProductsTable({ clientSlug }: { clientSlug: string }) {
  const { clientId, storagePrefix } = useClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Add
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/clients/${clientSlug}/products`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [clientSlug]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/clients/${clientSlug}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: addName.trim() }),
      });
      if (res.ok) {
        load();
        setAddName("");
        setShowAdd(false);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${selected.size} product(s)?`)) return;
    for (const id of selected) {
      await fetch(`/api/clients/${clientSlug}/products/${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    load();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ productName: p.productName, keyBenefits: p.keyBenefits || "", imageUrl: p.imageUrl || "", videoImageUrl: p.videoImageUrl || "" });
  };

  const resizeImage = (file: File, maxW: number, maxH: number): Promise<Blob> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width: w, height: h } = img;
        if (w > maxW || h > maxH) { const r = Math.min(maxW / w, maxH / h); w = Math.round(w * r); h = Math.round(h * r); }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((b) => resolve(b!), "image/png", 0.95);
      };
      img.src = URL.createObjectURL(file);
    });

  const handleImageUpload = async (file: File, field: "imageUrl" | "videoImageUrl") => {
    if (!file.type.startsWith("image/")) return;
    const setUpState = field === "imageUrl" ? setUploading : setUploadingVideo;
    setUpState(true);
    try {
      let uploadFile: File | Blob = file;
      if (file.size > 4 * 1024 * 1024) {
        uploadFile = await resizeImage(file, field === "videoImageUrl" ? 1920 : 2048, field === "videoImageUrl" ? 1920 : 2048);
      }
      const formData = new FormData();
      formData.append("file", uploadFile, file.name);
      if (clientId) formData.append("clientId", clientId);
      formData.append("assetType", field === "videoImageUrl" ? "video-generation/products" : "products");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setEditForm((prev) => ({ ...prev, [field]: url }));
    } finally {
      setUpState(false);
    }
  };

  const triggerFileUpload = (field: "imageUrl" | "videoImageUrl") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleImageUpload(f, field);
    };
    input.click();
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientSlug}/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { load(); setEditingId(null); }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20">
              <Trash2 className="h-3 w-3" /> Delete {selected.size}
            </button>
          )}
          <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90">
            <Plus className="h-3 w-3" /> {showAdd ? "Cancel" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 rounded-lg border border-border p-3">
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Product name..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/30"
            autoFocus
          />
          <button type="submit" disabled={adding} className="inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50">
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Add
          </button>
        </form>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No products yet. Add products to use them in generation systems.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select all */}
          <div className="flex items-center gap-3 px-1">
            <input
              type="checkbox"
              checked={selected.size === products.length}
              onChange={() => selected.size === products.length ? setSelected(new Set()) : setSelected(new Set(products.map((p) => p.id)))}
              className="h-3.5 w-3.5 rounded border-border"
            />
            <span className="text-[11px] text-muted-foreground">Select all</span>
          </div>

          {products.map((product) => (
            <div key={product.id} className="rounded-lg border border-border/50 hover:border-border transition-colors">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="h-3.5 w-3.5 rounded border-border"
                />
                <div className="flex-1 min-w-0">
                  {editingId === product.id ? (
                    <input
                      value={editForm.productName || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, productName: e.target.value }))}
                      className="h-7 w-full rounded border border-border bg-background px-2 text-sm font-semibold outline-none focus:border-foreground/30"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{product.productName}</h3>
                      {product.videoImageUrl && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                          <Video className="h-2.5 w-2.5 text-primary" />
                          <span className="text-[9px] font-medium text-primary">9:16</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {editingId === product.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingId(null)} disabled={saving} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                    <button onClick={saveEdit} disabled={saving} className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10">
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(product)} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                )}
              </div>

              {/* Edit panel */}
              {editingId === product.id && (
                <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/20">
                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                    <textarea
                      value={editForm.keyBenefits || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, keyBenefits: e.target.value }))}
                      rows={3}
                      placeholder="Product description, key benefits, target use case..."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none resize-none focus:border-foreground/30"
                    />
                  </div>

                  {/* Reference Image */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Reference Image</label>
                    {editForm.imageUrl ? (
                      <div className="relative group">
                        <img src={editForm.imageUrl} alt="" className="w-full max-h-40 object-contain rounded-lg border border-border bg-card" />
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, imageUrl: "" }))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        ><X className="h-3 w-3" /></button>
                        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                      </div>
                    ) : (
                      <div
                        onClick={() => triggerFileUpload("imageUrl")}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer transition-colors hover:border-muted-foreground"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <UploadIcon className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground">Click to upload product image</span>
                      </div>
                    )}
                  </div>

                  {/* Video Reference Image (9:16) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      Video Reference Image (9:16)
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary normal-case tracking-normal">
                        <Video className="h-2.5 w-2.5" /> Video System
                      </span>
                    </label>
                    {editForm.videoImageUrl ? (
                      <div className="relative group">
                        <div className="flex justify-center bg-card rounded-lg border border-border p-2">
                          <img src={editForm.videoImageUrl} alt="" className="max-h-48 object-contain rounded" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, videoImageUrl: "" }))}
                          className="absolute top-3 right-3 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        ><X className="h-3 w-3" /></button>
                        {uploadingVideo && <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                      </div>
                    ) : (
                      <div
                        onClick={() => triggerFileUpload("videoImageUrl")}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/10"
                      >
                        {uploadingVideo ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Video className="h-5 w-5 text-primary" /></div>
                        )}
                        <span className="text-xs font-medium text-primary">Upload 9:16 product image</span>
                        <span className="text-[10px] text-muted-foreground text-center max-w-[220px]">Required for the Video Generation System. Must be portrait (9:16) format.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview row (collapsed) */}
              {editingId !== product.id && (product.imageUrl || product.videoImageUrl || product.keyBenefits) && (
                <div className="border-t border-border/30 px-4 py-2.5">
                  <div className="flex gap-4">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.productName} className="h-14 w-14 object-contain rounded border border-border bg-card shrink-0" />
                    )}
                    {product.videoImageUrl && (
                      <div className="relative shrink-0">
                        <img src={product.videoImageUrl} alt="" className="h-14 w-8 object-cover rounded border border-primary/30 bg-card" />
                        <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
                          <Video className="h-2 w-2 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <p className="flex-1 text-xs text-muted-foreground line-clamp-2">{product.keyBenefits || "No description"}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
