"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Palette, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "modern",
    is_premium: false,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "modern",
    is_premium: false,
  });
  const supabase = createClient();

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

  const addTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះធៀបគំរូ");
      return;
    }
    const { error } = await supabase.from("templates").insert(newTemplate);
    if (!error) {
      setAddDialogOpen(false);
      setNewTemplate({ name: "", description: "", category: "modern", is_premium: false });
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
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះធៀបគំរូ");
      return;
    }
    const { error } = await supabase
      .from("templates")
      .update({
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        is_premium: editForm.is_premium,
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
              <div className="aspect-video bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-secondary">{template.name}</h3>
                  <div className="flex gap-1">
                    <Badge className={`${template.is_premium ? "bg-gold-gradient text-white" : ""} border-0`}>
                      {template.is_premium ? "Premium" : "ឥតគិតថ្លៃ"}
                    </Badge>
                    <Badge variant="outline" className="border-gold-200">{categoryLabels[template.category] || template.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description || "មិនមានការពិពណ៌នា"}</p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-secondary">បន្ថែមធៀបគំរូថ្មី</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-secondary">ឈ្មោះ</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="ឈ្មោះធៀបគំរូ"
                className="border-gold-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-secondary">ការពិពណ៌នា</Label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
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
                    variant={newTemplate.category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTemplate({ ...newTemplate, category: cat })}
                    className={newTemplate.category === cat ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}
                  >
                    {categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newTemplate.is_premium}
                onChange={(e) => setNewTemplate({ ...newTemplate, is_premium: e.target.checked })}
                id="premium-new"
                className="accent-primary"
              />
              <Label htmlFor="premium-new" className="text-secondary">ធៀបគំរូ Premium</Label>
            </div>
            <Button onClick={addTemplate} className="w-full bg-gold-gradient text-white hover:opacity-90">បន្ថែមធៀបគំរូ</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-secondary">កែប្រែធៀបគំរូ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-secondary">ឈ្មោះ</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="ឈ្មោះធៀបគំរូ"
                className="border-gold-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-secondary">ការពិពណ៌នា</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                    variant={editForm.category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, category: cat })}
                    className={editForm.category === cat ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}
                  >
                    {categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_premium}
                onChange={(e) => setEditForm({ ...editForm, is_premium: e.target.checked })}
                id="premium-edit"
                className="accent-primary"
              />
              <Label htmlFor="premium-edit" className="text-secondary">ធៀបគំរូ Premium</Label>
            </div>
            <Button onClick={saveEdit} className="w-full bg-gold-gradient text-white hover:opacity-90 gap-2">
              <Save className="h-4 w-4" /> រក្សាទុក
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
