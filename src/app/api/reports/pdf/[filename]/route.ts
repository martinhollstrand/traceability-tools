import { head } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    let { filename } = await params;

    // Security: prevent directory traversal
    if (filename.includes("..") || filename.includes("\\")) {
      return new Response("Invalid filename", { status: 400 });
    }

    // Decode URL-encoded filename (may be a full blob URL or just filename)
    filename = decodeURIComponent(filename);

    // Handle both full Vercel Blob URLs and filenames
    let blobUrl: string;
    if (filename.startsWith("http")) {
      // If it's a full URL, use it directly
      blobUrl = filename;
    } else {
      // If only filename is provided, check if we have the full URL in query params
      const urlParam = request.nextUrl.searchParams.get("url");
      if (urlParam) {
        blobUrl = decodeURIComponent(urlParam);
      } else {
        // Can't reconstruct blob URL from filename alone - return error
        return new Response("Full blob URL required. Pass 'url' query parameter.", {
          status: 400,
        });
      }
    }

    try {
      // Get blob metadata to verify it exists and get content type
      const blobMetadata = await head(blobUrl);

      if (!blobMetadata) {
        return new Response("File not found", { status: 404 });
      }

      // Fetch the blob content directly (public blobs are directly accessible)
      const response = await fetch(blobUrl);
      if (!response.ok) {
        return new Response("Failed to fetch blob", { status: 500 });
      }

      const blobData = await response.arrayBuffer();

      // Extract display filename from the blob metadata or URL
      const displayFilename =
        blobMetadata.pathname?.split("/").pop() ||
        blobUrl.split("/").pop()?.split("?")[0] ||
        filename;

      // Return the blob content with proper headers for download
      return new NextResponse(blobData, {
        headers: {
          "Content-Type": blobMetadata.contentType || "application/pdf",
          "Content-Disposition": `attachment; filename="${displayFilename}"`,
        },
      });
    } catch (error) {
      console.error("PDF download error:", error);
      if ((error as Error).name === "BlobNotFoundError") {
        return new Response("File not found", { status: 404 });
      }
      return new Response("Internal server error", { status: 500 });
    }
  } catch (error) {
    console.error("PDF download error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
