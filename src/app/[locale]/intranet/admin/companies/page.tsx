import { getTranslations } from 'next-intl/server';
import { Card, CardBody } from '@/components/ui/card';

export default async function AdminCompanies() {
  const t = await getTranslations('intranet');
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.companies.title')}</h1>
        <p className="text-gray-600 mt-2">{t('admin.companies.subtitle')}</p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">{t('admin.companies.list')}</p>
        </CardBody>
      </Card>
    </div>
  );
}
