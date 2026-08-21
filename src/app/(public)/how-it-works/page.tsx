import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Palette, Eye, Share2, BarChart3, HelpCircle } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: UserPlus,
    step: "១",
    title: "បង្កើតគណនី",
    description: "ចុះឈ្មោះជាមួយអ៊ីមែល ឬគណនី Google របស់អ្នក។ ឥតគិតថ្លៃ និងចំណាយពេលតិចជាង 1 នាទី។",
  },
  {
    icon: Palette,
    step: "២",
    title: "ជ្រើសរើស និងប្ដូរតាមបំណង",
    description: "ជ្រើសរើសធៀបគំរូ និងបំពេញព័ត៌មានរោងពិធីរបស់អ្នក រូបថត និងតន្ត្រី។",
  },
  {
    icon: Eye,
    step: "៣",
    title: "មើលជាមុន",
    description: "មើលរូបរាងលិខិតអញ្ជើញរបស់អ្នកមុនពេលផ្សាយ។ កែប្រែបានគ្រប់ពេល។",
  },
  {
    icon: Share2,
    step: "៤",
    title: "ចែករំលែកទៅភ្ញៀវ",
    description: "ទទួលបាន Link ផ្ទាល់ខ្លួន និងចែករំលែកតាម Telegram, Facebook ឬកម្មវិធីណាមួយ។",
  },
  {
    icon: BarChart3,
    step: "៥",
    title: "តាមដាន RSVP",
    description: "ឃើញអ្នកណានឹងមកចូលរួម អានពាក្យជូនពរ និងគ្រប់គ្រងអ្វីៗពី Dashboard។",
  },
];

const faqs = [
  { q: "តើវាពិតជាឥតគិតថ្លៃទេ?", a: "បាទ/ចាស! កញ្ចប់ឥតគិតថ្លៃរួមបញ្ចូលធៀបគំរូធម្មតា និងមុខងារ基础។ អ្នកអាច upgrade បានពេលណាមួយ។" },
  { q: "តើខ្ញុំអាចប្រើ Domain ផ្ទាល់ខ្លួនបានទេ?", a: "កាន់ VIP អ្នកអាចប្រើ Domain ផ្ទាល់ខ្លួនសម្រាប់ Link លិខិតអញ្ជើញ។" },
  { q: "តើភ្ញៀវរបៀប RSVP ដូចម្ដេច?", a: "ភ្ញៀវគ្រាន់តែចុច Link បំពេញព័ត៌មាន និងផ្ញើការឆ្លើយតប។ អ្នកនឹងទទួលបានការជូនដំណឹងភ្លាមៗ។" },
  { q: "តើខ្ញុំអាចផ្លាស់ប្ដូរធៀបគំរូបានទេ?", a: "បាទ/ចាស! អ្នកអាចផ្លាស់ប្ដូរធៀបគំរូបានគ្រប់ពេលពី Dashboard។" },
  { q: "តើអ្នកទទួលយកការបង់ប្រាក់បែបណា?", a: "យើងទទួលយក KHQR (Bakong) និងការផ្ញើវិក្កយបត្រសម្រាប់ការផ្ទៀងផ្ទាត់។" },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Steps Section */}
      <div className="text-center mb-16">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">របៀបប្រើប្រាស់</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary">
          របៀបប្រើប្រាស់
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          បង្កើតលិខិតអញ្ជើញក្ដីស្រមៃរបស់អ្នកក្នុង ៥ ជំហានសាមញ្ញ។
        </p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto mb-24">
        {steps.map((step, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all border-l-4 border-l-primary">
            <CardContent className="p-6 flex gap-5 items-start">
              <div className="h-14 w-14 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0">
                <step.icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-primary font-bold text-sm mb-1">ជំហាន {step.step}</div>
                <h3 className="font-bold text-lg text-secondary mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="text-center mb-12">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">សំណួរញឹកញាប់</p>
        <h2 className="text-3xl font-bold mb-4 text-secondary">សំណួរញឹកញាប់</h2>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto mb-16">
        {faqs.map((faq, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-secondary mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link href="/register">
          <Button size="lg" className="bg-gold-gradient text-white hover:opacity-90 px-10">
            ចាប់ផ្ដើមឥឡូវនេះ
          </Button>
        </Link>
      </div>
    </div>
  );
}
