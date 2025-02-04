"use client";

export async function setAdminSession(password: string) {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to set admin session:", error);
    throw error;
  }
}

export async function verifyAdminSession() {
  try {
    const response = await fetch("/api/auth", {
      method: "GET",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to verify admin session:", error);
    return false;
  }
}

export async function verifyHandler(setShowAuthModal: (show: boolean) => void, setShowModal: (show: boolean) => void) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    setShowAuthModal(true);
    return false;
  }
  setShowModal(true);
  return true;
}