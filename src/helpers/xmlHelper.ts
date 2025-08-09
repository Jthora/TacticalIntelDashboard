export const getTextContent = (element: Element, tagName: string, defaultValue: string): string => {
  try {
    const selectedElement = element.getElementsByTagName(tagName)[0];

    if (selectedElement) {
      return selectedElement.textContent || defaultValue;
    } else {
      // Don't log warnings for commonly optional RSS fields
      const silentFields = [
        'content:encoded', 'content', 'author', 'media:content', 'media:thumbnail', 
        'enclosure', 'dc:creator', 'managingEditor', 'webMaster', 'subtitle', 
        'summary', 'pubDate', 'description', 'published', 'updated'
      ];
      if (!silentFields.includes(tagName)) {
        console.warn(`Element with tag name '${tagName}' not found in element '${element.tagName}'. Returning default value.`);
      }
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting text content for tag name '${tagName}' in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

export const getAttributeValue = (element: Element, tagName: string, attributeName: string, defaultValue: string): string => {
  try {
    const selectedElement = element.getElementsByTagName(tagName)[0];

    if (selectedElement) {
      const attributeValue = selectedElement.getAttribute(attributeName);
      if (attributeValue) {
        return attributeValue;
      } else {
        console.warn(`Attribute '${attributeName}' not found on element with tag name '${tagName}' in element '${element.tagName}'. Returning default value.`);
        return defaultValue;
      }
    } else {
      console.warn(`Element with tag name '${tagName}' not found in element '${element.tagName}'. Returning default value.`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting attribute value for tag name '${tagName}' and attribute '${attributeName}' in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

export const getMultipleTextContents = (element: Element, tagNames: string[], defaultValue: string): string[] => {
  return tagNames.map(tagName => getTextContent(element, tagName, defaultValue));
};

export const getTextContentWithFallback = (element: Element, primaryTagName: string, fallbackTagName: string, defaultValue: string): string => {
  try {
    // First try the primary tag
    const primaryElement = element.getElementsByTagName(primaryTagName)[0];
    if (primaryElement && primaryElement.textContent?.trim()) {
      return primaryElement.textContent;
    }
    
    // Then try the fallback tag
    const fallbackElement = element.getElementsByTagName(fallbackTagName)[0];
    if (fallbackElement && fallbackElement.textContent?.trim()) {
      return fallbackElement.textContent;
    }
    
    // If neither found, don't log warnings for common optional fields
    const silentFields = ['content:encoded', 'content', 'author', 'media:content'];
    if (!silentFields.includes(primaryTagName) && !silentFields.includes(fallbackTagName)) {
      console.warn(`Neither '${primaryTagName}' nor '${fallbackTagName}' found in element '${element.tagName}'. Returning default value.`);
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error getting text content with fallback for '${primaryTagName}' and '${fallbackTagName}' in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

// Enhanced content extraction that handles multiple content formats
export const getContentWithFallback = (element: Element, defaultValue: string = ""): string => {
  try {
    // Try multiple content fields in order of preference
    const contentFields = [
      'content:encoded',  // WordPress and other CMS encoded content
      'content',          // Standard content field
      'description',      // RSS description (often contains full content)
      'summary',          // Atom summary
      'subtitle'          // Alternative content field
    ];
    
    for (const field of contentFields) {
      const fieldElement = element.getElementsByTagName(field)[0];
      if (fieldElement && fieldElement.textContent?.trim()) {
        const content = fieldElement.textContent.trim();
        
        // If this is a description field and it's substantial, use it
        if (field === 'description' && content.length > 100) {
          return content;
        }
        // For other fields, use any non-empty content
        else if (field !== 'description' && content.length > 0) {
          return content;
        }
        // If it's a short description and we haven't found anything else, store it as fallback
        else if (field === 'description' && !defaultValue) {
          defaultValue = content;
        }
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error getting content with fallback in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

// Enhanced author extraction
export const getAuthorWithFallback = (element: Element, defaultValue: string = ""): string => {
  try {
    // Try multiple author fields in order of preference
    const authorFields = [
      'dc:creator',      // Dublin Core creator (common in RSS)
      'author',          // Standard RSS author
      'managingEditor',  // RSS managingEditor
      'webMaster',       // RSS webMaster
      'creator'          // Alternative creator field
    ];
    
    for (const field of authorFields) {
      const fieldElement = element.getElementsByTagName(field)[0];
      if (fieldElement && fieldElement.textContent?.trim()) {
        return fieldElement.textContent.trim();
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error getting author with fallback in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

// Enhanced media extraction
export const getMediaWithFallback = (element: Element): { url: string, type: string }[] => {
  try {
    const media: { url: string, type: string }[] = [];
    
    // Try different media elements
    const mediaSelectors = [
      'media:content',
      'enclosure',
      'media:thumbnail',
      'image'
    ];
    
    for (const selector of mediaSelectors) {
      const mediaElements = element.getElementsByTagName(selector);
      Array.from(mediaElements).forEach(mediaElement => {
        const url = mediaElement.getAttribute('url') || 
                   mediaElement.getAttribute('href') || 
                   mediaElement.textContent?.trim();
        const type = mediaElement.getAttribute('type') || 
                    mediaElement.getAttribute('medium') || 
                    'unknown';
        
        if (url) {
          media.push({ url, type });
        }
      });
    }
    
    return media;
  } catch (error) {
    console.error(`Error getting media with fallback in element '${element.tagName}':`, error);
    return [];
  }
};

export const getAllTextContents = (element: Element, tagName: string): string[] => {
  const elements = element.getElementsByTagName(tagName);
  const contents: string[] = [];

  Array.from(elements).forEach(el => {
    if (el.textContent) {
      contents.push(el.textContent);
    }
  });

  return contents;
};

export const getNestedTextContent = (element: Element, tagNames: string[], defaultValue: string): string => {
  let currentElement: Element | null = element;
  for (const tagName of tagNames) {
    currentElement = currentElement.getElementsByTagName(tagName)[0];
    if (!currentElement) {
      console.warn(`Nested element with tag name '${tagName}' not found in element '${element.tagName}'. Returning default value.`);
      return defaultValue;
    }
  }
  return currentElement.textContent || defaultValue;
};

export const getTextContentByAttribute = (element: Element, tagName: string, attributeName: string, attributeValue: string, defaultValue: string): string => {
  const elements = element.getElementsByTagName(tagName);
  const selectedElement = Array.from(elements).find(el => el.getAttribute(attributeName) === attributeValue);

  if (selectedElement) {
    return selectedElement.textContent || defaultValue;
  } else {
    console.warn(`Element with tag name '${tagName}' and attribute '${attributeName}=${attributeValue}' not found in element '${element.tagName}'. Returning default value.`);
    return defaultValue;
  }
};

export const getAllAttributes = (element: Element, tagName: string): { [key: string]: string }[] => {
  const elements = element.getElementsByTagName(tagName);
  const attributesArray: { [key: string]: string }[] = [];

  Array.from(elements).forEach(el => {
    const attributes: { [key: string]: string } = {};
    Array.from(el.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    attributesArray.push(attributes);
  });

  return attributesArray;
};

export const getElementByTagName = (element: Element, tagName: string): Element | null => {
  return element.getElementsByTagName(tagName)[0] || null;
};

export const getElementsByTagName = (element: Element, tagName: string): HTMLCollectionOf<Element> => {
  return element.getElementsByTagName(tagName);
};

// New helper function to handle namespaced elements
export const getNamespacedTextContent = (element: Element, namespace: string, tagName: string, defaultValue: string): string => {
  try {
    const selectedElement = element.getElementsByTagNameNS(namespace, tagName)[0];

    if (selectedElement) {
      return selectedElement.textContent || defaultValue;
    } else {
      console.warn(`Element with namespaced tag name '${namespace}:${tagName}' not found in element '${element.tagName}'. Returning default value.`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting namespaced text content for tag name '${namespace}:${tagName}' in element '${element.tagName}':`, error);
    return defaultValue;
  }
};