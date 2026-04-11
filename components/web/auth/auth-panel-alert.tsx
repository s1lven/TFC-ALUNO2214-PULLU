type Props = {
  variant: "error" | "success";
  children: React.ReactNode;
  onDismiss: () => void;
};

export function AuthPanelAlert({ variant, children, onDismiss }: Props) {
  const surface =
    variant === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-green-200 bg-green-50 text-green-900";
  const dismiss =
    variant === "error"
      ? "text-red-800 hover:text-red-950"
      : "text-green-800 hover:text-green-950";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${surface}`}
    >
      <span className="min-w-0 leading-snug">{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        className={`shrink-0 text-xs font-medium underline underline-offset-2 ${dismiss}`}
      >
        Dismiss
      </button>
    </div>
  );
}
