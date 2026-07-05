"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  getActiveServices,
  upsertService,
  deleteService,
} from "@/lib/supabase/queries/services";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  what_included: string[] | null;
  process_steps: string[] | null;
  duration_hrs: string | null;
  icon: string | null;
  image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  pricing_unit: string | null;
  pricing_model: string | null;
  is_active: boolean;
  sort_order: number | null;
}

const emptyForm = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  what_included: "",
  process_steps: "",
  duration_hrs: "",
  icon: "",
  image_url: "",
  min_price: 0,
  max_price: 0,
  pricing_unit: "sq.ft",
  pricing_model: "per_sqft",
  sort_order: 0,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getActiveServices()
      .then(({ data }) => {
        if (data) setServices(data as ServiceRow[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openEdit = (svc: ServiceRow) => {
    setSlugEdited(true);
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      slug: svc.slug,
      tagline: svc.tagline || "",
      description: svc.description || "",
      what_included: (svc.what_included || []).join("\n"),
      process_steps: (svc.process_steps || []).join("\n"),
      duration_hrs: svc.duration_hrs || "",
      icon: svc.icon || "",
      image_url: svc.image_url || "",
      min_price: svc.min_price ?? 0,
      max_price: svc.max_price ?? 0,
      pricing_unit: svc.pricing_unit || "sq.ft",
      pricing_model: svc.pricing_model || "per_sqft",
      sort_order: svc.sort_order || 0,
    });
    setModal("edit");
  };

  const openAdd = () => {
    setSlugEdited(false);
    setEditingId(null);
    setForm(emptyForm);
    setModal("add");
  };

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" && !slugEdited && !editingId) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("tags", "services");
      const res = await fetch("/api/upload", { method: "POST", body: uploadForm });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((prev) => ({ ...prev, image_url: data.url }));
      toast("Image uploaded");
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const whatIncluded = form.what_included
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const processSteps = form.process_steps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      name: form.name,
      slug: form.slug,
      tagline: form.tagline || null,
      description: form.description || null,
      what_included: whatIncluded.length > 0 ? whatIncluded : null,
      process_steps: processSteps.length > 0 ? processSteps : null,
      duration_hrs: form.duration_hrs || null,
      icon: form.icon || null,
      image_url: form.image_url || null,
      min_price: form.min_price,
      max_price: form.max_price,
      pricing_unit: form.pricing_unit,
      pricing_model: form.pricing_model,
      sort_order: form.sort_order,
      is_active: true,
    };

    if (editingId) payload.id = editingId;

    const { data, error } = await upsertService(payload);
    if (error) {
      toast("Failed to save service", "error");
    } else if (data) {
      setServices((prev) => {
        const idx = prev.findIndex((s) => s.id === data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data as ServiceRow;
          return next;
        }
        return [data as ServiceRow, ...prev];
      });
      toast(editingId ? "Service updated" : "Service created");
    }
    setSaving(false);
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteService(deleteTarget);
    setServices((prev) => prev.filter((s) => s.id !== deleteTarget));
    setDeleting(false);
    setDeleteTarget(null);
    toast("Service deleted");
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-24 bg-white/5 rounded-8" />
          <div className="h-9 w-32 bg-white/5 rounded-full" />
        </div>
        <div className="bg-[#161714] border border-white/6 rounded-12 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/4">
              <div className="h-8 w-8 bg-white/5 rounded-8" />
              <div className="flex-1 h-4 w-40 bg-white/5 rounded-8" />
              <div className="h-4 w-24 bg-white/5 rounded-8" />
              <div className="h-6 w-16 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white/85">Services</h2>
        <button
          className="px-4 py-2 bg-accent text-white rounded-full text-xs font-medium hover:bg-accent2 transition-all cursor-pointer"
          onClick={openAdd}
        >
          + Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-sm">
          No services yet.
        </div>
      ) : (
        <div className="bg-[#161714] border border-white/6 rounded-12 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/4">
                {["Name", "Slug", "Duration", "Price Range", "Sort", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`text-[10px] tracking-widest uppercase text-white/25 px-5 py-2.5 text-left whitespace-nowrap ${
                      h === "Slug" || h === "Sort" || h === "Price Range" ? "max-md:hidden" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr
                  key={svc.id}
                  className="border-b border-white/3 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {svc.image_url ? (
                        <img
                          src={svc.image_url}
                          alt={svc.name}
                          className="w-9 h-9 rounded-8 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-8 bg-white/5 flex items-center justify-center text-sm shrink-0">
                          {svc.icon || "📦"}
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-white/75 block leading-tight">
                          {svc.icon} {svc.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-[11px] text-white/40 max-md:hidden">
                    {svc.slug}
                  </td>
                  <td className="text-xs text-white/50">{svc.duration_hrs || "—"}</td>
                  <td className="text-xs text-white/50 max-md:hidden">
                    {svc.min_price != null && svc.max_price != null
                      ? svc.min_price === svc.max_price
                        ? `₹${svc.min_price}`
                        : `₹${svc.min_price} – ₹${svc.max_price}`
                      : "—"}
                  </td>
                  <td className="text-xs text-white/50 max-md:hidden">{svc.sort_order ?? "—"}</td>
                  <td className="px-5 whitespace-nowrap">
                    <div className="flex gap-1">
                      <span
                        className="w-[26px] h-[26px] inline-flex items-center justify-center rounded-[5px] cursor-pointer text-white/25 hover:text-accent2 hover:bg-[rgba(61,89,72,0.12)] transition-all text-xs"
                        onClick={() => openEdit(svc)}
                      >
                        ✎
                      </span>
                      <span
                        className="w-[26px] h-[26px] inline-flex items-center justify-center rounded-[5px] cursor-pointer text-white/25 hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] transition-all text-xs"
                        onClick={() => setDeleteTarget(svc.id)}
                      >
                        ✕
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#161714] border border-white/6 rounded-16 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-white/85 mb-5">
              {editingId ? "Edit Service" : "Add Service"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Name
                </label>
                <input
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Slug
                </label>
                <input
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40 font-mono"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Tagline
                </label>
                <input
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                  value={form.tagline}
                  onChange={(e) => updateForm("tagline", e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Description
                </label>
                <textarea
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40 resize-none h-20"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  What&apos;s Included <span className="text-white/15">(one per line)</span>
                </label>
                <textarea
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40 resize-none h-16"
                  value={form.what_included}
                  onChange={(e) => updateForm("what_included", e.target.value)}
                  placeholder="Surface inspection &amp; scratch assessment&#10;Diamond grinding (coarse to fine grits)"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Process Steps <span className="text-white/15">(one per line)</span>
                </label>
                <textarea
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40 resize-none h-16"
                  value={form.process_steps}
                  onChange={(e) => updateForm("process_steps", e.target.value)}
                  placeholder="Inspect floor condition&#10;Diamond grinding with finer grits"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                    Duration
                  </label>
                  <input
                    className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                    value={form.duration_hrs}
                    onChange={(e) => updateForm("duration_hrs", e.target.value)}
                    placeholder="e.g. 3–6 hours"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                    Icon <span className="text-white/15">(emoji)</span>
                  </label>
                  <input
                    className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                    value={form.icon}
                    onChange={(e) => updateForm("icon", e.target.value)}
                    placeholder="💎"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Image
                </label>
                {form.image_url ? (
                  <div className="relative rounded-8 overflow-hidden border border-white/6 mb-2">
                    <img
                      src={form.image_url}
                      alt="Service preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 rounded-full text-white/70 hover:text-[#EF4444] text-xs cursor-pointer"
                      onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex items-center justify-center h-20 border border-dashed border-white/6 rounded-8 cursor-pointer transition-all text-xs ${
                      uploading
                        ? "bg-white/5 animate-pulse text-white/30"
                        : "text-white/30 hover:border-accent2/40 hover:text-white/50"
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      "+ Upload Image"
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                {form.image_url && (
                  <div className="text-[10px] text-white/20 truncate mt-1">
                    {form.image_url}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                    Min Price
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                    value={form.min_price}
                    onChange={(e) => updateForm("min_price", parseInt(e.target.value) || 0)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                    Max Price
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                    value={form.max_price}
                    onChange={(e) => updateForm("max_price", parseInt(e.target.value) || 0)}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                    Pricing Unit
                  </label>
                  <input
                    className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                    value={form.pricing_unit}
                    onChange={(e) => updateForm("pricing_unit", e.target.value)}
                    placeholder="sq.ft"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                    Pricing Model
                  </label>
                  <select
                    className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                    value={form.pricing_model}
                    onChange={(e) => updateForm("pricing_model", e.target.value)}
                  >
                    <option value="per_sqft">per sq.ft</option>
                    <option value="per_unit">per unit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-white/25 mb-1 block">
                  Sort Order
                </label>
                <input
                  type="number"
                  className="w-full bg-black/20 border border-white/6 rounded-8 px-3 py-2 text-sm text-white/70 outline-none focus:border-accent2/40"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                className="px-4 py-2 bg-white/5 border border-white/6 text-white/50 rounded-full text-xs hover:text-white/70 transition-all cursor-pointer"
                onClick={() => setModal(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  saving
                    ? "bg-accent/50 text-white/50 animate-pulse"
                    : "bg-accent text-white hover:bg-accent2"
                }`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  editingId ? "Save" : "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
