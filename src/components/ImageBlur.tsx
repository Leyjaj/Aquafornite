const fallbackBase64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PSc5Jz48cmVjdCB3aWR0aD0nMTYnIGhlaWdodD0nOScgZmlsbD0nIzBlMjM0OScvPjwvc3ZnPg==";

const ImageBlur = async (url: string) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return fallbackBase64;
    return fallbackBase64;
  } catch {
    return fallbackBase64;
  }
};

export default ImageBlur;
