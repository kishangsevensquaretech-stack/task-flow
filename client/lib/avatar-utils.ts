// Avatar utility functions for generating fallbacks

export const generateAvatarFallback = (name: string, email: string) => {
  if (!name && !email) {
    return {
      type: "emoji",
      value: "👤",
      bgColor: "bg-gray-500",
    };
  }

  // Generate initials from name or email
  const displayName = name || email.split("@")[0];
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate a color based on the name/email for consistency
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  const colorIndex =
    (displayName.charCodeAt(0) +
      displayName.charCodeAt(displayName.length - 1)) %
    colors.length;
  const bgColor = colors[colorIndex];

  // Fun emoji fallbacks based on first letter
  const emojiMap: { [key: string]: string } = {
    A: "🚀",
    B: "🎯",
    C: "🎨",
    D: "💎",
    E: "⚡",
    F: "🔥",
    G: "🌟",
    H: "🎪",
    I: "💡",
    J: "🎭",
    K: "🗝️",
    L: "🦋",
    M: "🎵",
    N: "🌙",
    O: "🌊",
    P: "🍕",
    Q: "👑",
    R: "🌈",
    S: "⭐",
    T: "🎪",
    U: "🦄",
    V: "🎯",
    W: "🌍",
    X: "❌",
    Y: "💛",
    Z: "⚡",
  };

  const firstLetter = initials[0] || "U";
  const emoji = emojiMap[firstLetter] || "😊";

  return {
    type: "initials",
    value: initials,
    emoji: emoji,
    bgColor: bgColor,
  };
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Validate image file
export const validateImageFile = (
  file: File,
): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Image size should be less than 5MB",
    };
  }

  return { valid: true };
};
