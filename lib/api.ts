export async function fetchModels() {
  const res = await fetch("/api/models");
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function fetchModelById(id: string) {
  const res = await fetch(`/api/models/${id}`);
  if (!res.ok) throw new Error("Failed to fetch model");
  return res.json();
}
