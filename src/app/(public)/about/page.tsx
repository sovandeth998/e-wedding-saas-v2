import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Palette, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "ងាយស្រួលប្រើ",
    description:
      "បង្កើតលិខិតអញ្ជើញក្នុងរយៈពេលតែប៉ុន្មាននាទីប៉ុណ្ណោះ ដោយមិនចាំបាច់មានចំណេះដឹងផ្នែកបច្ចេកទេស។",
  },
  {
    icon: Palette,
    title: "ធៀបគំរូស្អាត",
    description:
      "ជ្រើសរើសធៀបគំរូទំនើប និងដ៏ស្អាតជាច្រើនបែប ដែលអាចប្ដូរតាមបំណងបានគ្រប់រូបភាព និងព័ត៌មាន។",
  },
  {
    icon: Users,
    title: "គ្រប់គ្រងភ្ញៀវ",
    description:
      "តាមដានការឆ្លើយតប RSVP របស់ភ្ញៀវកិត្តិយស និងគ្រប់គ្រងបញ្ជីភ្ញៀវយ៉ាងងាយស្រួលពី Dashboard។",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">អំពីយើង</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary">អំពី E-Wedding</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          E-Wedding ជា Platform សម្រាប់បង្កើតលិខិតអញ្ជើញរៀបការដ៏ស្អាត និងទំនើប។
          យើងជួយគូស្វាមីភរិយាថ្មីបង្កើតបទពិសោធន៍អញ្ជើញការដ៏ពិសេសសម្រាប់ភ្ញៀវកិត្តិយស។
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border-gold-200/50 shadow-md hover:shadow-lg transition-all text-center">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-5">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-bold text-lg text-secondary mb-3">{feature.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
