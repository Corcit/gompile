/**
 * Upload Boycott Companies Data to Firebase
 * 
 * This script imports and runs the boycott companies data upload function.
 * It doesn't modify any app functionality, just populates the Firestore collection.
 */

console.log('Starting upload of boycott companies data to Firebase...');

// Import the script with the direct upload call
require('./boycottCompaniesData');

console.log('Script execution initiated. Check logs for results.'); 