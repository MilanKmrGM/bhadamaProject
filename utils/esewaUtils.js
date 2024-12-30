const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js')

/**
 * Generate a unique transaction UUID.
 * @returns {string} A unique transaction UUID
 */
const generateTransactionUuid = () => {
  const result = uuidv4(); // Example: '123e4567-e89b-12d3-a456-426614174000'
  console.log(result, "I am transaction_uuid")
  return result
};

/**
 * Generate the signature for eSewa API request.
 * @param {string} message - The concatenated message string based on signed field names.
 * @returns {string} A base64-encoded HMAC-SHA256 signature
 */
const generateSignature = (message) => {
  // Create the HMAC SHA256 hash using the secret key
  const hash = CryptoJS.HmacSHA256(message, process.env.SECRET_KEY);
  
  // Convert the hash to a Base64 string
  const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  console.log(hashInBase64, " I am from signature")
  // Return the Base64 encoded hash
  return hashInBase64;
}


/**
 * Generate a message string for signature based on signed field names.
 * @param {object} fields - An object containing the signed field values in order.
 * @param {string[]} signedFieldNames - The array of signed field names (must be in order).
 * @returns {string} A concatenated string for signature generation.
 */
const  generateSignedFieldNames = (fields, signedFieldNames) => {
    const result = signedFieldNames
      .map((field) => `${field}=${fields[field]}`) // Convert each field to key=value
      .join(','); // Join the fields with commas
    console.log(result, "I am from utils")
    return result
  }

  /* console.log(generateTransactionUuid(), "I am here")
  const check = generateSignedFieldNames({milan: "milan", kumar: "kumar", gharti: "gharti"}, ["milan", "kumar", "gharti"])
  console.log(check, " I am here again")
  console.log(generateSignature(check), " I am here last")
 */
module.exports = {
  generateTransactionUuid,
  generateSignature,
  generateSignedFieldNames,
};
