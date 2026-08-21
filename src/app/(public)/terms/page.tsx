import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "ការទទួលខុសត្រូវ",
    content:
      "អ្នកប្រើប្រាស់ត្រូវទទួលខុសត្រូវលើព័ត៌មានដែលបានបញ្ចូលក្នុងលិខិតអញ្ជើញរបស់ខ្លួន។ ហាមប្រើប្រាស់ Platform សម្រាប់គោលបំណងខុសច្បាប់ ឬរំលោភលើសិទ្ធិរបស់អ្នកដទៃ។",
  },
  {
    title: "ការបង់ប្រាក់",
    content:
      "ការបង់ប្រាក់សម្រាប់កញ្ចប់សេវាផ្សេងៗធ្វើឡើងតាមរយៈ KHQR (Bakong) ឬ ABA Bank។ ការបង់ប្រាក់ទាំងអស់មិនអាចសុំប្រគល់វិញបានទេ បន្ទាប់ពីសេវាត្រូវបានធ្វើឱ្យដំណើរការ។",
  },
  {
    title: "ការលុបគណនី",
    content:
      "អ្នកអាចស្នើសុំលុបគណនីរបស់ខ្លួនបានពេលណាមួយ។ នៅពេលលុបគណនី ព័ត៌មាន និងលិខិតអញ្ជើញទាំងអស់នឹងត្រូវលុបជាអចិន្ត្រៃយ៍ ហើយមិនអាចទាញយកមកវិញបានទេ។",
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">លក្ខន្តិកៈ</p>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary">លក្ខន្តិកៈប្រើប្រាស់</h1>
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
