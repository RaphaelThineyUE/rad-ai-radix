import pdf from 'pdf-parse';
import fs from 'fs/promises';
import { createWorker } from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// OpenAI API integration - using fetch for compatibility
async function callOpenAI(prompt: string, systemMessage: string): Promise<any> {
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
        ] as OpenAIMessage[],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as OpenAIResponse;
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI call error:', error);
    throw error;
  }
}

// Check if PDF text content is sufficient (not just scanned images)
function hasValidTextContent(text: string | null): boolean {
  if (!text) return false;
  
  // Remove whitespace and check if there's substantial text
  const cleanText = text.trim();
  
  // If less than 100 characters, likely a scanned document
  if (cleanText.length < 100) return false;
  
  // Check for meaningful words (at least 10 words)
  const words = cleanText.split(/\s+/).filter(word => word.length > 2);
  if (words.length < 10) return false;
  
  return true;
}

// Extract text from PDF using OCR (for scanned PDFs)
async function extractTextWithOCR(filePath: string): Promise<string> {
  console.log('PDF appears to be scanned or has insufficient text. Attempting OCR extraction...');
  
  let tempDir: string | null = null;
  let worker = null;
  
  try {
    // Create temporary directory for images
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-ocr-'));
    
    // Convert PDF pages to images
    const options = {
      density: 300, // DPI for better OCR quality
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png' as const,
      width: 2000,
      height: 2000
    };
    
    const convert = fromPath(filePath, options);
    
    // Get number of pages
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdf(dataBuffer);
    const numPages = pdfData.numpages;
    
    console.log(`Processing ${numPages} pages with OCR...`);
    
    // Initialize Tesseract worker
    worker = await createWorker('eng');
    
    let extractedText = '';
    
    // Process each page
    for (let pageNum = 1; pageNum <= Math.min(numPages, 20); pageNum++) { // Limit to 20 pages
      try {
        // Convert page to image
        const result = await convert(pageNum, { responseType: 'image' });
        const imagePath = result.path;
        
        // Perform OCR
        const { data: { text } } = await worker.recognize(imagePath);
        extractedText += `\n--- Page ${pageNum} ---\n${text}\n`;
        
        // Clean up image file
        try {
          await fs.unlink(imagePath);
        } catch (cleanupError) {
          console.error(`Error cleaning up image ${imagePath}:`, cleanupError);
        }
        
        console.log(`OCR completed for page ${pageNum}/${numPages}`);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with next page
      }
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw error;
  } finally {
    // Cleanup
    if (worker) {
      await worker.terminate();
    }
    
    if (tempDir) {
      try {
        // Remove temporary directory
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          await fs.unlink(path.join(tempDir, file));
        }
        await fs.rmdir(tempDir);
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    }
  }
}

// Extract text from PDF with automatic OCR fallback
export async function extractPDFText(filePath: string): Promise<string | null> {
  try {
    // First, try standard PDF text extraction
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    const extractedText = data.text;
    
    // Check if extracted text is sufficient
    if (hasValidTextContent(extractedText)) {
      console.log('PDF text extracted successfully using standard extraction');
      return extractedText;
    }
    
    // If not enough text, try OCR
    console.log('Insufficient text from standard extraction, attempting OCR...');
    const ocrText = await extractTextWithOCR(filePath);
    
    if (hasValidTextContent(ocrText)) {
      console.log('PDF text extracted successfully using OCR');
      return ocrText;
    }
    
    // If still no valid text, return what we have
    console.warn('Unable to extract sufficient text from PDF');
    return extractedText || ocrText || '';
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    return null;
  }
}

// Analyze report with AI
export async function analyzeReport(pdfText: string): Promise<any> {
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
export async function generateSummary(extractedData: any): Promise<string> {
  const systemMessage = 'You are a medical communicator who explains radiology results to patients in a clear, compassionate way.';
  
  const prompt = `Create a patient-friendly 2-4 sentence summary of this radiology report explaining key findings, BI-RADS meaning, and what patient should know. Be honest but reassuring.

Data: ${JSON.stringify(extractedData)}

Return JSON with: { "summary": "<patient friendly summary>" }`;

  const result = await callOpenAI(prompt, systemMessage);
  return result.summary;
}

// Consolidate multiple reports
export async function consolidateReports(reports: any[]): Promise<any> {
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
export async function compareTreatments(patientData: any, treatmentOptions: string[]): Promise<any> {
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
