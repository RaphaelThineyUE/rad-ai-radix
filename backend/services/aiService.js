import pdf from 'pdf-parse';
import fs from 'fs/promises';

// OpenAI API integration - using fetch for compatibility
async function callOpenAI(prompt, systemMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI call error:', error);
    throw error;
  }
}

// Extract text from PDF
export async function extractPDFText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return null;
  }
}

// Analyze report with AI
export async function analyzeReport(pdfText) {
  const systemMessage = 'You are a medical AI assistant specialized in analyzing breast radiology reports. Extract structured data accurately and provide evidence as exact quotes from the report. Return only valid JSON.';
  
  const prompt = `Analyze this breast radiology report and extract structured data. 

Report Text: ${pdfText}

Return JSON with the following structure:
{
  "birads": {
    "value": <number 0-6>,
    "confidence": "<low|medium|high>",
    "evidence": ["<exact quote>"]
  },
  "breast_density": {
    "value": "<A|B|C|D or description>",
    "evidence": ["<exact quote>"]
  },
  "exam": {
    "type": "<type of exam>",
    "laterality": "<bilateral|left|right>",
    "evidence": ["<exact quote>"]
  },
  "comparison": {
    "prior_exam_date": "<date if mentioned>",
    "evidence": ["<exact quote>"]
  },
  "findings": [
    {
      "laterality": "<left|right|bilateral>",
      "location": "<anatomical location>",
      "description": "<finding description>",
      "assessment": "<assessment>",
      "evidence": ["<exact quote>"]
    }
  ],
  "recommendations": [
    {
      "action": "<recommended action>",
      "timeframe": "<timeframe>",
      "evidence": ["<exact quote>"]
    }
  ],
  "red_flags": ["<any concerning findings>"]
}

Evidence must be exact quotes from the report. BI-RADS must be 0-6. Flag anything suspicious as red flags.`;

  const analysis = await callOpenAI(prompt, systemMessage);
  
  // Generate patient-friendly summary
  const summary = await generateSummary(analysis);
  
  return {
    ...analysis,
    summary
  };
}

// Generate patient-friendly summary
export async function generateSummary(extractedData) {
  const systemMessage = 'You are a medical communicator who explains radiology results to patients in a clear, compassionate way.';
  
  const prompt = `Create a patient-friendly 2-4 sentence summary of this radiology report explaining key findings, BI-RADS meaning, and what patient should know. Be honest but reassuring.

Data: ${JSON.stringify(extractedData)}

Return JSON with: { "summary": "<patient friendly summary>" }`;

  const result = await callOpenAI(prompt, systemMessage);
  return result.summary;
}

// Consolidate multiple reports
export async function consolidateReports(reports) {
  const systemMessage = 'You are a medical AI assistant specialized in analyzing patterns across multiple breast radiology reports.';
  
  const reportsData = reports.map(r => ({
    date: r.created_date,
    birads: r.birads,
    findings: r.findings,
    summary: r.summary
  }));
  
  const prompt = `Analyze these multiple breast radiology reports for the same patient. Create 3-5 paragraph summary covering: overall assessment, progression over time, consistent findings, concerning patterns, key recommendations.

Reports: ${JSON.stringify(reportsData)}

Return JSON with: { "consolidated_summary": "<comprehensive summary>", "overall_assessment": "<overall assessment>", "progression_notes": "<progression notes>", "key_patterns": ["<pattern 1>", "<pattern 2>"] }`;

  return await callOpenAI(prompt, systemMessage);
}

// Compare treatment options
export async function compareTreatments(patientData, treatmentOptions) {
  const systemMessage = 'You are a medical AI assistant specialized in breast cancer treatment planning.';
  
  const prompt = `Compare these treatment options for this breast cancer patient. For each option provide: recommendation score (1-10), efficacy rate, benefits, side effects, duration, considerations. Include overall recommendation and disclaimer.

Patient: ${JSON.stringify(patientData)}
Options: ${JSON.stringify(treatmentOptions)}

Return JSON with:
{
  "comparisons": [
    {
      "treatment": "<treatment name>",
      "score": <1-10>,
      "efficacy_rate": "<percentage or description>",
      "benefits": ["<benefit 1>", "<benefit 2>"],
      "side_effects": ["<side effect 1>", "<side effect 2>"],
      "duration": "<typical duration>",
      "considerations": ["<consideration 1>", "<consideration 2>"]
    }
  ],
  "overall_recommendation": "<recommendation>",
  "disclaimer": "<medical disclaimer>"
}`;

  return await callOpenAI(prompt, systemMessage);
}
