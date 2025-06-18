
import { useAllPaymentMethods } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard } from 'lucide-react';

export const PaymentMethodsManagement = () => {
  const { data: paymentMethods, isLoading } = useAllPaymentMethods();

  if (isLoading) {
    return <div className="text-slate-400">Loading payment methods...</div>;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">Email</TableHead>
              <TableHead className="text-slate-300">Card</TableHead>
              <TableHead className="text-slate-300">Brand</TableHead>
              <TableHead className="text-slate-300">Default</TableHead>
              <TableHead className="text-slate-300">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods?.map((method) => (
              <TableRow key={method.id} className="border-slate-700">
                <TableCell className="text-white">
                  {method.profiles?.full_name || 'Unknown'}
                </TableCell>
                <TableCell className="text-slate-300">
                  {method.profiles?.email}
                </TableCell>
                <TableCell className="text-slate-300">
                  **** **** **** {method.card_last_four}
                </TableCell>
                <TableCell className="text-slate-300 capitalize">
                  {method.card_brand}
                </TableCell>
                <TableCell className="text-slate-300">
                  {method.is_default ? 'Yes' : 'No'}
                </TableCell>
                <TableCell className="text-slate-300">
                  {new Date(method.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!paymentMethods || paymentMethods.length === 0) && (
          <div className="text-center py-8 text-slate-400">
            No payment methods found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
