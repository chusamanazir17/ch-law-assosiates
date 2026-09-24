import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  listAllPosts,
  getAdminPostBySlugOrId,
  savePost,
  deletePost,
} from "@/lib/services/posts.service";
import { validatePostInput } from "@/lib/validation/post";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const slug = request.nextUrl.searchParams.get("slug")?.trim();
    if (slug) {
      const post = await getAdminPostBySlugOrId(slug);
      if (!post) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, post });
    }

    const posts = await listAllPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load posts") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const input = validatePostInput(await request.json());
    const post = await savePost(input);

    return NextResponse.json({ success: true, post });
  } catch (error) {
    const message = errorMessage(error, "Failed to save post");
    const isValidation = !message.toLowerCase().includes("database") && !message.startsWith("Unable to");
    return NextResponse.json(
      { success: false, error: message },
      { status: isValidation ? 400 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    const slug = request.nextUrl.searchParams.get("slug")?.trim();
    const target = id || slug;

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Post ID or slug is required" },
        { status: 400 }
      );
    }

    await deletePost(target);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to delete post") },
      { status: 500 }
    );
  }
}

