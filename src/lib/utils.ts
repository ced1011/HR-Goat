import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe toast functions that prevent React state updates during render
export const safeToast = {
  success: (title: string, options?: any) => {
    setTimeout(() => {
      toast.success(title, options)
    }, 0)
  },
  error: (title: string, options?: any) => {
    setTimeout(() => {
      toast.error(title, options)
    }, 0)
  },
  info: (title: string, options?: any) => {
    setTimeout(() => {
      toast.info(title, options)
    }, 0)
  },
  warning: (title: string, options?: any) => {
    setTimeout(() => {
      toast.warning(title, options)
    }, 0)
  }
}

// Default avatar helper function
export function getDefaultAvatar(avatar?: string, name?: string): string {
  // If avatar is provided and not empty, return it
  if (avatar && avatar.trim() !== '') {
    return avatar;
  }
  
  // Default avatar options
  const staticDefaultAvatar = '/default-avatar.png'; // Fallback static image
  
  // If name is provided, generate a UI Avatar with initials
  if (name) {
    // Extract initials (up to 2 characters)
    const initials = name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
    
    // Generate a consistent color based on the name
    const colors = [
      '1abc9c', '2ecc71', '3498db', '9b59b6', '34495e',
      'f1c40f', 'e67e22', 'e74c3c', 'ecf0f1', '95a5a6'
    ];
    const colorIndex = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    // Return UI Avatars URL
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=fff&size=128`;
  }
  
  // Fallback to static default avatar
  return staticDefaultAvatar;
}
