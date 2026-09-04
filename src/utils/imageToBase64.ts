// src/utils/imageToBase64.ts
import * as FileSystem from "expo-file-system/legacy";

/**
 * Convierte una URI de imagen (local file://, content://, o remota http/https)
 * en un data URI base64 embebible directamente en HTML.
 * Si falla, devuelve undefined en lugar de romper la generación del PDF.
 */
export async function uriToBase64DataUri(
  uri?: string | null,
): Promise<string | undefined> {
  if (!uri) return undefined;
  if (uri.startsWith("data:")) return uri; // ya viene en base64

  try {
    let localUri = uri;

    // Si es remota, la descargamos primero a un archivo temporal local
    if (uri.startsWith("http")) {
      const fileName =
        uri.split("/").pop()?.split("?")[0] ?? `tmp-${Date.now()}.jpg`;
      const dest = `${FileSystem.cacheDirectory}${fileName}`;
      const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, dest);
      localUri = downloadedUri;
    }

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const ext = localUri.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

    return `data:${mime};base64,${base64}`;
  } catch (error) {
    console.warn(
      "[uriToBase64DataUri] No se pudo convertir la imagen:",
      uri,
      error,
    );
    return undefined; // el PDF se genera igual, sin esa imagen
  }
}
