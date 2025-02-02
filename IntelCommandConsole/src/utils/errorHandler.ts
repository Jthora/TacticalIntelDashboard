export const handleFetchError = (error: Error, url: string): void => {
  if (error.name === 'AbortError') {
    console.warn(`Fetch aborted for URL: ${url}`);
  } else if (error.message.includes('PR_END_OF_FILE_ERROR')) {
    console.error(`PR_END_OF_FILE_ERROR encountered for URL: ${url}. This might be due to a network issue or server misconfiguration.`);
  } else if (error.message.includes('NetworkError')) {
    console.error(`Network error encountered for URL: ${url}. Please check your internet connection.`);
  } else if (error.message.includes('Failed to fetch')) {
    console.error(`Failed to fetch URL: ${url}. This might be due to a CORS issue or the server being down.`);
  } else if (error.message.includes('404')) {
    console.error(`404 Not Found error for URL: ${url}. The requested resource could not be found.`);
  } else if (error.message.includes('500')) {
    console.error(`500 Internal Server Error for URL: ${url}. The server encountered an unexpected condition.`);
  } else if (error.message.includes('502')) {
    console.error(`502 Bad Gateway error for URL: ${url}. The server received an invalid response from the upstream server.`);
  } else if (error.message.includes('503')) {
    console.error(`503 Service Unavailable error for URL: ${url}. The server is currently unable to handle the request.`);
  } else if (error.message.includes('504')) {
    console.error(`504 Gateway Timeout error for URL: ${url}. The server did not receive a timely response from the upstream server.`);
  } else if (error.message.includes('TypeError')) {
    console.error(`TypeError encountered for URL: ${url}. This might be due to an invalid response or a network issue.`);
  } else {
    console.error(`Error fetching URL: ${url}`, error);
  }
};

export const handleXMLParsingError = (url: string, error: Error, xmlContent: string): void => {
  if (error.message.includes('mismatched tag')) {
    console.warn(`Mismatched tag error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('invalid token')) {
    console.warn(`Invalid token error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('unclosed token')) {
    console.warn(`Unclosed token error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('unexpected end of input')) {
    console.warn(`Unexpected end of input error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('entity not defined')) {
    console.warn(`Entity not defined error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('invalid character')) {
    console.warn(`Invalid character error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('attribute without value')) {
    console.warn(`Attribute without value error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('duplicate attribute')) {
    console.warn(`Duplicate attribute error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('invalid attribute name')) {
    console.warn(`Invalid attribute name error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('invalid element name')) {
    console.warn(`Invalid element name error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('namespace error')) {
    console.warn(`Namespace error in XML data fetched for URL: ${url}`);
  } else if (error.message.includes('parsererror')) {
    console.warn(`Parser error in XML data fetched for URL: ${url}`);
    console.warn(`XML Content: ${xmlContent}`);
  } else {
    console.warn(`Unknown XML parsing error for URL: ${url}`, error);
    console.warn(`XML Content: ${xmlContent}`);
  }
};