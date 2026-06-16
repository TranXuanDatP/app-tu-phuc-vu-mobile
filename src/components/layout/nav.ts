import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  Droplet,
  FileText,
  Ticket,
  HelpCircle,
  Bell,
  History,
  UserCog,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

/**
 * Portal navigation — all modules backed by the IOC_Customer BFF.
 */
export const navItems: NavItem[] = [
  { title: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { title: "Hóa đơn", href: "/invoices", icon: ReceiptText, enabled: true },
  { title: "Thanh toán", href: "/payments", icon: CreditCard, enabled: true },
  { title: "Đồng hồ nước", href: "/meters", icon: Droplet, enabled: true },
  { title: "Hợp đồng", href: "/contracts", icon: FileText, enabled: true },
  { title: "Phản ánh sự cố", href: "/tickets", icon: Ticket, enabled: true },
  { title: "Hỗ trợ & FAQ", href: "/knowledge-base", icon: HelpCircle, enabled: true },
  { title: "Thông báo", href: "/notifications", icon: Bell, enabled: true },
  { title: "Phiên tương tác", href: "/sessions", icon: History, enabled: true },
  { title: "Hồ sơ", href: "/profile", icon: UserCog, enabled: true },
];
