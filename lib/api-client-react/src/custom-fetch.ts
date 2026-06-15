export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const headers = new Headers(options?.headers);
  const token = typeof window !== "undefined" ? localStorage.getItem("cloudvault_token") : null;
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = "An error occurred";
    const text = await response.text();
    try {
      if (text) {
        const errorData = JSON.parse(text);
        errorMsg = errorData.error || errorMsg;
      }
    } catch {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  // if empty response like 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json() as Promise<T>;
};
