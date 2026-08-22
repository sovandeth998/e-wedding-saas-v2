"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Palette, Save, Upload, Image, Code, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const editThumbRef = useRef<HTMLInputElement>(null);
  const editPreviewRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const emptyForm = {
    name: "",
    description: "",
    category: "modern",
    is_premium: false,
    thumbnail_url: "",
    preview_url: "",
    config: "{}",
  };
  const [newTemplate, setNewTemplate] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `templates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) {
      toast.error("បរាជ័យក្នុងការបញ្ចូលរូបភាព");
      return null;
    }
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail_url" | "preview_url", isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("រូបភាពត្រូវតែតូចជាង 5MB");
      return;
    }
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, [field]: url }));
      } else {
        setNewTemplate((prev) => ({ ...prev, [field]: url }));
      }
      toast.success("បានបញ្ចូលរូបភាពដោយជោគជ័យ!");
    }
    setUploading(false);
    e.target.value = "";
  };

  const addTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះធៀបគំរូ");
      return;
    }
    let config = {};
    try {
      config = JSON.parse(newTemplate.config);
    } catch {
      toast.error("Config JSON មិនត្រឹមត្រូវ");
      return;
    }
    const { error } = await supabase.from("templates").insert({
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      is_premium: newTemplate.is_premium,
      thumbnail_url: newTemplate.thumbnail_url || null,
      preview_url: newTemplate.preview_url || null,
      config,
    });
    if (!error) {
      setAddDialogOpen(false);
      setNewTemplate(emptyForm);
      fetchTemplates();
      toast.success("បានបន្ថែមធៀបគំរូដោយជោគជ័យ!");
    } else {
      toast.error("បរាជ័យក្នុងការបន្ថែមធៀបគំរូ");
    }
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setEditForm({
      name: template.name || "",
      description: template.description || "",
      category: template.category || "modern",
      is_premium: template.is_premium || false,
      thumbnail_url: template.thumbnail_url || "",
      preview_url: template.preview_url || "",
      config: template.config ? (typeof template.config === "string" ? template.config : JSON.stringify(template.config, null, 2)) : "{}",
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះធៀបគំរូ");
      return;
    }
    let config = {};
    try {
      config = JSON.parse(editForm.config);
    } catch {
      toast.error("Config JSON មិនត្រឹមត្រូវ");
      return;
    }
    const { error } = await supabase
      .from("templates")
      .update({
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        is_premium: editForm.is_premium,
        thumbnail_url: editForm.thumbnail_url || null,
        preview_url: editForm.preview_url || null,
        config,
      })
      .eq("id", editingTemplate.id);
    if (!error) {
      setEditDialogOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
      toast.success("បានកែប្រែធៀបគំរូដោយជោគជ័យ!");
    } else {
      toast.error("បរាជ័យក្នុងការកែប្រែ");
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបធៀបគំរូនេះទេ?")) return;
    await supabase.from("templates").delete().eq("id", id);
    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("បានលុបធៀបគំរូ");
  };

  const categoryLabels: Record<string, string> = {
    modern: "សម័យ",
    classic: "ប្រពៃណី",
    luxury: "ប្រណិត",
  };

  const TemplateForm = ({
    form,
    setForm,
    isEdit,
    thumbRef,
    previewRef,
    onUpload,
  }: {
    form: typeof emptyForm;
    setForm: (f: typeof emptyForm) => void;
    isEdit: boolean;
    thumbRef: React.RefObject<HTMLInputElement>;
    previewRef: React.RefObject<HTMLInputElement>;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail_url" | "preview_url") => void;
  }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-secondary">ឈ្មោះ *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="ឈ្មោះធៀបគំរូ"
          className="border-gold-200"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-secondary">ការពិពណ៌នា</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="ការពិពណ៌នា"
          className="border-gold-200"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-secondary">ប្រភេទ</Label>
        <div className="flex gap-2">
          {["modern", "classic", "luxury"].map((cat) => (
            <Button
              key={cat}
              variant={form.category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setForm({ ...form, category: cat })}
              className={form.category === cat ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}
            >
              {categoryLabels[cat]}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-secondary">រូបភាព Thumbnail</Label>
        <div className="flex gap-2">
          <Input
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            placeholder="URL រូបភាព"
            className="border-gold-200 flex-1"
          />
          <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, "thumbnail_url")} />
          <Button type="button" variant="outline" size="sm" className="gap-1 border-gold-200" onClick={() => thumbRef.current?.click()} disabled={uploading}>
            <Upload className="h-3 w-3" /> {uploading ? "កំពុងបញ្ចូល..." : "បញ្ចូល"}
          </Button>
        </div>
        {form.thumbnail_url && (
          <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-gold-50 border border-gold-200">
            <img src={form.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-secondary">រូបភាព Preview</Label>
        <div className="flex gap-2">
          <Input
            value={form.preview_url}
            onChange={(e) => setForm({ ...form, preview_url: e.target.value })}
            placeholder="URL រូបភាព preview"
            className="border-gold-200 flex-1"
          />
          <input ref={previewRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, "preview_url")} />
          <Button type="button" variant="outline" size="sm" className="gap-1 border-gold-200" onClick={() => previewRef.current?.click()} disabled={uploading}>
            <Upload className="h-3 w-3" /> {uploading ? "កំពុងបញ្ចូល..." : "បញ្ចូល"}
          </Button>
        </div>
        {form.preview_url && (
          <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden bg-gold-50 border border-gold-200">
            <img src={form.preview_url} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-secondary flex items-center gap-1">
          <Code className="h-3 w-3" /> Config (JSON)
        </Label>
        <Textarea
          value={form.config}
          onChange={(e) => setForm({ ...form, config: e.target.value })}
          placeholder='{"primaryColor": "#b8860b", "font": "Kantumruy Pro"}'
          className="border-gold-200 font-mono text-xs h-28"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_premium}
          onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
          id={`premium-${isEdit ? "edit" : "new"}`}
          className="accent-primary"
        />
        <Label htmlFor={`premium-${isEdit ? "edit" : "new"}`} className="text-secondary">ធៀបគំរូ Premium</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">គ្រប់គ្រងធៀបគំរូ</h1>
          <p className="text-muted-foreground">ធៀបគំរូសរុប {templates.length}</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2 bg-gold-gradient text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> បន្ថែមធៀបគំរូ
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
              <div className="aspect-video bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center overflow-hidden">
                {template.thumbnail_url || template.preview_url ? (
                  <img src={template.thumbnail_url || template.preview_url} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <Palette className="h-8 w-8 text-primary" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-secondary truncate">{template.name}</h3>
                  <div className="flex gap-1 shrink-0">
                    <Badge className={`${template.is_premium ? "bg-gold-gradient text-white" : ""} border-0 text-xs`}>
                      {template.is_premium ? "Premium" : "ឥតគិតថ្លៃ"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-gold-200 text-xs">{categoryLabels[template.category] || template.category}</Badge>
                  {template.config && Object.keys(template.config).length > 0 && (
                    <Badge variant="outline" className="border-blue-200 text-blue-600 text-xs">
                      <Code className="h-2.5 w-2.5 mr-0.5" /> Config
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description || "មិនមានការពិពណ៌នា"}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50" onClick={() => openEditDialog(template)}>
                    <Edit className="h-3 w-3" /> កែប្រែ
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-red-500 border-red-200 hover:bg-red-50" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 className="h-3 w-3" /> លុប
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-secondary">បន្ថែមធៀបគំរូថ្មី</DialogTitle>
          </DialogHeader>
          <TemplateForm
            form={newTemplate}
            setForm={setNewTemplate}
            isEdit={false}
            thumbRef={thumbInputRef}
            previewRef={previewInputRef}
            onUpload={(e, field) => handleImageUpload(e, field, false)}
          />
          <Button onClick={addTemplate} className="w-full bg-gold-gradient text-white hover:opacity-90" disabled={uploading}>
            <Plus className="h-4 w-4 mr-2" /> បន្ថែមធៀបគំរូ
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-secondary">កែប្រែធៀបគំរូ</DialogTitle>
          </DialogHeader>
          <TemplateForm
            form={editForm}
            setForm={setEditForm}
            isEdit={true}
            thumbRef={editThumbRef}
            previewRef={editPreviewRef}
            onUpload={(e, field) => handleImageUpload(e, field, true)}
          />
          <Button onClick={saveEdit} className="w-full bg-gold-gradient text-white hover:opacity-90 gap-2" disabled={uploading}>
            <Save className="h-4 w-4" /> រក្សាទុក
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
