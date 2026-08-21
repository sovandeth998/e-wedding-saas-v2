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
import { Eye, Crown, Check, Heart } from "lucide-react";
import Link from "next/link";

interface TemplateColors {
  bg: string;
  textPri: string;
  accent: string;
  btnFrom: string;
  btnTo: string;
}

interface Template extends TemplateColors {
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
    description: "ធៀបគំរូរ៉ូមែនទិចជាមួយពណ៌មាសផ្កាឈូក",
    features: ["រចនាបែបទំនើប", "ពណ៌ផ្កាឈូករ៉ូមែនទិច", "ងាយស្រួលកែសម្រួល", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    bg: "linear-gradient(180deg, #fdf8f0, #f5edd8, #efe4c8)",
    textPri: "#6b4c1e",
    accent: "#b8860b",
    btnFrom: "#d4a843",
    btnTo: "#b8860b",
  },
  {
    id: "2",
    name: "មាសប្រណិត",
    category: "luxury",
    isPremium: true,
    description: "ប្រធានបទមាសប្រណិតសម្រាប់រោងពិធីប្រណិត",
    features: ["រចនាបែបប្រណិត", "ពណ៌មាសទាំងស្រុង", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
    bg: "linear-gradient(135deg, #1a1a0e, #2d2a1e, #3d3520)",
    textPri: "#fef3c7",
    accent: "#f59e0b",
    btnFrom: "#d97706",
    btnTo: "#92400e",
  },
  {
    id: "3",
    name: "ប្រពៃណីខ្មែរ",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបប្រពៃណីខ្មែរសម្រាប់រោងពិធីបុរាណ",
    features: ["រចនាបែបប្រពៃណីខ្មែរ", "លំនាំបុរាណ", "ពណ៌ប្រពៃណី", "អក្សរខ្មែរបុរាណ"],
    bg: "linear-gradient(135deg, #2e1a1a, #3e1616, #601010)",
    textPri: "#fecaca",
    accent: "#ef4444",
    btnFrom: "#dc2626",
    btnTo: "#991b1b",
  },
  {
    id: "4",
    name: "សម័យទំនើប",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបសម័យទំនើប ស្អាត និងសាមញ្ញ",
    features: ["រចនាបែបសម័យ", "សាមញ្ញនិងស្អាត", "ងាយស្រួលអាន", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    bg: "linear-gradient(135deg, #0e1a2e, #16213e, #1e3a5e)",
    textPri: "#bfdbfe",
    accent: "#3b82f6",
    btnFrom: "#2563eb",
    btnTo: "#1d4ed8",
  },
  {
    id: "5",
    name: "រាជវាំង",
    category: "luxury",
    isPremium: true,
    description: "រចនាបែបរាជវាំងប្រណិត",
    features: ["រចនាបែបរាជវាំង", "ពណ៌មាសនិងស", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
    bg: "linear-gradient(135deg, #1a0e2e, #2e1640, #401060)",
    textPri: "#ddd6fe",
    accent: "#a855f7",
    btnFrom: "#9333ea",
    btnTo: "#7e22ce",
  },
  {
    id: "6",
    name: "សួនច្បារ",
    category: "modern",
    isPremium: false,
    description: "ប្រធានបទសួនច្បារធម្មជាតិ",
    features: ["រចនាបែបធម្មជាតិ", "ពណ៌បៃតងស្រស់ស្អាត", "ផ្កានិងសួនច្បារ", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    bg: "linear-gradient(135deg, #0e2e1a, #163e21, #106030)",
    textPri: "#bbf7d0",
    accent: "#22c55e",
    btnFrom: "#16a34a",
    btnTo: "#15803d",
  },
  {
    id: "7",
    name: "ផ្កាឈូកពណ៌ស",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបប្រពៃណីជាមួយផ្កាឈូកពណ៌ស",
    features: ["រចនាបែបប្រពៃណី", "ផ្កាឈូកពណ៌ស", "លំនាំបុរាណ", "ពណ៌ស្រទាប់"],
    bg: "linear-gradient(135deg, #1a1a1e, #2e2e32, #404045)",
    textPri: "#e2e8f0",
    accent: "#94a3b8",
    btnFrom: "#64748b",
    btnTo: "#475569",
  },
  {
    id: "8",
    name: "ភ្លើងបំភ្លឺ",
    category: "luxury",
    isPremium: true,
    description: "ប្រធានបទភ្លើងបំភ្លឺប្រណិត",
    features: ["រចនាបែបប្រណិត", "ភ្លើងបំភ្លឺពិសេស", "ពណ៌មាសភ្លឺ", "ប្រសិទ្ធភាពពិសេស"],
    bg: "linear-gradient(135deg, #2e1a0e, #402e16, #604010)",
    textPri: "#fde68a",
    accent: "#fbbf24",
    btnFrom: "#f59e0b",
    btnTo: "#d97706",
  },
  {
    id: "9",
    name: "ទឹកជ្រោះ",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបធម្មជាតិជាមួយទឹកជ្រោះ",
    features: ["រចនាបែបធម្មជាតិ", "ទឹកជ្រោះស្រស់ស្អាត", "ពណ៌ខៀវនិងបៃតង", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    bg: "linear-gradient(135deg, #0e2e2e, #163e3e, #106060)",
    textPri: "#a5f3fc",
    accent: "#06b6d4",
    btnFrom: "#0891b2",
    btnTo: "#0e7490",
  },
  {
    id: "10",
    name: "ពណ៌ផ្កាឈូក",
    category: "luxury",
    isPremium: true,
    description: "រចនាបែបប្រណិតពណ៌ផ្កាឈូក",
    features: ["រចនាបែបប្រណិត", "ពណ៌ផ្កាឈូកទាំងស្រុង", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
    bg: "linear-gradient(135deg, #2e0e2e, #401640, #601060)",
    textPri: "#f5d0fe",
    accent: "#d946ef",
    btnFrom: "#c026d3",
    btnTo: "#a21caf",
  },
  {
    id: "11",
    name: "បុរាណ",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបបុរាណខ្មែរ",
    features: ["រចនាបែបបុរាណខ្មែរ", "លំនាំបុរាណ", "អក្សរបុរាណ", "ពណ៌ប្រពៃណី"],
    bg: "linear-gradient(135deg, #2e1a0e, #3e2e16, #504010)",
    textPri: "#fde68a",
    accent: "#d97706",
    btnFrom: "#b45309",
    btnTo: "#92400e",
  },
  {
    id: "12",
    name: "ទំនើប",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបទំនើបសាមញ្ញ",
    features: ["រចនាបែបទំនើប", "សាមញ្ញនិងស្អាត", "ងាយស្រួលប្រើប្រាស់", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    bg: "linear-gradient(135deg, #1a1a1e, #2e2e32, #3e3e42)",
    textPri: "#e5e7eb",
    accent: "#9ca3af",
    btnFrom: "#6b7280",
    btnTo: "#4b5563",
  },
];

const categories = [
  { key: "all", label: "ទាំងអស់" },
  { key: "modern", label: "សម័យទំនើប" },
  { key: "classic", label: "ប្រពៃណី" },
  { key: "luxury", label: "ប្រណិត" },
];

const categoryLabels: Record<string, string> = {
  modern: "សម័យទំនើប",
  classic: "ប្រពៃណី",
  luxury: "ប្រណិត",
};

function TemplatePreview({
  template,
  large = false,
}: {
  template: Template;
  large?: boolean;
}) {
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden ${
        large ? "rounded-xl" : ""
      }`}
      style={{ background: template.bg }}
    >
      <Heart
        className={large ? "h-10 w-10 mb-3" : "h-5 w-5 mb-2"}
        style={{ color: template.accent }}
        fill={template.accent}
      />
      <p
        className={`${large ? "text-xs tracking-[0.25em]" : "text-[7px] tracking-[0.2em]"} uppercase mb-2`}
        style={{ color: template.accent }}
      >
        Wedding Invitation
      </p>
      <p
        className={`${large ? "text-2xl font-bold mb-1" : "text-sm font-bold"}`}
        style={{ color: template.textPri }}
      >
        សុវណ្ណដេត
      </p>
      <p
        className={`${large ? "text-xl my-1" : "text-xs my-0.5"} font-semibold`}
        style={{ color: template.accent }}
      >
        &
      </p>
      <p
        className={`${large ? "text-2xl font-bold mb-4" : "text-sm font-bold mb-3"}`}
        style={{ color: template.textPri }}
      >
        ដារ៉ា
      </p>
      <span
        className={`${large ? "text-sm px-6 py-2 rounded-full" : "text-[8px] px-3 py-1 rounded-full"} font-medium text-white`}
        style={{
          background: `linear-gradient(135deg, ${template.btnFrom}, ${template.btnTo})`,
        }}
      >
        បើកលិខិត
      </span>
    </div>
  );
}

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
          ធៀបគំរូលិខិត
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
          ធៀបគំរូលិខិតអញ្ជើញរោងពិធីរៀបការ
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ជ្រើសរើសពីស្តុកធៀបគំរូដ៏ស្អាតរបស់យើងដែលរចនាដោយអ្នកជំនាញ។
          យើងមានធៀបគំរូសម្រាប់រោងពិធីគ្រប់ប្រភេទ។
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
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="relative p-6 pb-0">
              {template.isPremium && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gold-gradient text-white gap-1 shadow-lg">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                </div>
              )}
              <div className="mx-auto w-40 aspect-[3/5] rounded-[1.25rem] border-4 border-secondary/90 shadow-lg overflow-hidden relative transition-transform duration-300 group-hover:scale-[1.03]">
                <TemplatePreview template={template} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    className="bg-gold-gradient text-white hover:opacity-90 gap-2 pointer-events-none"
                    tabIndex={-1}
                  >
                    <Eye className="h-4 w-4" /> មើលជាមុន
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-5 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-secondary">{template.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[template.category]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <Link href={`/register?template=${template.id}`}>
                <Button className="w-full bg-gold-gradient text-white hover:opacity-90 gap-2">
                  <Check className="h-4 w-4" /> ប្រើធៀបគំរូនេះ
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            មិនមានធៀបគំរូក្នុងប្រភេទនេះទេ
          </p>
        </div>
      )}

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

              <div className="mx-auto w-56 aspect-[3/5] rounded-[1.75rem] border-4 border-secondary/90 shadow-xl overflow-hidden">
                <TemplatePreview template={selectedTemplate} large />
              </div>

              <div>
                <h4 className="font-semibold text-secondary mb-3">មុខងាររួមបញ្ចូល</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href={`/register?template=${selectedTemplate.id}`} className="flex-1">
                  <Button className="w-full bg-gold-gradient text-white hover:opacity-90">
                    ប្រើធៀបគំរូនេះ
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1 border-gold-300 text-primary hover:bg-gold-50"
                  onClick={() => setSelectedTemplate(null)}
                >
                  បិទ
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
