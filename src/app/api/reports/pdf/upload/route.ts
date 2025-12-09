import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import { requireAdminSession } from "@/server/auth/session";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await requireAdminSession();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return Response.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return Response.json(
        { error: "File size must be less than 10MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `reports/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: "application/pdf",
    });

    return Response.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      originalFilename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return Response.json(
      { error: (error as Error).message || "Failed to upload PDF" },
      { status: 500 },
    );
  }
}
