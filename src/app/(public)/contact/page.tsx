import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Mail, Send, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">ទំនាក់ទំនង</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary">
          ទំនាក់ទំនង និងជំនួយ
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ត្រូវការជំនួយ? យើងនៅទីនេះសម្រាប់អ្នក។ ទំនាក់ទំនងបានពេលណាមួយ!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Contact Form */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-6 text-secondary">ផ្ញើសារទៅយើង</h2>
            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-secondary font-medium">ឈ្មោះ</Label>
                <Input id="name" placeholder="ឈ្មោះរបស់អ្នក" className="border-gold-200 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-secondary font-medium">អ៊ីមែល</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="border-gold-200 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-secondary font-medium">ប្រធានបទ</Label>
                <Input id="subject" placeholder="តើយើងអាចជួយអ្វី?" className="border-gold-200 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-secondary font-medium">សារ</Label>
                <Textarea id="message" rows={5} placeholder="សរសេរសាររបស់អ្នកនៅទីនេះ..." className="border-gold-200 focus-visible:ring-primary" />
              </div>
              <Button type="submit" className="w-full gap-2 bg-gold-gradient text-white hover:opacity-90">
                <Send className="h-4 w-4" /> ផ្ញើសារ
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-secondary mb-2">Telegram Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  ជជែកជាមួយយើងនៅ Telegram សម្រាប់ជំនួយភ្លាមៗ។
                </p>
                <Button variant="outline" size="sm" className="border-gold-300 text-primary hover:bg-gold-50" asChild>
                  <a href="https://t.me/ewedding_support" target="_blank" rel="noopener noreferrer">
                    បើក Telegram
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-secondary mb-2">អ៊ីមែល</h3>
                <p className="text-sm text-muted-foreground">
                  support@e-wedding.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-secondary text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-gold-300" />
                <h3 className="font-bold">ម៉ោងធ្វើការ</h3>
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>ចន្លោះថ្ងៃចន្ទ - សុក្រ: 8:00 ព្រឹក - 6:00 ល្ងាច</p>
                <p>ថ្ងៃសៅរ៍: 9:00 ព្រឹក - 1:00 ថ្ងៃត្រង់</p>
                <p>ថ្ងៃអាទិត្យ: បិទ</p>
              </div>
              <p className="mt-4 text-sm font-medium text-gold-300">
                Telegram Support 24/7
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
