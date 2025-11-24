declare module 'pako' {
  export function deflate(data: string | Uint8Array, options?: { level?: number }): Uint8Array;
  export function inflate(data: Uint8Array, options: { to: 'string' }): string;
  export function inflate(data: Uint8Array, options?: Record<string, unknown>): Uint8Array;
  export function gzip(data: string | Uint8Array, options?: { level?: number }): Uint8Array;
}
