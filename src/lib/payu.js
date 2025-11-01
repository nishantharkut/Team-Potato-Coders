import crypto from "crypto";

/**
 * PayU utility functions for Indian payment processing
 * PayU supports non-seamless integration without requiring a website during onboarding
 */

/**
 * Convert USD amount to INR (Indian Rupees)
 * @param {number} usdAmount - Amount in USD
 * @returns {number} - Amount in INR (multiplied by 100 for smallest currency unit)
 */
export function usdToInr(usdAmount) {
  const exchangeRate = parseFloat(process.env.USD_TO_INR_RATE || "83");
  const inrAmount = usdAmount * exchangeRate;
  // PayU uses amount in smallest currency unit (multiply by 100)
  return Math.round(inrAmount * 100);
}

/**
 * Generate PayU hash for payment request
 * @param {object} params - Payment parameters
 * @param {string} salt - PayU salt key
 * @returns {string} - Generated hash
 */
export function generatePayUHash(params, salt) {
  const hashString = 
    `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;
  
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

/**
 * Verify PayU payment response hash
 * @param {object} params - Payment response parameters
 * @param {string} salt - PayU salt key
 * @returns {boolean} - Whether hash is valid
 */
export function verifyPayUHash(params, salt) {
  const hashString = 
    `${salt}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`;
  
  const expectedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(params.hash),
    Buffer.from(expectedHash)
  );
}

/**
 * Get PayU configuration
 */
export function getPayUConfig() {
  const key = process.env.PAYU_KEY;
  const salt = process.env.PAYU_SALT;
  const testMode = process.env.PAYU_TEST_MODE === "true";
  
  return {
    key,
    salt,
    testMode,
    baseUrl: testMode 
      ? "https://test.payu.in" 
      : "https://secure.payu.in",
    merchantId: process.env.PAYU_MERCHANT_ID,
  };
}

export default {
  usdToInr,
  generatePayUHash,
  verifyPayUHash,
  getPayUConfig,
};

