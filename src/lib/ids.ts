/**
 * Generates a random UUID (version 4) for new boards, columns, tasks and
 * subtasks. Passed to the core operations as their IdFactory.
 *
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS or
 * localhost). Opening the dev server from a phone over the LAN
 * (http://192.168.x.x) is not one, so there we build the same UUID from
 * `crypto.getRandomValues()`, which is available everywhere.
 */
export function createId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return uuidFromRandomBytes();
}

/** RFC 9562 version 4 UUID from 16 random bytes. Exported for testing. */
export function uuidFromRandomBytes(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40; // version 4
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
