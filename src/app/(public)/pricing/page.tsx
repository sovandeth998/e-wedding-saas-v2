import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

const pricingTiers = [
  {
    name: "កញ្ចប់សាកល្បង",
    nameEn: "Free Trial",
    price: 0,
    popular: false,
    icon: Sparkles,
    features: [
      { name: "ពុម្ពធម្មតា (1-2)", included: true },
      { name: "រយៈពេល Link: 30 ថ្ងៃ", included: true },
      { name: "ភ្ញៀវរហូតដល់ 50 នាក់", included: true },
      { name: "រូបថត 2 សន្លឹក", included: true },
      { name: "QR Code និងផែនទី", included: true },
      { name: "តន្ត្រីផ្ទៃខាងក្រោយ", included: false },
      { name: "តាមដាន RSVP", included: false },
      { name: "ចៅអធិការចម្រាក់ពេល", included: false },
      { name: "ដក Watermark", included: false },
      { name: "ជំនួយ Telegram", included: false },
    ],
  },
  {
    name: "កញ្ចប់ស្តង់ដារ",
    nameEn: "Standard",
    price: 18,
    popular: true,
    icon: Crown,
    features: [
      { name: "ពុម្ពសម័យទំនើប (5+)", included: true },
      { name: "រយៈពេល Link: 6 ខែ", included: true },
      { name: "ភ្ញៀវមិនកំណត់", included: true },
      { name: "រូបថត 6-10 សន្លឹក", included: true },
      { name: "QR Code និងផែនទី", included: true },
      { name: "តន្ត្រីផ្ទាល់ខ្លួន", included: true },
      { name: "តាមដាន RSVP", included: true },
      { name: "ចៅអធិការចម្រាក់ពេល", included: true },
      { name: "ដក Watermark", included: true },
      { name: "ជំនួយ Telegram", included: true },
    ],
  },
  {
    name: "កញ្ចប់ប្រណិត",
    nameEn: "VIP / Luxury",
    price: 40,
    popular: false,
    icon: Crown,
    features: [
      { name: "ពុម្ពប្រណិតទាំងអស់", included: true },
      { name: "រយៈពេល Link: អចិន្ត្រៃយ៍ (1 ឆ្នាំ)", included: true },
      { name: "ភ្ញៀវមិនកំណត់", included: true },
      { name: "រូបថត 20+ (HD Gallery)", included: true },
      { name: "QR Code និងផែនទី", included: true },
      { name: "តន្ត្រីផ្ទាល់ខ្លួន", included: true },
      { name: "តាមដាន RSVP", included: true },
      { name: "ចៅអធិការចម្រាក់ពេល", included: true },
      { name: "ដក Watermark", included: true },
      { name: "ជំនួយរៀបចំទិន្នន័យ", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">តម្លៃសេវា</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary">
          តម្លៃសាមញ្ញ និងថ្លៃ
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ជ្រើសរើសកញ្ចប់ដែលសមនឹងតម្រូវការរបស់អ្នក។ ចាប់ផ្ដើមដោយឥតគិតថ្លៃ រួច upgrade នៅពេលត្រៀមខ្លួន។
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <Card key={index} className={`relative border-0 shadow-lg ${tier.popular ? "shadow-xl ring-2 ring-primary scale-105" : ""}`}>
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gold-gradient text-white px-4 py-1">ពេញនិយមបំផុត</Badge>
              </div>
            )}
            <CardHeader className="text-center pt-8 pb-4">
              <div className={`h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${tier.popular ? "bg-gold-gradient" : "bg-gold-50"}`}>
                <tier.icon className={`h-7 w-7 ${tier.popular ? "text-white" : "text-primary"}`} />
              </div>
              <CardTitle className="text-xl text-secondary">{tier.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{tier.nameEn}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-secondary">${tier.price}</span>
                {tier.price > 0 && <span className="text-muted-foreground text-sm"> / កញ្ចប់</span>}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span className={!feature.included ? "text-gray-300" : ""}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button
                  className={`w-full ${tier.popular ? "bg-gold-gradient text-white hover:opacity-90" : "border-gold-300 text-primary hover:bg-gold-50"}`}
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.price === 0 ? "ចាប់ផ្ដើមឥតគិតថ្លៃ" : "ទទួលបាន"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
