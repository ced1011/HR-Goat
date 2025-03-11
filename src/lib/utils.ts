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
