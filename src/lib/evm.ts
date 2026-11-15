/**
 * EVM address validation shared by the wallet form (client) and the
 * /api/tasks/wallet route (server). The regex intentionally is the
 * exact rule from the spec; no checksum enforcement so lowercase
 * addresses from any wallet are accepted.
 */
export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function isEvmAddress(value: string): boolean {
  return EVM_ADDRESS_REGEX.test(value.trim());
}

export function shortenAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head + 2)}…${address.slice(-tail)}`;
}
