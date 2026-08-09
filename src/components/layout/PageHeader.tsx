export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="h-4 w-1.5 rounded-[2px] bg-[#ff6363]"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
