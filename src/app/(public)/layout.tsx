import { PublicHeader } from '@/src/components/layout/PublicHeader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-gray-50">
      <PublicHeader />
      <main>{children}</main>
    </div>
  );
}
