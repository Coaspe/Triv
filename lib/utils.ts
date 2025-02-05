/** @format */

export function getYouTubeVideoID(url: string) {
  try {
    const urlObj = new URL(url);

    // Check if the URL is a short link (youtu.be)
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.substring(1); // Return everything after the "/"
    }

    // Check if the URL is a standard YouTube link
    if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
      return urlObj.searchParams.get("v"); // Get the "v" parameter
    }

    throw new Error("Invalid YouTube URL");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error extracting YouTube video ID:", error.message);
    } else {
      console.error("Error extracting YouTube video ID:", error);
    }
    return null;
  }
}
