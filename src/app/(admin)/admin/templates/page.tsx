"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Palette } from "lucide-react";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
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
    const { error } = await supabase.from("templates").insert(newTemplate);
    if (!error) {
      setDialogOpen(false);
      setNewTemplate({ name: "", description: "", category: "modern", is_premium: false });
      fetchTemplates();
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបធៀបគំរូនេះទេ?")) return;
    await supabase.from("templates").delete().eq("id", id);
    setTemplates(templates.filter((t) => t.id !== id));
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> បន្ថែមធៀបគំរូ
            </Button>
          </DialogTrigger>
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
                  id="premium"
                  className="accent-primary"
                />
                <Label htmlFor="premium" className="text-secondary">ធៀបគំរូ Premium</Label>
              </div>
              <Button onClick={addTemplate} className="w-full bg-gold-gradient text-white hover:opacity-90">បន្ថែមធៀបគំរូ</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
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
    </div>
  );
}
