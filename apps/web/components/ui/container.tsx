// components/ui/container.tsx

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-6xl mx-auto px-4 md:px-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
