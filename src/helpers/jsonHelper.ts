export const getJsonValue = (jsonObject: Record<string, unknown>, key: string, defaultValue: unknown): unknown => {
  try {
    if (jsonObject && Object.prototype.hasOwnProperty.call(jsonObject, key)) {
      return jsonObject[key];
    } else {
      console.warn(`Key '${key}' not found in JSON object. Returning default value.`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error getting JSON value for key '${key}':`, error);
    return defaultValue;
  }
};

export const getJsonArray = (jsonObject: Record<string, unknown>, key: string): unknown[] => {
  try {
    if (jsonObject && Object.prototype.hasOwnProperty.call(jsonObject, key) && Array.isArray(jsonObject[key])) {
      return jsonObject[key] as unknown[];
    } else {
      console.warn(`Key '${key}' not found or is not an array in JSON object. Returning empty array.`);
      return [];
    }
  } catch (error) {
    console.error(`Error getting JSON array for key '${key}':`, error);
    return [];
  }
};