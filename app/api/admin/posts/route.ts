import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPosts, getPostBySlug, savePost, deletePost } from "@/lib/cms/postsStorage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  }

  const posts = await getAllPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !body.title) {
      return NextResponse.json({ error: "Post title is required" }, { status: 400 });
    }

    const saved = await savePost(body);
    try {
      revalidatePath("/updates");
      revalidatePath(`/updates/${saved.slug}`);
      revalidatePath("/");
    } catch {
      // Ignore
    }
    return NextResponse.json({ success: true, post: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const target = id || slug;

    if (!target) {
      return NextResponse.json({ error: "Post ID or slug is required" }, { status: 400 });
    }

    await deletePost(target);
    try {
      revalidatePath("/updates");
      if (slug) revalidatePath(`/updates/${slug}`);
      revalidatePath("/");
    } catch {
      // Ignore
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete post" }, { status: 500 });
  }
}
