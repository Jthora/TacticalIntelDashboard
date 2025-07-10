// This is a temporary fix to bypass CSS processing issues with nanoid
// The file provides mock CSS functionality during development
console.log('CSS processing bypassed to fix nanoid compatibility issues');

// Export a mock CSS processor
export default {
  process: () => {
    return {
      css: '',
      map: null,
      messages: [],
      result: {
        css: '',
        map: null,
        messages: [],
        opts: {}
      }
    };
  }
};
