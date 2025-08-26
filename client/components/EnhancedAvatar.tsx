import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, X } from "lucide-react";
import {
  generateAvatarFallback,
  fileToBase64,
  validateImageFile,
} from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";

interface EnhancedAvatarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onAvatarChange?: (avatarUrl: string) => void;
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
};

const buttonSizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

export function EnhancedAvatar({
  user,
  size = "md",
  editable = false,
  onAvatarChange,
  className,
}: EnhancedAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fallback = generateAvatarFallback(user.name, user.email);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }

      const base64 = await fileToBase64(file);
      onAvatarChange?.(base64);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange?.("");
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Avatar className={cn(sizeMap[size], className)}>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback
            className={cn(
              fallback.bgColor,
              "text-white font-medium",
              size === "sm" ? "text-xs" : size === "xl" ? "text-xl" : "text-sm",
            )}
          >
            {fallback.type === "emoji" ? fallback.value : fallback.value}
          </AvatarFallback>
        </Avatar>

        {editable && (
          <div className="absolute -bottom-1 -right-1 flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              className={cn(buttonSizeMap[size], "rounded-full p-0")}
              onClick={handleCameraClick}
              disabled={uploading}
            >
              {uploading ? (
                <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </Button>

            {user.avatar && (
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  buttonSizeMap[size],
                  "rounded-full p-0 bg-red-500 border-red-500 hover:bg-red-600",
                )}
                onClick={handleRemoveAvatar}
              >
                <X className="h-3 w-3 text-white" />
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      )}

      {editable && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Click camera to upload image
          </p>
          <p className="text-xs text-muted-foreground">
            Max 5MB • JPEG, PNG, GIF, WebP
          </p>
        </div>
      )}
    </div>
  );
}

// Simple read-only version for headers, etc.
export function SimpleAvatar({
  user,
  size = "md",
  showTooltip = false,
  className,
}: {
  user: { name: string; email: string; avatar?: string };
  size?: "sm" | "md" | "lg" | "xl";
  showTooltip?: boolean;
  className?: string;
}) {
  const fallback = generateAvatarFallback(user.name, user.email);

  return (
    <Avatar
      className={cn(sizeMap[size], className)}
      title={showTooltip ? user.name : undefined}
    >
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback
        className={cn(
          fallback.bgColor,
          "text-white font-medium",
          size === "sm" ? "text-xs" : size === "xl" ? "text-xl" : "text-sm",
        )}
      >
        {fallback.type === "emoji" ? fallback.value : fallback.value}
      </AvatarFallback>
    </Avatar>
  );
}
