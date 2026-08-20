import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Crown, Star, Check } from "lucide-react";
import Link from "next/link";

const templates: Record<
  string,
  {
    id: string;
    name: string;
    category: string;
    isPremium: boolean;
    description: string;
    features: string[];
    includes: string[];
  }
> = {
  "1": {
    id: "1",
    name: "ផ្កាឈូករ៉ូមែនទិច",
    category: "modern",
    isPremium: false,
    description: "ពុម្ពរ៉ូមែនទិចជាមួយពណ៌មាសផ្កាឈូក សមស្របសម្រាប់คู่ស្នេហ៍ដែលចូលចិត្តរចនាបែបថ្មីនិងទាន់សម័យ។",
    features: ["រចនាបែបទំនើប", "ពណ៌ផ្កាឈូករ៉ូមែនទិច", "ងាយស្រួលកែសម្រួល", "ឆ្លើយតបជាមួយទូរស័ព្ទ", "គាំទ្ររូបភាពច្រើន"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "2": {
    id: "2",
    name: "មាសប្រណិត",
    category: "luxury",
    isPremium: true,
    description: "ប្រធានបទមាសប្រណិតសម្រាប់រោងពិធីប្រណិត ផ្តល់នូវបទពិសោធន៍ពិសេសដល់ភ្ញៀវ។",
    features: ["រចនាបែបប្រណិត", "ពណ៌មាសទាំងស្រុង", "រូបភាពប្រណិត", "ការរចនាពិសេស", "ប្រសិទ្ធភាពចលនា"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ", "ទំព័រកាតថ្លែងអំណរពេញចិត្ត"],
  },
  "3": {
    id: "3",
    name: "ប្រពៃណីខ្មែរ",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបប្រពៃណីខ្មែរសម្រាប់រោងពិធីបុរាណ ផ្សារភ្ជាប់នូវវប្បធម៌និងប្រពៃណីខ្មែរ។",
    features: ["រចនាបែបប្រពៃណីខ្មែរ", "លំនាំបុរាណ", "ពណ៌ប្រពៃណី", "អក្សរខ្មែរបុរាណ"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "4": {
    id: "4",
    name: "សម័យទំនើប",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបសម័យទំនើប ស្អាត និងសាមញ្ញ សមស្របសម្រាប់រោងពិធីតូចនិងធំ។",
    features: ["រចនាបែបសម័យ", "សាមញ្ញនិងស្អាត", "ងាយស្រួលអាន", "ឆ្លើយតបជាមួយទូរស័ព្ទ", "ល្បឿនលឿន"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "5": {
    id: "5",
    name: "រាជវាំង",
    category: "luxury",
    isPremium: true,
    description: "រចនាបែបរាជវាំងប្រណិត ផ្តល់នូវអារម្មណ៍ភាពអស្ចារ្យនិងតម្លៃខ្ពស់។",
    features: ["រចនាបែបរាជវាំង", "ពណ៌មាសនិងស", "រូបភាពប្រណិត", "ការរចនាពិសេស", "ប្រសិទ្ធភាពចលនា"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ", "ទំព័រកាតថ្លែងអំណរពេញចិត្ត"],
  },
  "6": {
    id: "6",
    name: "សួនច្បារ",
    category: "modern",
    isPremium: false,
    description: "ប្រធានបទសួនច្បារធម្មជាតិ សមស្របសម្រាប់រោងពិធីក្នុងសួនច្បារ។",
    features: ["រចនាបែបធម្មជាតិ", "ពណ៌បៃតងស្រស់ស្អាត", "ផ្កានិងសួនច្បារ", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "7": {
    id: "7",
    name: "ផ្កាឈូកពណ៌ស",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបប្រពៃណីជាមួយផ្កាឈូកពណ៌ស ផ្តល់នូវភាពទន់ភ្លន់និងរ៉ូមែនទិច។",
    features: ["រចនាបែបប្រពៃណី", "ផ្កាឈូកពណ៌ស", "លំនាំបុរាណ", "ពណ៌ស្រទាប់"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "8": {
    id: "8",
    name: "ភ្លើងបំភ្លឺ",
    category: "luxury",
    isPremium: true,
    description: "ប្រធានបទភ្លើងបំភ្លឺប្រណិត បង្កើតបរិយាកាសភ្លឺភ្លើងអស្ចារ្យ។",
    features: ["រចនាបែបប្រណិត", "ភ្លើងបំភ្លឺពិសេស", "ពណ៌មាសភ្លឺ", "ប្រសិទ្ធភាពពិសេស", "ចលនាភ្លើង"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ", "ទំព័រកាតថ្លែងអំណរពេញចិត្ត"],
  },
  "9": {
    id: "9",
    name: "ទឹកជ្រោះ",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបធម្មជាតិជាមួយទឹកជ្រោះ ផ្តល់នូវភាពស្រស់ស្អាតនិងត្រជាក់។",
    features: ["រចនាបែបធម្មជាតិ", "ទឹកជ្រោះស្រស់ស្អាត", "ពណ៌ខៀវនិងបៃតង", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "10": {
    id: "10",
    name: "ពណ៌ផ្កាឈូក",
    category: "luxury",
    isPremium: true,
    description: "រចនាបែបប្រណិតពណ៌ផ្កាឈូក ផ្សារភ្ជាប់នូវភាពរ៉ូមែនទិចនិងប្រណិត។",
    features: ["រចនាបែបប្រណិត", "ពណ៌ផ្កាឈូកទាំងស្រុង", "រូបភាពប្រណិត", "ការរចនាពិសេស"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ", "ទំព័រកាតថ្លែងអំណរពេញចិត្ត"],
  },
  "11": {
    id: "11",
    name: "បុរាណ",
    category: "classic",
    isPremium: false,
    description: "រចនាបែបបុរាណខ្មែរ ផ្សារភ្ជាប់នូវអត្តសញ្ញាណវប្បធម៌ខ្មែរ។",
    features: ["រចនាបែបបុរាណខ្មែរ", "លំនាំបុរាណ", "អក្សរបុរាណ", "ពណ៌ប្រពៃណី"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
  "12": {
    id: "12",
    name: "ទំនើប",
    category: "modern",
    isPremium: false,
    description: "រចនាបែបទំនើបសាមញ្ញ សមស្របសម្រាប់រោងពិធីទំនើប។",
    features: ["រចនាបែបទំនើប", "សាមញ្ញនិងស្អាត", "ងាយស្រួលប្រើប្រាស់", "ឆ្លើយតបជាមួយទូរស័ព្ទ"],
    includes: ["ទំព័រគោល", "លិខិតអញ្ជើញឌីជីថល", "ទំព័ររៀបការ", "ទំព័រត្រួតពិនិត្យ"],
  },
};

const categoryLabels: Record<string, string> = {
  modern: "សម័យទំនើប",
  classic: "ប្រពៃណី",
  luxury: "ប្រណិត",
};

const categoryColors: Record<string, string> = {
  modern: "bg-blue-100 text-blue-700",
  classic: "bg-amber-100 text-amber-700",
  luxury: "bg-purple-100 text-purple-700",
};

export function generateStaticParams() {
  return Object.keys(templates).map((id) => ({ id }));
}

export default function TemplateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const template = templates[params.id];

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-secondary mb-4">
          មិនមានពុម្ពនេះទេ
        </h1>
        <p className="text-muted-foreground mb-8">
          ពុម្ពដែលអ្នកស្វែងរកមិនមាននៅឡើយទេ។
        </p>
        <Link href="/templates">
          <Button className="bg-gold-gradient text-white hover:opacity-90">
            ត្រឡប់ទៅពុម្ព
          </Button>
        </Link>
      </div>
    );
  }

  const related = Object.values(templates)
    .filter((t) => t.category === template.category && t.id !== template.id)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/templates"
          className="text-primary hover:underline text-sm font-medium"
        >
          &larr; ត្រឡប់ទៅពុម្ពទាំងអស់
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="aspect-[3/4] bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 rounded-xl flex items-center justify-center border border-gold-200 overflow-hidden">
            <div className="text-center">
              <Star className="h-16 w-16 text-gold-300 mx-auto mb-4" />
              <p className="text-gold-400 font-medium text-lg">
                មើលជាមុនពុម្ព
              </p>
              <p className="text-gold-300 text-sm mt-1">
                {template.name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-secondary">
                {template.name}
              </h1>
              {template.isPremium && (
                <Badge className="bg-gold-gradient text-white gap-1">
                  <Crown className="h-3 w-3" /> Premium
                </Badge>
              )}
            </div>
            <Badge
              className={`text-xs ${categoryColors[template.category] || ""}`}
              variant="secondary"
            >
              {categoryLabels[template.category]}
            </Badge>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {template.description}
          </p>

          <div>
            <h3 className="font-semibold text-secondary mb-3">
              មុខងាររួមបញ្ចូល
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {template.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-secondary mb-3">
              ទំព័រដែលរួមបញ្ចូល
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {template.includes.map((page) => (
                <div key={page} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{page}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/register" className="flex-1">
              <Button className="w-full bg-gold-gradient text-white hover:opacity-90 gap-2">
                <Eye className="h-4 w-4" /> ប្រើពុម្ពនេះ
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-gold-300 text-primary hover:bg-gold-50"
              >
                គ្រប់គ្រងពុម្ព
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-secondary mb-8 text-center">
            ពុម្ពដែលពាក់ព័ន្ធ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((rel) => (
              <Link key={rel.id} href={`/templates/${rel.id}`}>
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 cursor-pointer h-full">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="h-8 w-8 text-gold-300" />
                    </div>
                    {rel.isPremium && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gold-gradient text-white gap-1 shadow-lg">
                          <Crown className="h-3 w-3" /> Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-secondary">{rel.name}</h3>
                      <Badge
                        className={`text-xs ${categoryColors[rel.category] || ""}`}
                        variant="secondary"
                      >
                        {categoryLabels[rel.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rel.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
