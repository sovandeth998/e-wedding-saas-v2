import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "ព័ត៌មានដែលយើងប្រមូល",
    content:
      "យើងប្រមូលព័ត៌មានមូលដ្ឋានដូចជា ឈ្មោះ អ៊ីមែល និងព័ត៌មានលិខិតអញ្ជើញដែលអ្នកបានបញ្ចូល។ យើងមិនប្រមូលព័ត៌មានឯកជនផ្សេងទៀតដោយមិនចាំបាច់ឡើយ។",
  },
  {
    title: "របៀបប្រើប្រាស់ព័ត៌មាន",
    content:
      "ព័ត៌មានរបស់អ្នកត្រូវបានប្រើប្រាស់តែសម្រាប់ផ្ដល់សេវាបង្កើតលិខិតអញ្ជើញ និងកែលម្អបទពិសោធន៍ប្រើប្រាស់ប៉ុណ្ណោះ។ យើងមិនលក់ ឬចែករំលែកព័ត៌មានរបស់អ្នកទៅភាគីទីបីឡើយ។",
  },
  {
    title: "ការការពារព័ត៌មាន",
    content:
      "ព័ត៌មានរបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាព និងកំណត់សិទ្ធិចូលប្រើប្រាស់តែចំពោះអ្នកប៉ុណ្ណោះ។ យើងអនុវត្តវិធានការបច្ចេកទេសសមស្រប ដើម្បីការពារព័ត៌មានពីការចូលប្រើប្រាស់ដោយមិនច្បាប់។",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">ឯកជនភាព</p>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary">គោលការណ៍ឯកជនភាព</h1>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index} className="border-gold-200/50 shadow-md">
            <CardContent className="p-8">
              <h2 className="font-bold text-xl text-secondary mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
