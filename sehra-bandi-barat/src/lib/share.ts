"use client";

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export async function shareInvitation(data: { title: string; text: string; url: string }): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return "cancelled";
      // fall through to clipboard
    }
  }
  return copyLink(data.url);
}

export async function copyLink(url: string): Promise<ShareResult> {
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    // Legacy fallback for older in-app browsers
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok ? "copied" : "failed";
    } catch {
      return "failed";
    }
  }
}

export function whatsappUrl(text: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

export function currentUrl() {
  if (typeof window === "undefined") return "";
  const u = new URL(window.location.href);
  u.search = "";
  u.hash = "";
  return u.toString();
}
