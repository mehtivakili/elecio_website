const BRANDABLE_IMAGE = /^\/(?:uploads|images)\/[\p{L}\p{N}._~!$&'()+,;=@%/-]+$/u;

export function isBrandableImagePath(value: unknown): value is string {
  return typeof value === 'string'
    && value.length <= 500
    && BRANDABLE_IMAGE.test(value)
    && !value.includes('..')
    && /\.(?:avif|jpe?g|png|webp)$/i.test(value);
}

export function brandedImagePath(value: string): string {
  return isBrandableImagePath(value)
    ? `/api/media/branded?src=${encodeURIComponent(value)}`
    : value;
}
