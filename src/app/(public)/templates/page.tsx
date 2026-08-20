import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Crown } from "lucide-react";
import Link from "next/link";

const templates = [
  { id: "1", name: "ផ្កាឈូករ៉ូមែនទិច", category: "modern", isPremium: false, description: "ពុម្ពរ៉ូមែនទិចជាមួយពណ៌មាសផ្កាឈូក" },
  { id: "2", name: "មាសប្រណិត", category: "luxury", isPremium: true, description: "ប្រធានបទមាសប្រណិតសម្រាប់រោងពិធីប្រណិត" },
  { id: "3", name: "ប្រពៃណីខ្មែរ", category: "classic", isPremium: false, description: "រចនាបែបប្រពៃណីខ្មែរសម្រាប់រោងពិធីបុរាណ" },
  { id: "4", name: "សម័យទំនើប", category: "modern", isPremium: false, description: "រចនាបែបសម័យទំនើប ស្អាត និងសាមញ្ញ" },
  { id: "5", name: "រាជវាំង", category: "luxury", isPremium: true, description: "រចនាបែបរាជវាំងប្រណិត" },
  { id: "6", name: "សួនច្បារ", category: "modern", isPremium: false, description: "ប្រធានបទសួនច្បារធម្មជាតិ" },
];

export default function TemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">ពុម្ពលិខិត</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary">
          ពុម្ពលិខិតអញ្ជើញរោងពិធីរៀបការ
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ជ្រើសរើសពីស្តុកពុម្ពដ៏ស្អាតរបស់យើងដែលរចនាដោយអ្នកជំនាញ។
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-10 flex-wrap">
        <Button variant="default" size="sm" className="bg-gold-gradient text-white">ទាំងអស់</Button>
        <Button variant="outline" size="sm" className="border-gold-300 text-primary">សម័យទំនើប</Button>
        <Button variant="outline" size="sm" className="border-gold-300 text-primary">ប្រពៃណី</Button>
        <Button variant="outline" size="sm" className="border-gold-300 text-primary">ប្រណិត</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
            <div className="aspect-[3/4] bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gold-300 text-sm font-medium">មើលជាមុន</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button size="sm" className="bg-gold-gradient text-white hover:opacity-90 gap-2">
                  <Eye className="h-4 w-4" /> មើលជាមុន
                </Button>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-secondary">{template.name}</h3>
                {template.isPremium && (
                  <Badge className="bg-gold-gradient text-white gap-1">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <Link href="/register">
                <Button className="w-full bg-gold-gradient text-white hover:opacity-90" size="sm">
                  ប្រើពុម្ពនេះ
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
