import Link from "next/link";
import { Heart, Palette, Users, Share2, Music, QrCode, Star, ArrowRight, Shield, Clock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Palette,
    title: "ធៀបគំរូស្អាតៗ",
    description: "ជ្រើសរើសពីធៀបគំរូលិខិតអញ្ជើញរោងពិធីរៀបការដ៏ស្អាត ដែលរចនាដោយអ្នកជំនាញ។",
  },
  {
    icon: Users,
    title: "គ្រប់គ្រងភ្ញៀវ",
    description: "គ្រប់គ្រងបញ្ជីភ្ញៀវរបស់អ្នកយ៉ាងងាយស្រួល ជាមួយ Link ផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវម្នាក់ៗ។",
  },
  {
    icon: Share2,
    title: "ចែករំលែកងាយស្រួល",
    description: "ចែករំលែកលិខិតអញ្ជើញតាម Telegram, Facebook ឬកម្មវិធីផ្សេងៗ។",
  },
  {
    icon: Music,
    title: "តន្ត្រីផ្ទៃខាងក្រោយ",
    description: "ដាក់បទចម្រៀងផ្ទាល់ខ្លួនដើម្បីបង្កើតបរិយាកាសស្អាត។",
  },
  {
    icon: QrCode,
    title: "QR Code ចំណងដៃ",
    description: "អនុញ្ញាតឱ្យភ្ញៀវផ្ញើចំណងដៃតាម QR Code យ៉ាងងាយស្រួល។",
  },
  {
    icon: Heart,
    title: "តាមដាន RSVP",
    description: "តាមដានការឆ្លើយតបរបស់ភ្ញៀវ និងឃើញអ្នកណានឹងមកចូលរួម។",
  },
];

const testimonials = [
  {
    name: "សុវណ្ណ និង ចន្ធី",
    text: "E-Wedding ធ្វើឱ្យលិខិតអញ្ជើញរបស់យើងស្អាតខ្លាំង! ភ្ញៀវទាំងអស់ស្រលាញ់។",
    rating: 5,
  },
  {
    name: "បុរី និង ស្រីលិខ",
    text: "ងាយស្រួលប្រើខ្លាំង និងធៀបគំរូស្អាតៗ។ ផ្ដល់អនុសាសន៍ខ្លាំង!",
    rating: 5,
  },
  {
    name: "ដារា និង កញ្ញា",
    text: "មុខងារគ្រប់គ្រងភ្ញៀវសន្សំសំចៃពេលវេលាយើងច្រើន។ អរគុណ E-Wedding!",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cream-gradient py-24 md:py-36">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-white/60 backdrop-blur-sm px-5 py-2 text-sm text-primary mb-8">
            <Heart className="h-4 w-4 fill-primary" />
            វេទិកាលិខិតអញ្ជើញរៀបការអន្តរបណ្ដាញ #1 នៅកម្ពុជា
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-secondary">
            បង្កើត
            <span className="gold-shimmer"> លិខិតអញ្ជើញ</span>
            <br />
            រោងពិធីរៀបការ
            <br />
            <span className="text-primary">យ៉ាងស្អាត</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            រចនា និងចែករំលែកលិខិតអញ្ជើញរោងពិធីរៀបការដ៏ស្អាតជាមួយភ្ញៀវរបស់អ្នក។
            ងាយស្រួល ប្រណិត និងថោក — ចាប់ផ្ដើមដោយឥតគិតថ្លៃ!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-10 bg-gold-gradient text-white hover:opacity-90 h-12">
                បង្កើតលិខិតអញ្ជើញ <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="text-base px-10 border-gold-300 text-primary hover:bg-gold-50 h-12">
                មើលធៀបគំរូ
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            មិនត្រូវការកាតឥណទាន • ឥតគិតថ្លៃសាកល្បង
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">មុខងារពិសេស</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
              អ្វីគ្រប់ដែលអ្នកត្រូវការ
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ឧបករណ៍ទាំងអស់ដែលអ្នកត្រូវការដើម្បីបង្កើត និងចែករំលែកលិខិតអញ្ជើញដ៏ស្អាត។
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-xl bg-gold-50 flex items-center justify-center mb-5 group-hover:bg-gold-gradient transition-colors">
                    <feature.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-secondary">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-gold-300 font-medium text-sm tracking-wider uppercase mb-3">របៀបប្រើប្រាស់</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ៣ ជំហានសាមញ្ញ
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              បង្កើតលិខិតអញ្ជើញក្ដីស្រមៃរបស់អ្នកក្នុង ៣ ជំហានសាមញ្ញ។
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "១", title: "ជ្រើសរើសធៀបគំរូ", desc: "ជ្រើសរើសពីស្តុកធៀបគំរូដ៏ស្អាតរបស់យើង។", icon: Palette },
              { step: "២", title: "ប្តូរតាមបំណង", desc: "ដាក់ព័ត៌មាន រូបថត និងប្តូរតាមបំណងអ្វីៗ។", icon: Heart },
              { step: "៣", title: "ចែករំលែក និងតាមដាន", desc: "ចែករំលែក Link ទៅភ្ញៀវ និងតាមដាន RSVP។", icon: Users },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="h-20 w-20 rounded-2xl bg-gold-gradient flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="h-9 w-9 text-white" />
                </div>
                <div className="text-gold-300 font-bold text-lg mb-2">ជំហាន {item.step}</div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-cream-gradient">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">រឿងស្នេហា</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
              គូស្នេហ៍របស់យើងនិយាយអ្វី
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                  <p className="font-bold text-secondary">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gold-200/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1,000+", label: "លិខិតអញ្ជើញ" },
              { value: "500+", label: "គូស្នេហ៍" },
              { value: "50,000+", label: "ភ្ញៀវ" },
              { value: "99%", label: "ការពេញចិត្ត" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl md:text-4xl font-bold gold-shimmer">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 h-32 w-32 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-10 right-20 h-32 w-32 rounded-full bg-gold-400 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative max-w-6xl">
          <div className="divider-ornament text-gold-300 mb-8 max-w-md mx-auto">✦</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ត្រៀមខ្លួនបង្កើតលិខិតអញ្ជើញរបស់អ្នក?
          </h2>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
            ចូលរួមជាមួយគូស្នេហ៍រាប់ពាន់ដែលប្រើ E-Wedding សម្រាប់ថ្ងៃពិសេសរបស់ពួកគេ។
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-10 bg-gold-gradient text-white hover:opacity-90 h-12">
              ចាប់ផ្ដើមឥតគិតថ្លៃ <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
