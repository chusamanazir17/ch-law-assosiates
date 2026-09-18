import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  findPostBySlug,
  listPosts,
  removePost,
  savePost,
} from "@/lib/repositories/postsRepository";
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
      const post = await findPostBySlug(session.supabase, slug);
      if (!post) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, post });
    }

    const posts = await listPosts(session.supabase);
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
    const post = await savePost(session.supabase, input);

    revalidatePath("/updates");
    revalidatePath(`/updates/${post.slug}`);
    revalidatePath("/");

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

    await removePost(session.supabase, target);
    revalidatePath("/updates");
    if (slug) revalidatePath(`/updates/${slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to delete post") },
      { status: 500 }
    );
  }
}
