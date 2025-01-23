/** @format */

import ModelDetailClient from "./ModelDetailClient";

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ModelDetailClient id={id} />;
}
