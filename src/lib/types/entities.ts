/**
 * Entity types — mirror backend Zod schemas / mock response shapes.
 * Sources:
 *  - IOC_Customer/src/modules/billing/application/dtos/invoice.dto.ts
 *  - IOC_Customer/src/modules/payment/application/dtos/payment.dto.ts
 *  - IOC_Customer/src/modules/customer/application/dtos/customer-profile.dto.ts
 *  - IOC_Customer/mocks/debt/*.json (debt shapes)
 */

// ── Billing / Invoices ──────────────────────────────────────────────────────
export type PaymentStatus = "paid" | "unpaid" | "overdue" | "cancelled";
export type InvoiceStatusFilter = "paid" | "unpaid" | "overdue";

export interface InvoiceListItem {
  invoiceId: string;
  contractId: string;
  period: string; // YYYY-MM
  totalAmount: number;
  paymentStatus: PaymentStatus;
  issueDate: string;
  dueDate?: string;
}

export interface InvoiceListResponse {
  invoices: InvoiceListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceLineItem {
  description: string;
  volume: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceFee {
  feeName: string;
  amount: number;
}

export interface InvoiceDetail {
  invoiceId: string;
  contractId: string;
  period: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  fees: InvoiceFee[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  cqtCode: string | null;
  lookupCode: string | null;
  issueDate: string;
  dueDate?: string;
}

export interface InvoicePdf {
  invoiceId: string;
  pdfUrl: string;
  cqtCode: string;
  lookupCode: string;
  digitalSignature: string;
}

// ── Payment ─────────────────────────────────────────────────────────────────
export type PaymentMethod = "qr_code" | "payment_link" | "bank_transfer";

export interface CreatePaymentRequest {
  invoiceId: string;
  method: PaymentMethod;
}

export interface CreatePaymentResponse {
  paymentId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  qrCodeUrl: string | null;
  paymentLink: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  expiresAt: string;
  createdAt: string;
}

export interface CreateBatchPaymentRequest {
  invoiceIds: string[];
  method: PaymentMethod;
}

export interface CreateBatchPaymentResponse {
  paymentId: string;
  invoiceIds: string[];
  totalAmount: number;
  method: PaymentMethod;
  qrCodeUrl: string | null;
  paymentLink: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  expiresAt: string;
  createdAt: string;
}

export interface PaymentHistoryItem {
  paymentId: string;
  invoiceIds: string[];
  amount: number;
  method: PaymentMethod;
  status: "completed" | "pending" | "failed" | "refunded";
  createdAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchCode?: string;
}

export interface SetupAutoDebitResponse {
  registrationId: string;
  status: "pending_verification" | "active" | "rejected" | "cancelled";
  registeredAt: string;
}

// ── Debt ────────────────────────────────────────────────────────────────────
export type AgingBucket = "current" | "31-60" | "61-90" | ">90";

export interface AgingBreakdown {
  current: number;
  "31-60": number;
  "61-90": number;
  ">90": number;
}

export interface OutstandingDebt {
  totalAmount: number;
  agingBreakdown: AgingBreakdown;
  debts: {
    invoiceRef: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
    agingBucket: AgingBucket;
  }[];
  totalCount: number;
}

export interface DebtHistoryEntry {
  invoiceRef: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "outstanding" | "paid";
  agingAtPayment: AgingBucket | null;
}

export interface DebtHistory {
  entries: DebtHistoryEntry[];
  totalCount: number;
}

// ── Customer Profile ────────────────────────────────────────────────────────
export type CustomerClassification = "sinh_hoat" | "san_xuat" | "hanh_chinh";

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  classification: CustomerClassification;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    fullAddress: string;
  };
  contactInfo: {
    phone: string | null;
    email: string | null;
    contactAddress: string | null;
  };
  status: "active" | "inactive" | "suspended";
}

export interface TimelineEntry {
  eventType: string;
  timestamp: string;
  summary: string;
  channel: "zalo" | "hotline" | "counter" | "web" | null;
  referenceId: string | null;
}

export interface TimelineResponse {
  entries: TimelineEntry[];
  totalCount: number;
}

export interface RelatedAccount {
  customerId: string;
  name: string;
  relationshipType: string;
  address: string | null;
  contactInfo: Record<string, string | null>;
}

export interface RelatedAccountsResponse {
  accounts: RelatedAccount[];
}

export interface UpdateProfileResponse {
  customerId: string;
  updatedFields: string[];
  updatedAt: string;
}

// ── Meter ───────────────────────────────────────────────────────────────────
export type MeterType = "mechanical" | "ultrasonic" | "electromagnetic";
export type MeterStatus = "active" | "removed" | "defective";

export interface MeterInfo {
  meterId: string;
  serialNumber: string;
  type: MeterType;
  diameter: string;
  accuracyClass: string;
  manufactureYear: number;
  installationDate: string;
  status: MeterStatus;
}

export interface MeterListResponse {
  meters: MeterInfo[];
  totalCount: number;
}

export type CalibrationState = "valid" | "expiring_soon" | "expired";

export interface CalibrationStatus {
  meterId: string;
  status: CalibrationState;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  certificateNumber: string | null;
  isWarning: boolean;
}

export type MeterHistoryEventType =
  | "installation"
  | "removal"
  | "replacement"
  | "calibration";

export interface MeterHistoryEntry {
  eventDate: string;
  eventType: MeterHistoryEventType;
  description: string;
  performedBy: string;
}

export interface MeterHistoryResponse {
  entries: MeterHistoryEntry[];
  totalCount: number;
}

export interface ConsumptionReading {
  month: string; // YYYY-MM
  volume: number;
  readingDate: string;
}

export interface ReadingsListResponse {
  readings: ConsumptionReading[];
  totalCount: number;
}

export interface ComparisonResponse {
  currentPeriod: string;
  previousPeriod: string;
  currentVolume: number;
  previousVolume: number;
  percentageChange: number | null;
  direction: "up" | "down" | "neutral";
}

export interface EvidencePhoto {
  url: string;
  caption?: string;
  takenAt?: string;
}

export interface ReadingDetail {
  period: string;
  previousIndex: number;
  currentIndex: number;
  volume: number;
  evidencePhotos: EvidencePhoto[];
}

// ── Contract ────────────────────────────────────────────────────────────────
export type SubscriptionType =
  | "residential"
  | "commercial"
  | "industrial"
  | "administrative";
export type ContractStatus = "active" | "expired" | "terminated";

export interface PricingTerms {
  basePrice: number;
  currency: string;
  billingCycle: string;
}

export interface ContractListItem {
  contractId: string;
  address: string;
  meterId: string | null;
  waterQuota: number | null;
  subscriptionType: SubscriptionType;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  pricingTerms: PricingTerms | null;
}

export interface ContractListResponse {
  contracts: ContractListItem[];
  totalCount: number;
}

export interface ContractDetail extends ContractListItem {
  pricingTerms: PricingTerms;
  specialConditions: string[] | null;
}

export interface ContractVersion {
  versionId: string;
  versionNumber: number;
  changeDescription: string;
  effectiveDate: string;
  changedBy: string;
}

export interface ContractVersionsResponse {
  versions: ContractVersion[];
  totalCount: number;
}

export interface ContractPdf {
  contractId: string;
  downloadUrl: string;
  fileName: string;
  expiresAt: string | null;
}

// ── Billing Tariff ──────────────────────────────────────────────────────────
export type TariffCustomerType =
  | "residential"
  | "industrial"
  | "commercial"
  | "institutional";

export interface TariffTier {
  tier: number;
  fromVolume: number;
  toVolume: number | null;
  pricePerM3: number;
}

export interface TariffPlan {
  planId: string;
  planName: string;
  customerType: TariffCustomerType;
  applicableContractId: string;
  tiers: TariffTier[];
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface TariffBreakdownTier {
  tier: number;
  fromVolume: number;
  toVolume: number | null;
  volume: number;
  pricePerM3: number;
  subtotal: number;
}

export interface TariffBreakdown {
  invoiceId: string;
  contractId: string;
  tiers: TariffBreakdownTier[];
  totalBeforeFees: number;
}

export type FeeType = "environmental" | "drainage" | "vat" | "surcharge";

export interface ApplicableFee {
  feeType: FeeType;
  feeName: string;
  rate: number;
  isPercentage: boolean;
}

export interface ApplicableFeesResponse {
  contractId: string;
  fees: ApplicableFee[];
  vatPercentage: number;
}

// ── Ticket ──────────────────────────────────────────────────────────────────
export type IncidentType =
  | "water_outage"
  | "leak"
  | "water_quality"
  | "meter_issue"
  | "other";
export type TicketStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export interface CreateTicketRequest {
  type: IncidentType;
  description: string;
  imageUrls?: string[];
}

export interface CreateTicketResponse {
  trackingId: string;
  status: TicketStatus;
  createdAt: string;
}

export interface TicketUploadUrl {
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
}

export interface TicketTimelineEntry {
  status: TicketStatus;
  timestamp: string;
  description?: string;
  actor?: string;
}

export interface TicketStatusResponse {
  trackingId: string;
  status: TicketStatus;
  timeline: TicketTimelineEntry[];
  eta: string | null;
  assignedTeam: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketSummary {
  trackingId: string;
  type: IncidentType;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketHistoryResponse {
  tickets: TicketSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TicketFeedbackResponse {
  ticketId: string;
  score: number;
  submittedAt: string;
}

// ── Knowledge Base ──────────────────────────────────────────────────────────
export interface KbCategory {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export interface KbArticleSummary {
  id: string;
  title: string;
  summary: string;
  category: string;
  relevanceScore?: number;
}

export interface KbArticleDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  updatedAt: string;
}

export interface KbRateResponse {
  articleId: string;
  helpful: boolean;
  ratedAt: string;
}

// ── Communication ───────────────────────────────────────────────────────────
export type NotificationChannel = "zns" | "push" | "sms" | "email" | "in_app";
export type NotificationType =
  | "payment_completed"
  | "payment_failed"
  | "ticket_status_changed"
  | "alert_outage"
  | "alert_maintenance"
  | "alert_quality"
  | "debt_reminder";

export interface NotificationChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
  isCritical: boolean;
}

export interface NotificationPreferences {
  customerId: string;
  channels: NotificationChannelPreference[];
  updatedAt: string;
}

export interface NotificationHistoryItem {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  contentSummary: string;
  timestamp: string;
  deliveryStatus: "sent" | "delivered" | "failed";
}

export interface NotificationHistoryResponse {
  notifications: NotificationHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type AlertType = "outage" | "maintenance" | "quality";
export type AlertStatus = "active" | "resolved" | "scheduled";

export interface ActiveAlert {
  id: string;
  type: AlertType;
  description: string;
  affectedArea: string;
  expectedStartTime: string;
  expectedEndTime: string;
  status: AlertStatus;
  severity?: "low" | "medium" | "high";
}

export interface GetActiveAlertsResponse {
  alerts: ActiveAlert[];
  totalCount: number;
}

export interface AlertHistoryItem {
  id: string;
  type: AlertType;
  description: string;
  affectedArea: string;
  startTime: string;
  endTime: string;
  status: AlertStatus;
  resolvedAt: string | null;
}

export interface AlertHistoryResponse {
  alerts: AlertHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AcknowledgeAlertResponse {
  alertId: string;
  customerId: string;
  acknowledgedAt: string;
}

// ── Session ─────────────────────────────────────────────────────────────────
export type SessionChannel = "zalo" | "web" | "hotline" | "counter";

export interface SessionMetadata {
  sessionId: string;
  userId: string;
  channel: SessionChannel;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
}

export interface SessionEvent {
  id: string;
  type: string;
  channel: SessionChannel;
  timestamp: string;
  content: Record<string, unknown>;
}

export interface SessionDetailResponse {
  session: SessionMetadata | null;
  recentEvents: SessionEvent[];
}

export interface SessionEventsResponse {
  sessionId: string | null;
  events: SessionEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Reporting (Phase 2, S23) ────────────────────────────────────────────────
export interface ConsumptionReport {
  customerId: string;
  period: string; // YYYY-MM
  totalM3: number;
  amount: number;
  comparisonPercent: number;
}
export type ComparisonType =
  | "previous_period"
  | "same_period_last_year"
  | "area_average";
export interface ComparisonReport {
  customerId: string;
  comparisonType: ComparisonType;
  current: number;
  previous: number;
  changePercent: number;
}

// ── Water Cutoff (Phase 2, S17) ─────────────────────────────────────────────
export interface CutoffStatus {
  customerId: string;
  hasActiveCutoff: boolean;
  reason: string | null;
  scheduledAt: string | null;
  resolvedAt: string | null;
}
export interface CutoffSchedule {
  areaId: string;
  schedules: { from: string; to: string; reason: string }[];
}

// ── Smart Meter (Phase 2, S18) ──────────────────────────────────────────────
export interface RealtimeConsumption {
  customerId: string;
  meterId: string;
  currentFlowM3h: number;
  todayM3: number;
  lastReadingAt: string;
}
export interface SmartMeterStatus {
  meterId: string;
  online: boolean;
  batteryLevel: number;
  lastSeenAt: string;
}

// ── Segmentation (Phase 2, S3) ──────────────────────────────────────────────
export type ValueSegment = "VIP" | "large" | "medium" | "small";
export type CustomerType =
  | "sinh_hoat"
  | "san_xuat"
  | "kcn"
  | "hanh_chinh"
  | "dich_vu";
export interface Segment {
  customerType: CustomerType;
  valueSegment: ValueSegment;
  area: string;
  behaviorTags: string[];
}
export interface SegmentsResponse {
  customerId: string;
  segment: Segment;
}
export interface Eligibility {
  customerId: string;
  campaignId: string;
  eligible: boolean;
  reasons: string[];
}
