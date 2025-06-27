import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
}

export const toast = ({ title, description, type }: ToastOptions) => {
  const message = description ? `${title}\n${description}` : title;

  switch (type) {
    case 'success':
      sonnerToast.success(message);
      break;
    case 'error':
      sonnerToast.error(message);
      break;
    case 'info':
    default:
      sonnerToast(message);
      break;
  }
};

export function useToast() {
  return { toast };
}