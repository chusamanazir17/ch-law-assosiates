import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  listMediaAssets,
  deleteMediaAsset,
  addMediaAssetByUrl,
  uploadMediaAsset,
} from "@/lib/services/media.service";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const assets = await listMediaAssets();
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load media assets.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const name = typeof form.get("name") === "string" ? String(form.get("name")) : "";
      const altText = typeof form.get("altText") === "string" ? String(form.get("altText")) : "";

      if (!name.trim()) {
        return NextResponse.json({ success: false, error: "Please enter an asset title." }, { status: 400 });
      }
      if (!(file instanceof File)) {
        return NextResponse.json({ success: false, error: "Please select an image file to upload." }, { status: 400 });
      }

      const asset = await uploadMediaAsset(file, name, altText);
      return NextResponse.json({ success: true, asset });
    }

    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Please enter an asset title." }, { status: 400 });
    }
    if (typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ success: false, error: "Please enter a valid image URL." }, { status: 400 });
    }

    const asset = await addMediaAssetByUrl({ name: body.name, altText: body.altText ?? "", url: body.url });
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to save media asset.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const id = request.nextUrl.searchParams.get("id");
    const storagePath = request.nextUrl.searchParams.get("storagePath");
    if (!id) {
      return NextResponse.json({ success: false, error: "Asset ID is required." }, { status: 400 });
    }

    const { storageWarning } = await deleteMediaAsset({ id, storage_path: storagePath });
    return NextResponse.json({ success: true, storageWarning });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to delete media asset.") },
      { status: 500 }
    );
  }
}
