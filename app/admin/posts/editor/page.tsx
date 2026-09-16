import React, { Suspense } from "react";
import PostEditor from "@/features/admin/PostEditor";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Article Editor | Ch-Law CMS",
  description: "Compose and publish legal updates and tax advice articles.",
};

export default function PostEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
        </div>
      }
    >
      <PostEditor />
    </Suspense>
  );
}
