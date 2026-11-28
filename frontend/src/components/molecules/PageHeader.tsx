type PageHeaderProps = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description = '' }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:mb-6 md:flex-row md:items-center md:justify-between md:gap-4">
      <div>
        <h1 className="my-1 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
        {description && <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>}
      </div>
    </div>
  );
}
