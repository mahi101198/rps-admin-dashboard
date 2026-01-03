import { getOrdersAction, getOrderStatsAction } from '@/actions/order-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrdersTableWrapper } from './orders-table-wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders Management',
  description: 'Manage customer orders and track fulfillment status',
};

export default async function OrdersPage() {
  // Fetch orders and stats in parallel
  const [orders, stats] = await Promise.all([
    getOrdersAction(),
    getOrderStatsAction()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📦 Orders Management</h1>
        <p className="text-muted-foreground">Manage customer orders and track fulfillment status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Total</Badge>
              <span className="font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Placed</Badge>
              <span className="font-bold">{stats.placed}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Confirmed</Badge>
              <span className="font-bold">{stats.confirmed}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Paid</Badge>
              <span className="font-bold">{stats.paid}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Shipped</Badge>
              <span className="font-bold">{stats.shipped}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500">Out for Delivery</Badge>
              <span className="font-bold">{stats.out_for_delivery}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Delivered</Badge>
              <span className="font-bold">{stats.delivered}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Cancelled</Badge>
              <span className="font-bold">{stats.cancelled}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-7">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="font-bold text-xl">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Complete order management and tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTableWrapper data={orders} />
        </CardContent>
      </Card>
    </div>
  );
}