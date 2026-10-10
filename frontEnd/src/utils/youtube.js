// يرجّع الـ video id من أي صيغة لينك يوتيوب، أو null لو اللينك مش صالح
export function getYouTubeId(url) {
  try {
    const u = new URL(String(url).trim());
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") return u.pathname.slice(1) || null;

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/"))
        return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}