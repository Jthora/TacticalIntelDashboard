export class ClassificationUtils {
  /**
   * Normalize free-form classification labels to uppercase tokens.
   */
  static normalizeLevel(level?: string): string {
    return level?.trim().toUpperCase() || 'UNMARKED';
  }

  /**
   * Minimal validation to discourage empty markings.
   */
  static validate(level?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (level && !level.trim()) {
      errors.push('Classification labels must contain visible characters.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
