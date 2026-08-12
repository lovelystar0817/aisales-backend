/**
 * SCORM Package Configuration
 *
 * This file can be customized for each SCORM package variant.
 * Each package can have different modules whitelisted.
 *
 * To create a new package variant:
 * 1. Copy this file
 * 2. Update the modules list with comma-separated friendlyIds
 * 3. Update packageName for identification
 * 4. Create a zip with all SCORM files including this config
 */
window.SCORM_CONFIG = {
  // Base URL for the training app (without query params)
  baseUrl: 'https://train.hupo.co/guest/grab/auth',

  // Package name for identification/debugging
  packageName: 'default',

  // Module whitelist - comma-separated list of module friendlyIds
  // Leave empty string to show all modules for the company
  // Example: 'pitching-basics,product-knowledge,objection-handling'
  modules: '',

  // Passing score threshold (0-100). Scores >= this value are considered "passed".
  // Should match the <adlcp:masteryscore> value in imsmanifest.xml.
  passingScore: 80,
};
