export const getTextContent = (element: Element, tagName: string, defaultValue: string): string => {
  try {
    const selectedElement = element.querySelector(tagName);

    if (selectedElement) {
      return selectedElement.textContent || defaultValue;
    } else {
      console.warn(`Element with tag name '${tagName}' not found in element '${element.tagName}'. Returning default value.`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting text content for tag name '${tagName}' in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

export const getAttributeValue = (element: Element, attributeName: string, defaultValue: string): string => {
  try {
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue) {
      return attributeValue;
    } else {
      console.warn(`Attribute '${attributeName}' not found on element '${element.tagName}'. Returning default value.`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting attribute value for attribute '${attributeName}' in element '${element.tagName}':`, error);
    return defaultValue;
  }
};

export const getAllTextContents = (element: Element, tagName: string): string[] => {
  const elements = element.querySelectorAll(tagName);
  const contents: string[] = [];

  elements.forEach(el => {
    if (el.textContent) {
      contents.push(el.textContent);
    }
  });

  return contents;
};

export const getTextContentWithFallback = (element: Element, primaryTagName: string, fallbackTagName: string, defaultValue: string): string => {
  const primaryContent = getTextContent(element, primaryTagName, "");
  if (primaryContent) {
    return primaryContent;
  } else {
    return getTextContent(element, fallbackTagName, defaultValue);
  }
};

export const getMultipleTextContents = (element: Element, tagNames: string[], defaultValue: string): string[] => {
  return tagNames.map(tagName => getTextContent(element, tagName, defaultValue));
};

export const getNestedTextContent = (element: Element, tagNames: string[], defaultValue: string): string => {
  let currentElement: Element | null = element;
  for (const tagName of tagNames) {
    currentElement = currentElement.querySelector(tagName);
    if (!currentElement) {
      console.warn(`Nested element with tag name '${tagName}' not found in element '${element.tagName}'. Returning default value.`);
      return defaultValue;
    }
  }
  return currentElement.textContent || defaultValue;
};

export const getTextContentByAttribute = (element: Element, tagName: string, attributeName: string, attributeValue: string, defaultValue: string): string => {
  const elements = element.querySelectorAll(tagName);
  const selectedElement = Array.from(elements).find(el => el.getAttribute(attributeName) === attributeValue);

  if (selectedElement) {
    return selectedElement.textContent || defaultValue;
  } else {
    console.warn(`Element with tag name '${tagName}' and attribute '${attributeName}=${attributeValue}' not found in element '${element.tagName}'. Returning default value.`);
    return defaultValue;
  }
};

export const getAllAttributes = (element: Element, tagName: string): { [key: string]: string }[] => {
  const elements = element.querySelectorAll(tagName);
  const attributesArray: { [key: string]: string }[] = [];

  elements.forEach(el => {
    const attributes: { [key: string]: string } = {};
    Array.from(el.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    attributesArray.push(attributes);
  });

  return attributesArray;
};

export const getElementByTagName = (element: Element, tagName: string): Element | null => {
  return element.querySelector(tagName);
};

export const getElementsByTagName = (element: Element, tagName: string): NodeListOf<Element> => {
  return element.querySelectorAll(tagName);
};

// New helper function to handle namespaced elements
export const getNamespacedTextContent = (element: Element, namespace: string, tagName: string, defaultValue: string): string => {
  try {
    const selectedElement = element.querySelector(`${namespace}\\:${tagName}`);

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