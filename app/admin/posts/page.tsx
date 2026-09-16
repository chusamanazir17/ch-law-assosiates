import React from "react";
import PostsManager from "@/features/admin/PostsManager";

export const metadata = {
  title: "Articles & Posts CMS | Ch-Law Admin",
  description: "Manage and publish legal updates, tax guides, and office notices.",
};

export default function AdminPostsPage() {
  return <PostsManager />;
}
