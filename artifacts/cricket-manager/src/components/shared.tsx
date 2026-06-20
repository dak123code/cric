import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-display font-bold tracking-wide transition-all duration-300 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed z-10",
          variant === "primary" && "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,180,0,0.2)] hover:shadow-[0_0_30px_rgba(255,180,0,0.4)] hover:-translate-y-0.5",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary",
          variant === "ghost" && "text-muted-foreground hover:text-foreground hover:bg-white/5",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/80",
          size === "sm" && "px-4 py-2 text-sm rounded-xl",
          size === "md" && "px-6 py-3 text-base rounded-xl",
          size === "lg" && "px-8 py-4 text-lg rounded-2xl",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl", className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className }: any) => {
  const variants: any = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary/20 text-primary border border-primary/30",
    success: "bg-accent/20 text-accent border border-accent/30",
    destructive: "bg-destructive/20 text-destructive border border-destructive/30",
    outline: "border border-border text-muted-foreground"
  };
  return (
    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", variants[variant], className)}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-border shadow-2xl z-10 custom-scrollbar"
        >
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const Tabs = ({ tabs, activeTab, onChange }: { tabs: string[], activeTab: string, onChange: (t: string) => void }) => (
  <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl overflow-x-auto">
    {tabs.map(t => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={cn(
          "px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all whitespace-nowrap",
          activeTab === t 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
      >
        {t}
      </button>
    ))}
  </div>
);
