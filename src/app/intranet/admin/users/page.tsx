import { Card, CardBody } from '@/src/components/ui/card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/src/components/ui/table';

export default async function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-600 mt-2">Gestión de todos los usuarios</p>
      </div>

      <Card>
        <CardBody>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nombre</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Rol</TableHeader>
                <TableHeader>Estado</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-600">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
