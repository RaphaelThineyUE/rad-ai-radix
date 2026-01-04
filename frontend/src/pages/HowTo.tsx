import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export default function HowTo() {
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `
        Welcome to RadReport AI! Follow these steps to get started:
        
        1. Create your account or log in
        2. Add your first patient
        3. Upload a radiology report PDF
        4. View AI-generated analysis and insights
      `
    },
    {
      id: 'upload-reports',
      title: 'Uploading Reports',
      content: `
        To upload a radiology report:
        
        1. Select a patient from the dropdown
        2. Drag and drop a PDF file or click to browse
        3. Wait for the AI to process the report
        4. Review the extracted insights
      `
    },
    {
      id: 'understanding-birads',
      title: 'Understanding BI-RADS',
      content: `
        BI-RADS (Breast Imaging Reporting and Data System) categories:
        
        • BI-RADS 0: Incomplete assessment
        • BI-RADS 1-2: Benign (green)
        • BI-RADS 3: Probably benign (yellow)
        • BI-RADS 4: Suspicious (orange)
        • BI-RADS 5-6: Highly suggestive of malignancy (red)
      `
    },
    {
      id: 'disclaimer',
      title: 'Medical Disclaimer',
      content: `
        Important: This tool is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding any medical concerns.
      `
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          How to Use RadReport AI
        </h2>
        <p className="text-gray-600 mb-8">
          Learn how to get the most out of our AI-powered radiology analysis platform
        </p>

        <Accordion.Root type="single" collapsible className="space-y-4">
          {sections.map(section => (
            <Accordion.Item
              key={section.id}
              value={section.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <Accordion.Header>
                <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition group">
                  <span className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </span>
                  <ChevronDown className="text-gray-500 group-data-[state=open]:rotate-180 transition-transform" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-6 pb-6 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="text-gray-600 whitespace-pre-line">
                  {section.content}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
}
