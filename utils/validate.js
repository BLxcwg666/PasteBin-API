function validatePaste(content, keeping) {
    const validKeepingOptions = ['5m', '10m', '1d', '1w', '1m', '1y', 'burn'];
    return content && typeof content === 'string' && validKeepingOptions.includes(keeping);
  }  
  
module.exports = { validatePaste };