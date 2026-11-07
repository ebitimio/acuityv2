/**
 * Secure hashing for app PIN using Web Crypto SHA-256 with salt.
 */
export async function hashPin(pin: string): Promise<string> {
  const normalized = pin.trim();
  if (!normalized) return "";

  try {
    const enc = new TextEncoder();
    const data = enc.encode(`acuity_pin_v2_${normalized}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback if subtle crypto is somehow unavailable
    return `hashed_${normalized}`;
  }
}

/**
 * Validates entered PIN against stored PIN hash (with backward compatibility for plaintext PINs).
 */
export async function verifyPin(enteredPin: string, storedPinHash: string | null): Promise<boolean> {
  if (!storedPinHash) return false;
  const hashed = await hashPin(enteredPin);
  return hashed === storedPinHash || enteredPin.trim() === storedPinHash.trim();
}
