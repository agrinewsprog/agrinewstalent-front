import { getTranslations } from 'next-intl/server';
import { Card, CardBody } from '@/src/components/ui/card';

export default async function AdminApplications() {
  const t = await getTranslations('intranet');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.applications.title')}</h1>
        <p className="text-gray-600 mt-2">{t('admin.applications.subtitle')}</p>
      </div>

      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">{t('admin.applications.list')}</p>
        </CardBody>
      </Card>
    </div>
  );
}
