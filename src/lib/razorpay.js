import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Initialize Razorpay client
 * Returns null if RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured
 */
export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * Verify Razorpay webhook signature
 * @param {string} webhookSignature - The signature from Razorpay webhook
 * @param {string} webhookBody - The raw webhook body
 * @param {string} webhookSecret - The webhook secret from Razorpay
 * @returns {boolean} - Whether the signature is valid
 */
export function verifyWebhookSignature(webhookSignature, webhookBody, webhookSecret) {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookBody)
      .digest("hex");
    
    return crypto.timingSafeEqual(
      Buffer.from(webhookSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Convert USD amount to INR (Indian Rupees)
 * For production, use a real-time exchange rate API
 * @param {number} usdAmount - Amount in USD
 * @returns {number} - Amount in INR (paise, smallest currency unit)
 */
export function usdToInr(usdAmount) {
  // Default conversion rate: 1 USD = 83 INR (approximate)
  // In production, fetch from a real-time exchange rate API
  const exchangeRate = parseFloat(process.env.USD_TO_INR_RATE || "83");
  const inrAmount = usdAmount * exchangeRate;
  
  // Convert to paise (multiply by 100) since Razorpay uses smallest currency unit
  return Math.round(inrAmount * 100);
}

export default razorpay;

