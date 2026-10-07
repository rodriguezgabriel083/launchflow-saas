import { notFound } from "next/navigation";
import { isWorkspaceView, workspaceViews } from "@/lib/navigation";

export function generateStaticParams() {
  return workspaceViews.map(section => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isWorkspaceView(section)) notFound();
  return null;
}
