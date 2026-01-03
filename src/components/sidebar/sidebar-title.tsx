import Image from "next/image";

export default function SidebarTitle({
  title,
  subtitle,
  logoPath,
}: {
  title: string;
  subtitle?: string;
  logoPath: string;
}) {
  return (
    <div className="flex gap-2 my-1">
      <div className="bg-sidebar-foreground/10 flex aspect-square size-7 items-center justify-center rounded-md">
        <Image src={logoPath} width={20} height={20} alt="Logo" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate font-medium text-sm">{title}</span>
        <span className="truncate text-[0.65rem]">{subtitle}</span>
      </div>
      <span className="truncate my-auto">
        <kbd
          className="
            pointer-events-none hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1 
            font-mono text-[0.6rem] font-medium text-sidebar-foreground/50 md:flex
        "
        >
          CTRL B
        </kbd>
      </span>
    </div>
  );
}