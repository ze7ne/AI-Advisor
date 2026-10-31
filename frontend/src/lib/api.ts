const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  dashboard: {
    get: () => request("/dashboard/"),
  },
  profile: {
    get: () => request("/profile/"),
    update: (data: unknown) => request("/profile/", { method: "PUT", body: JSON.stringify(data) }),
  },
  expenses: {
    list: (params?: { month?: number; year?: number; category?: string }) => {
      const qs = new URLSearchParams();
      if (params?.month) qs.set("month", String(params.month));
      if (params?.year) qs.set("year", String(params.year));
      if (params?.category) qs.set("category", params.category);
      return request(`/expenses/?${qs}`);
    },
    create: (data: unknown) => request("/expenses/", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/expenses/${id}`, { method: "DELETE" }),
    categories: () => request<string[]>("/expenses/categories"),
  },
  goals: {
    list: () => request("/goals/"),
    create: (data: unknown) => request("/goals/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: unknown) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/goals/${id}`, { method: "DELETE" }),
  },
  advisor: {
    analyze: (data: { question: string; purchase_amount?: number; purchase_name?: string }) =>
      request("/advisor/analyze", { method: "POST", body: JSON.stringify(data) }),
  },
};
