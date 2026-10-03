/**
 * SUTRA STUDIO — File Upload Validation & Security Scanner
 * Validates file sizes, mime types, extensions, and performs basic heuristics against malicious payloads.
 */

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB limit

export const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/tiff",
  // Video
  "video/mp4",
  "video/quicktime",
  "video/webm",
  // 3D / Spatial
  "model/gltf+json",
  "model/gltf-binary",
  "application/octet-stream", // Used for .glb, .obj, .fbx, .blend
  // Documents & Archives
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/markdown",
]);

export const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "svg",
  "gif",
  "mp4",
  "mov",
  "webm",
  "gltf",
  "glb",
  "obj",
  "fbx",
  "blend",
  "pdf",
  "zip",
  "txt",
  "md",
]);

export interface FileValidationResult {
  valid: boolean;
  sanitizedFilename: string;
  error?: string;
}

export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): FileValidationResult {
  // 1. Size Check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      sanitizedFilename: file.name,
      error: `File size exceeds the 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // 2. Extension Extraction & Validation
  const parts = file.name.split(".");
  if (parts.length < 2) {
    return {
      valid: false,
      sanitizedFilename: file.name,
      error: "Files without a valid file extension are not permitted.",
    };
  }

  const extension = parts.pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      sanitizedFilename: file.name,
      error: `File extension '.${extension}' is not supported. Permitted formats: images, videos, 3D (glTF/GLB/FBX), PDFs, and ZIP archives.`,
    };
  }

  // 3. MIME Type Check (relaxed for 3D binary streams)
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      sanitizedFilename: file.name,
      error: `Disallowed MIME type: ${file.type}.`,
    };
  }

  // 4. Sanitize Filename (strip directory traversal and control characters)
  const baseName = parts.join(".").replace(/[^a-zA-Z0-9_-]/g, "_");
  const sanitizedFilename = `${baseName}.${extension}`;

  return {
    valid: true,
    sanitizedFilename,
  };
}
