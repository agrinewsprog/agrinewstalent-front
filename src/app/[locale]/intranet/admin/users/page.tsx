import { getTranslations } from 'next-intl/server';
import { Card, CardBody } from '@/components/ui/card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';

export default async function AdminUsers() {
  const t = await getTranslations('intranet');
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.title')}</h1>
        <p className="text-gray-600 mt-2">{t('admin.users.subtitle')}</p>
      </div>

      <Card>
        <CardBody>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>{t('admin.users.colName')}</TableHeader>
                <TableHeader>{t('admin.users.colEmail')}</TableHeader>
                <TableHeader>{t('admin.users.colRole')}</TableHeader>
                <TableHeader>{t('admin.users.colStatus')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-600">
                  {t('admin.users.noData')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
