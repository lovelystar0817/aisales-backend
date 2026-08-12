// src/utils/json.ts
/**
 * Safely parses JSON from string content, handling code blocks and common issues
 * @param content - String containing JSON, optionally within code blocks, or already parsed JSON object
 */
export function parseJsonSafely(content: any): any {
  // If content is not a string, assume it's already parsed JSON
  if (typeof content !== 'string') {
    return content;
  }
  // Handle empty or invalid input
  if (!content) {
    throw new Error('Empty content provided');
  }

  // Clean up the content
  let jsonString = content.trim();

  // Remove code block markers if present
  if (jsonString.startsWith('```json') || jsonString.startsWith('```')) {
    const lines = jsonString.split('\n');
    let startIdx = 0;
    let endIdx = lines.length;

    // Find the start and end of the code block
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('```') && startIdx === 0) {
        startIdx = i + 1;
      } else if (lines[i].includes('```') && i > startIdx) {
        endIdx = i;
        break;
      }
    }

    jsonString = lines.slice(startIdx, endIdx).join('\n');
  }

  // Remove double curly braces if present
  if (jsonString.startsWith('{{')) {
    jsonString = jsonString.replace(/^\{\{/, '{').replace(/\}\}$/, '}');
  }

  // Handle leading/trailing text by trying to extract JSON object
  if (
    !jsonString.startsWith('[') && // not an array
    !jsonString.startsWith('{') && // and not an object
    jsonString.includes('{')
  ) {
    const startIdx = jsonString.indexOf('{');
    const endIdx = jsonString.lastIndexOf('}') + 1;
    if (endIdx > startIdx) {
      jsonString = jsonString.substring(startIdx, endIdx);
    }
  }

  // Try to parse the JSON
  try {
    return JSON.parse(jsonString);
  } catch (error: any) {
    // Fallback: Fix common LLM escaping issue where \" appears inside JSON strings
    // Example: "text": \"Hello\" should be "text": "Hello"
    console.log('[JSON Parser] Parse failed, trying to fix escape sequences');

    try {
      const fixed = jsonString.replace(/\\"/g, '"');
      return JSON.parse(fixed);
    } catch (secondError: any) {
      console.error('Attempted to parse string:', jsonString);
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
}

/**
 * Parses JSON from an API response
 * @param response - API response object with content field
 */
export function parseResponse(response: any): any {
  if (!response?.content) {
    throw new Error('Invalid response format');
  }

  return parseJsonSafely(response.content);
}
