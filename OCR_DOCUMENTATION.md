# OCR Support for RadReport AI

## Overview

RadReport AI includes intelligent OCR (Optical Character Recognition) support to handle scanned PDF documents. The system automatically detects when a PDF contains insufficient text and falls back to OCR processing.

## How It Works

### Automatic Detection

The system uses a two-stage approach:

1. **Standard Text Extraction**: First attempts to extract text using `pdf-parse`
2. **Validation**: Checks if extracted text is sufficient (>100 characters, >10 meaningful words)
3. **OCR Fallback**: If validation fails, automatically converts PDF pages to images and performs OCR

### OCR Process

When OCR is triggered:

1. PDF pages are converted to high-resolution PNG images (300 DPI)
2. Tesseract.js processes each image to extract text
3. Text from all pages is combined with page markers
4. Temporary image files are automatically cleaned up

## Technical Implementation

### Dependencies

- **pdf2pic**: Converts PDF pages to images
- **tesseract.js**: Performs OCR on images
- **pdf-parse**: Standard PDF text extraction

### Configuration

The OCR system uses the following settings:

```javascript
{
  density: 300,        // DPI for image quality
  format: 'png',       // Image format
  width: 2000,         // Image width in pixels
  height: 2000,        // Image height in pixels
  pageLimit: 20        // Maximum pages to process
}
```

### Text Validation

A PDF is considered to have insufficient text if:
- Less than 100 characters of text
- Fewer than 10 meaningful words (length > 2)
- Only whitespace or formatting characters

## Performance Considerations

### Processing Time

- **Standard extraction**: < 1 second
- **OCR per page**: 2-5 seconds
- **10-page document**: ~30-60 seconds

### Resource Usage

OCR processing is memory-intensive:
- Each page requires ~50-100MB RAM during processing
- Temporary disk space for image conversion
- CPU-intensive image processing

### Optimization

The system includes several optimizations:

1. **Page Limit**: Processes maximum 20 pages to prevent timeouts
2. **Cleanup**: Automatic deletion of temporary files
3. **Worker Management**: Proper termination of Tesseract workers
4. **Error Handling**: Continues processing if individual pages fail

## API Integration

The OCR functionality is transparent to API users:

```javascript
// Process report endpoint
POST /api/reports/process
{
  "report_id": "..."
}
```

The system automatically:
1. Attempts standard extraction
2. Falls back to OCR if needed
3. Logs which method was used
4. Returns processed text regardless of method

## Monitoring and Debugging

### Console Logs

The system provides detailed logging:

```
PDF text extracted successfully using standard extraction
// or
PDF appears to be scanned. Attempting OCR extraction...
Processing 5 pages with OCR...
OCR completed for page 1/5
OCR completed for page 2/5
...
PDF text extracted successfully using OCR
```

### Error Handling

Common errors and solutions:

**Error**: "Unable to extract sufficient text from PDF"
- **Cause**: Both standard and OCR extraction failed
- **Solution**: Check PDF file integrity, ensure it contains readable text

**Error**: "OCR extraction error"
- **Cause**: Image conversion or Tesseract processing failed
- **Solution**: Check disk space, memory availability

**Error**: "Error cleaning up temp directory"
- **Cause**: Permission issues or locked files
- **Solution**: Check filesystem permissions

## Testing

### Unit Tests

```javascript
// Test standard extraction
test('should extract text from regular PDF', async () => {
  const text = await extractPDFText('regular-report.pdf');
  expect(text).toBeTruthy();
  expect(text.length).toBeGreaterThan(100);
});

// Test OCR fallback
test('should use OCR for scanned PDF', async () => {
  const text = await extractPDFText('scanned-report.pdf');
  expect(text).toContain('Page'); // OCR adds page markers
});
```

### Manual Testing

To test OCR functionality:

1. Create a scanned PDF (or use a smartphone to scan a document)
2. Upload through the API
3. Check console logs for "Attempting OCR extraction"
4. Verify extracted text in the response

## Limitations

### Current Limitations

1. **Page Limit**: Maximum 20 pages processed
2. **Language**: English only (configurable)
3. **Image Quality**: Requires clear, high-contrast scans
4. **Processing Time**: Can be slow for large documents
5. **Handwriting**: Cannot reliably recognize handwritten text

### Future Enhancements

Potential improvements:

- Multi-language support
- Parallel page processing
- Image preprocessing (deskew, denoise)
- Caching of OCR results
- Progress reporting for long documents
- Handwriting recognition models

## Best Practices

### For Users

1. **Upload Quality**: Use high-quality scans (300 DPI minimum)
2. **File Size**: Keep PDFs under 10MB
3. **Pages**: Limit documents to 20 pages for optimal processing
4. **Orientation**: Ensure pages are properly oriented

### For Developers

1. **Timeouts**: Set appropriate timeouts for OCR operations (60+ seconds)
2. **Memory**: Ensure adequate server memory (2GB+ recommended)
3. **Monitoring**: Watch for OCR usage patterns and performance
4. **Cleanup**: Verify temporary files are being removed

## Production Deployment

### Environment Variables

No additional configuration needed. OCR activates automatically when required.

### System Requirements

- **RAM**: Minimum 2GB, recommended 4GB+
- **CPU**: Multi-core recommended for better performance
- **Disk**: Temporary space for image files (~50MB per page)

### Scaling Considerations

For high-volume deployments:

1. **Queue System**: Implement job queue for OCR tasks
2. **Worker Pool**: Dedicate separate workers for OCR processing
3. **Caching**: Cache OCR results to avoid reprocessing
4. **Load Balancing**: Distribute OCR tasks across multiple servers

## Troubleshooting

### OCR Not Triggering

**Symptom**: PDFs are marked as "failed" without OCR attempt

**Solutions**:
1. Check if standard extraction returns valid text
2. Verify pdf2pic and tesseract.js are installed
3. Review console logs for error messages

### Poor OCR Accuracy

**Symptom**: Extracted text has many errors

**Solutions**:
1. Increase image DPI (density setting)
2. Ensure source PDF is high quality
3. Preprocess images (external tools)
4. Consider alternative OCR engines

### Memory Issues

**Symptom**: Server crashes during OCR processing

**Solutions**:
1. Reduce page limit
2. Increase server memory
3. Process pages sequentially instead of in parallel
4. Implement pagination for large documents

## Support and Resources

- **Tesseract.js Documentation**: https://tesseract.projectnaptha.com/
- **pdf2pic Documentation**: https://github.com/yakovmeister/pdf2image
- **OCR Best Practices**: Research high-quality scanning techniques

## Example Usage

### Backend Processing

```javascript
// Automatic OCR handling (no code changes needed)
const text = await extractPDFText(filePath);
// Returns text from standard extraction OR OCR
```

### API Response

```json
{
  "report_id": "...",
  "status": "completed",
  "raw_text": "--- Page 1 ---\nExtracted text here...\n--- Page 2 ---\n...",
  "processing_time_ms": 45000,
  "birads": { "value": 4, ... },
  "findings": [...],
  ...
}
```

The `raw_text` field contains the extracted text, whether from standard extraction or OCR. Page markers (e.g., "--- Page 1 ---") indicate OCR was used.

## Conclusion

The OCR support in RadReport AI provides robust handling of scanned radiology reports without requiring manual intervention. The system intelligently detects when OCR is needed and automatically falls back to ensure all documents can be processed effectively.
