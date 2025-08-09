import {
  handleFetchError,
  handleHTMLParsingError,
  handleJSONParsingError,
  handleTXTParsingError,
  handleXMLParsingError} from '../errorHandler';

// Mock console methods
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Error Handler Utils', () => {
  const testUrl = 'https://example.com/feed';

  describe('handleFetchError', () => {
    it('should handle AbortError', () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      
      handleFetchError(error, testUrl);
      
      expect(console.warn).toHaveBeenCalledWith(`Fetch aborted for URL: ${testUrl}`);
    });

    it('should handle PR_END_OF_FILE_ERROR', () => {
      const error = new Error('PR_END_OF_FILE_ERROR occurred');
      
      handleFetchError(error, testUrl);
      
      expect(console.error).toHaveBeenCalledWith(
        `PR_END_OF_FILE_ERROR encountered for URL: ${testUrl}. This might be due to a network issue or server misconfiguration.`
      );
    });

    it('should handle NetworkError', () => {
      const error = new Error('NetworkError: failed to fetch');
      
      handleFetchError(error, testUrl);
      
      expect(console.error).toHaveBeenCalledWith(
        `Network error encountered for URL: ${testUrl}. Please check your internet connection.`
      );
    });

    it('should handle Failed to fetch error', () => {
      const error = new Error('Failed to fetch');
      
      handleFetchError(error, testUrl);
      
      expect(console.error).toHaveBeenCalledWith(
        `Failed to fetch URL: ${testUrl}. This might be due to a CORS issue or the server being down.`
      );
    });

    it('should handle HTTP status errors', () => {
      const error404 = new Error('404 Not Found');
      const error500 = new Error('500 Internal Server Error');
      const error502 = new Error('502 Bad Gateway');
      const error503 = new Error('503 Service Unavailable');
      const error504 = new Error('504 Gateway Timeout');
      
      handleFetchError(error404, testUrl);
      handleFetchError(error500, testUrl);
      handleFetchError(error502, testUrl);
      handleFetchError(error503, testUrl);
      handleFetchError(error504, testUrl);
      
      expect(console.error).toHaveBeenCalledWith(
        `404 Not Found error for URL: ${testUrl}. The requested resource could not be found.`
      );
      expect(console.error).toHaveBeenCalledWith(
        `500 Internal Server Error for URL: ${testUrl}. The server encountered an unexpected condition.`
      );
      expect(console.error).toHaveBeenCalledWith(
        `502 Bad Gateway error for URL: ${testUrl}. The server received an invalid response from the upstream server.`
      );
      expect(console.error).toHaveBeenCalledWith(
        `503 Service Unavailable error for URL: ${testUrl}. The server is currently unable to handle the request.`
      );
      expect(console.error).toHaveBeenCalledWith(
        `504 Gateway Timeout error for URL: ${testUrl}. The server did not receive a timely response from the upstream server.`
      );
    });

    it('should handle TypeError', () => {
      const error = new Error('TypeError: cannot read property');
      
      handleFetchError(error, testUrl);
      
      expect(console.error).toHaveBeenCalledWith(
        `TypeError encountered for URL: ${testUrl}. This might be due to an invalid response or a network issue.`
      );
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error occurred');
      
      handleFetchError(error, testUrl);
      
      expect(console.error).toHaveBeenCalledWith(`Error fetching URL: ${testUrl}`, error);
    });
  });

  describe('handleXMLParsingError', () => {
    const xmlContent = '<xml>test content</xml>';

    it('should handle mismatched tag error', () => {
      const error = new Error('mismatched tag error');
      
      handleXMLParsingError(testUrl, error, xmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Mismatched tag error in XML data fetched for URL: ${testUrl}`);
    });

    it('should handle invalid token error', () => {
      const error = new Error('invalid token in XML');
      
      handleXMLParsingError(testUrl, error, xmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Invalid token error in XML data fetched for URL: ${testUrl}`);
    });

    it('should handle unclosed token error', () => {
      const error = new Error('unclosed token detected');
      
      handleXMLParsingError(testUrl, error, xmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unclosed token error in XML data fetched for URL: ${testUrl}`);
    });

    it('should handle unexpected end of input', () => {
      const error = new Error('unexpected end of input');
      
      handleXMLParsingError(testUrl, error, xmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected end of input error in XML data fetched for URL: ${testUrl}`);
    });

    it('should handle parser error with content logging', () => {
      const error = new Error('parsererror detected');
      
      handleXMLParsingError(testUrl, error, xmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Parser error in XML data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`XML Content: ${xmlContent}`);
    });

    it('should handle unknown XML errors', () => {
      const error = new Error('Unknown XML error');
      
      handleXMLParsingError(testUrl, error, xmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unknown XML parsing error for URL: ${testUrl}`, error);
      expect(console.warn).toHaveBeenCalledWith(`XML Content: ${xmlContent}`);
    });
  });

  describe('handleJSONParsingError', () => {
    const jsonContent = '{"test": "content"}';

    it('should handle unexpected token error', () => {
      const error = new Error('Unexpected token } in JSON');
      
      handleJSONParsingError(testUrl, error, jsonContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected token error in JSON data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`JSON Content: ${jsonContent}`);
    });

    it('should handle unexpected end of JSON input', () => {
      const error = new Error('Unexpected end of JSON input');
      
      handleJSONParsingError(testUrl, error, jsonContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected end of JSON input error in JSON data fetched for URL: ${testUrl}`);
    });

    it('should handle unexpected string in JSON', () => {
      const error = new Error('Unexpected string in JSON');
      
      handleJSONParsingError(testUrl, error, jsonContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected string error in JSON data fetched for URL: ${testUrl}`);
    });

    it('should handle various JSON data type errors', () => {
      const numberError = new Error('Unexpected number in JSON');
      const booleanError = new Error('Unexpected boolean in JSON');
      const nullError = new Error('Unexpected null in JSON');
      const charError = new Error('Unexpected character in JSON');
      
      handleJSONParsingError(testUrl, numberError, jsonContent);
      handleJSONParsingError(testUrl, booleanError, jsonContent);
      handleJSONParsingError(testUrl, nullError, jsonContent);
      handleJSONParsingError(testUrl, charError, jsonContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected number error in JSON data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`Unexpected boolean error in JSON data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`Unexpected null error in JSON data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`Unexpected character error in JSON data fetched for URL: ${testUrl}`);
    });

    it('should handle unknown JSON errors', () => {
      const error = new Error('Unknown JSON error');
      
      handleJSONParsingError(testUrl, error, jsonContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unknown JSON parsing error for URL: ${testUrl}`, error);
      expect(console.warn).toHaveBeenCalledWith(`JSON Content: ${jsonContent}`);
    });
  });

  describe('handleTXTParsingError', () => {
    const txtContent = 'Some text content';

    it('should handle unexpected token error', () => {
      const error = new Error('Unexpected token in text');
      
      handleTXTParsingError(testUrl, error, txtContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected token error in TXT data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`TXT Content: ${txtContent}`);
    });

    it('should handle unexpected end of input', () => {
      const error = new Error('Unexpected end of input');
      
      handleTXTParsingError(testUrl, error, txtContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected end of input error in TXT data fetched for URL: ${testUrl}`);
    });

    it('should handle encoding errors', () => {
      const error = new Error('Encoding error detected');
      
      handleTXTParsingError(testUrl, error, txtContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Encoding error in TXT data fetched for URL: ${testUrl}`);
    });

    it('should handle unknown TXT errors', () => {
      const error = new Error('Unknown TXT error');
      
      handleTXTParsingError(testUrl, error, txtContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unknown TXT parsing error for URL: ${testUrl}`, error);
      expect(console.warn).toHaveBeenCalledWith(`TXT Content: ${txtContent}`);
    });
  });

  describe('handleHTMLParsingError', () => {
    const htmlContent = '<html><body>Test content</body></html>';

    it('should handle unexpected token error', () => {
      const error = new Error('Unexpected token in HTML');
      
      handleHTMLParsingError(testUrl, error, htmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unexpected token error in HTML data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`HTML Content: ${htmlContent}`);
    });

    it('should handle HTML tag errors', () => {
      const unclosedError = new Error('Unclosed tag detected');
      const mismatchedError = new Error('Mismatched tag found');
      
      handleHTMLParsingError(testUrl, unclosedError, htmlContent);
      handleHTMLParsingError(testUrl, mismatchedError, htmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unclosed tag error in HTML data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`Mismatched tag error in HTML data fetched for URL: ${testUrl}`);
    });

    it('should handle encoding and character errors', () => {
      const encodingError = new Error('Encoding error in HTML');
      const charError = new Error('Invalid character found');
      
      handleHTMLParsingError(testUrl, encodingError, htmlContent);
      handleHTMLParsingError(testUrl, charError, htmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Encoding error in HTML data fetched for URL: ${testUrl}`);
      expect(console.warn).toHaveBeenCalledWith(`Invalid character error in HTML data fetched for URL: ${testUrl}`);
    });

    it('should handle unknown HTML errors', () => {
      const error = new Error('Unknown HTML error');
      
      handleHTMLParsingError(testUrl, error, htmlContent);
      
      expect(console.warn).toHaveBeenCalledWith(`Unknown HTML parsing error for URL: ${testUrl}`, error);
      expect(console.warn).toHaveBeenCalledWith(`HTML Content: ${htmlContent}`);
    });
  });
});
