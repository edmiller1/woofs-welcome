export function optimizeImage(
  imageUrl: string,
  width = 320,
  height = 240,
  quality = 85
) {
  if (!imageUrl) return "";

  return `https://woofswelcome.app/cdn-cgi/image/width=${width},height=${height},quality=${quality},format=auto/${imageUrl}`;
}
