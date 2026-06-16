"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { DebtOverview } from "@/features/payments/debt-overview";
import { DebtHistory } from "@/features/payments/debt-history";
import { PaymentHistory } from "@/features/payments/payment-history";
import { AutoDebitForm } from "@/features/payments/auto-debit-form";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Thanh toán</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý công nợ, thanh toán hóa đơn và xem lịch sử giao dịch
        </p>
      </div>

      <Tabs defaultValue="debt">
        <TabsList>
          <TabsTrigger value="debt">Công nợ</TabsTrigger>
          <TabsTrigger value="history">Lịch sử giao dịch</TabsTrigger>
          <TabsTrigger value="auto-debit">Trích tự động</TabsTrigger>
        </TabsList>

        <TabsContent value="debt" className="mt-4 space-y-6">
          <DebtOverview />
          <DebtHistory />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch sử thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-debit" className="mt-4">
          <div className="max-w-2xl">
            <AutoDebitForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
