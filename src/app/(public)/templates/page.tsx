"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, Crown, Star, Check } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  category: string;
  isPremium: boolean;
  description: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: "1",
    name: "ផ្កាឈូករ៉ូមែនទិច",
    category: "modern",
    isPremium: false,
    description: "ពុម្ពរ៉ូមែនទិចជាមួយពណ៌មាសផ្កាឈូក",
    features: ["រចនាបែបទំនើប", "ពណ៌ផ្កាឈូករ៉ូមែនទិច", "ងាយស្រួលកែសម្រួល", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
  },
  {
    id: "2",
    name: "មាសប្រណិត",
    category: "luxury",
    isPremium: true,
    description: "ប្រធានបទមាសប្រណិតសម្រាប់រោងពិធីប្រណិត",
    features: ["រចនាបែបប្រណិត", "ពណ៌មាសទាំងស្រុង", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
  },
  {
    id: "3",
    name: "ប្រពៃណីខ្មែរ",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបប្រពៃណីខ្មែរសម្រាប់រោងពិធីបុរាណ",
    features: ["រចនាបែបប្រពៃណីខ្មែរ", "លំនាំបុរាណ", "ពណ៌ប្រពៃណី", "អក្សរខ្មែរបុរាណ"],
  },
  {
    id: "4",
    name: "សម័យទំនើប",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបសម័យទំនើប ស្អាត និងសាមញ្ញ",
    features: ["រចនាបែបសម័យ", "សាមញ្ញនិងស្អាត", "ងាយស្រួលអាន", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
  },
  {
    id: "5",
    name: "រាជវាំង",
    category: "luxury",
    isPremium: true,
    description: "រចនាបែបរាជវាំងប្រណិត",
    features: ["រចនាបែបរាជវាំង", "ពណ៌មាសនិងស", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
  },
  {
    id: "6",
    name: "សួនច្បារ",
    category: "modern",
    isPremium: false,
    description: "ប្រធានបទសួនច្បារធម្មជាតិ",
    features: ["រចនាបែបធម្មជាតិ", "ពណ៌បៃតងស្រស់ស្អាត", "ផ្កានិងសួនច្បារ", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
  },
  {
    id: "7",
    name: "ផ្កាឈូកពណ៌ស",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបប្រពៃណីជាមួយផ្កាឈូកពណ៌ស",
    features: ["រចនាបែបប្រពៃណី", "ផ្កាឈូកពណ៌ស", "លំនាំបុរាណ", "ពណ៌ស្រទាប់"],
  },
  {
    id: "8",
    name: "ភ្លើងបំភ្លឺ",
    category: "luxury",
    isPremium: true,
    description: "ប្រធានបទភ្លើងបំភ្លឺប្រណិត",
    features: ["រចនាបែបប្រណិត", "ភ្លើងបំភ្លឺពិសេស", "ពណ៌មាសភ្លឺ", "ប្រសិទ្ធភាពពិសេស"],
  },
  {
    id: "9",
    name: "ទឹកជ្រោះ",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបធម្មជាតិជាមួយទឹកជ្រោះ",
    features: ["រចនាបែបធម្មជាតិ", "ទឹកជ្រោះស្រស់ស្អាត", "ពណ៌ខៀវនិងបៃតង", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
  },
  {
    id: "10",
    name: "ពណ៌ផ្កាឈូក",
    category: "luxury",
    isPremium: true,
    description: "រចនាបែបប្រណិតពណ៌ផ្កាឈូក",
    features: ["រចនាបែបប្រណិត", "ពណ៌ផ្កាឈូកទាំងស្រុង", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
  },
  {
    id: "11",
    name: "បុរាណ",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបបុរាណខ្មែរ",
    features: ["រចនាបែបបុរាណខ្មែរ", "លំនាំបុរាណ", "អក្សរបុរាណ", "ពណ៌ប្រពៃណី"],
  },
  {
    id: "12",
    name: "ទំនើប",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបទំនើបសាមញ្ញ",
    features: ["រចនាបែបទំនើប", "សាមញ្ញនិងស្អាត", "ងាយស្រួលប្រើប្រាស់", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
  },
];

const categories = [
  { key: "all", label: "ទាំងអស់" },
  { key: "modern", label: "សម័យទំនើប" },
  { key: "classic", label: "ប្រពៃណី" },
  { key: "luxury", label: "ប្រណិត" },
];

const categoryColors: Record<string, string> = {
  modern: "bg-blue-100 text-blue-700",
  classic: "bg-amber-100 text-amber-700",
  luxury: "bg-purple-100 text-purple-700",
};

const categoryLabels: Record<string, string> = {
  modern: "សម័យទំនើប",
  classic: "ប្រពៃណី",
  luxury: "ប្រណិត",
};

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">
          ពុម្ពលិខិត
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary">
          ពុម្ពលិខិតអញ្ជើញរោងពិធីរៀបការ
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ជ្រើសរើសពីស្តុកពុម្ពដ៏ស្អាតរបស់យើងដែលរចនាដោយអ្នកជំនាញ។
          យើងមានពុម្ពសម្រាប់រោងពិធីគ្រប់ប្រភេទ។
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-10 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.key}
            variant={activeCategory === cat.key ? "default" : "outline"}
            size="sm"
            className={
              activeCategory === cat.key
                ? "bg-gold-gradient text-white"
                : "border-gold-300 text-primary hover:bg-gold-50"
            }
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
            {cat.key !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({templates.filter((t) => t.category === cat.key).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((template) => (
          <Card
            key={template.id}
            className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 cursor-pointer"
          >
            <div
              className="aspect-[3/4] bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 relative overflow-hidden"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gold-300 text-sm font-medium">
                  មើលជាមុន
                </span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  className="bg-gold-gradient text-white hover:opacity-90 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                  }}
                >
                  <Eye className="h-4 w-4" /> មើលជាមុន
                </Button>
              </div>
              {template.isPremium && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gold-gradient text-white gap-1 shadow-lg">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-secondary">{template.name}</h3>
                <Badge
                  className={`text-xs ${categoryColors[template.category] || ""}`}
                  variant="secondary"
                >
                  {categoryLabels[template.category]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <Link href={`/templates/${template.id}`}>
                <Button
                  className="w-full bg-gold-gradient text-white hover:opacity-90"
                  size="sm"
                >
                  ប្រើពុម្ពនេះ
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            មិនមានពុម្ពក្នុងប្រភេទនេះទេ
          </p>
        </div>
      )}

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl text-secondary">
                    {selectedTemplate.name}
                  </DialogTitle>
                  {selectedTemplate.isPremium && (
                    <Badge className="bg-gold-gradient text-white gap-1">
                      <Crown className="h-3 w-3" /> Premium
                    </Badge>
                  )}
                </div>
                <DialogDescription>{selectedTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="aspect-[16/10] bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 rounded-lg flex items-center justify-center border border-gold-200">
                <div className="text-center">
                  <Star className="h-12 w-12 text-gold-300 mx-auto mb-3" />
                  <p className="text-gold-400 font-medium">មើលជាមុនពុម្ព</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-secondary mb-3">មុខងាររួមបញ្ចូល</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href={`/templates/${selectedTemplate.id}`} className="flex-1">
                  <Button className="w-full bg-gold-gradient text-white hover:opacity-90 gap-2">
                    <Eye className="h-4 w-4" /> មើលព័ត៌មានពេញ
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-gold-300 text-primary hover:bg-gold-50"
                  >
                    ប្រើពុម្ពនេះ
                  </Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
