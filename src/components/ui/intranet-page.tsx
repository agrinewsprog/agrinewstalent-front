import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}

export function PageShell({ children, wide = false, className }: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 pb-10 sm:px-6 lg:px-8',
        wide ? 'max-w-[1440px]' : 'max-w-6xl',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-gray-500 sm:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

interface EmptyStateCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyStateCard({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateCardProps) {
  return (
    <SectionCard className={cn('px-6 py-10 text-center', className)}>
      {icon ? <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">{icon}</div> : null}
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{description}</p> : null}
      {action ? <div className="mt-4 flex items-center justify-center">{action}</div> : null}
    </SectionCard>
  );
}

interface MetricCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accentClassName?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  accentClassName = 'bg-gray-100 text-gray-600',
  className,
}: MetricCardProps) {
  return (
    <SectionCard className={cn('flex items-center gap-4 p-4', className)}>
      {icon ? (
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', accentClassName)}>
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-gray-950">{value}</p>
        <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
      </div>
    </SectionCard>
  );
}
