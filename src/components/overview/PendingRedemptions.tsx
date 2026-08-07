"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";

interface PendingRedemptionsProps {
  stats?: any;
  isLoading?: boolean;
}

export default function PendingRedemptions({ stats: propStats, isLoading: propIsLoading }: PendingRedemptionsProps = {}) {
  const { data: apiStats, isLoading: apiIsLoading } = useApi(propStats ? null : "/loyalty/stats/overview");
  const stats = propStats || apiStats;
  const isLoading = propIsLoading !== undefined ? propIsLoading : apiIsLoading;

  const queue = stats?.pendingQueue || [];
  const recentTransactions = stats?.recentTransactions || [];
  const hasPending = queue.length > 0;
  const displayData = hasPending ? queue : recentTransactions;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full animate-pulse">
        <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-50 dark:bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col shadow-sm overflow-hidden">
      <div className="p-4 sm:px-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-500/10 text-amber-600 rounded text-xs">⚡</span>
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {hasPending ? "Pending Redemptions Queue" : "Recent Redemption Activity"}
          </h3>
          {!hasPending && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-semibold text-gray-400">
              Settled Logs
            </span>
          )}
        </div>
        {hasPending && (
          <Badge color={queue.length > 5 ? "error" : "warning"} size="sm">
            {queue.length} Queue
          </Badge>
        )}
      </div>

      <div className="max-w-full overflow-x-auto flex-1">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Beneficiary</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Method / Ref</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Value</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">{hasPending ? "Journey" : "Settlement"}</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Status</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {displayData.length > 0 ? (
              displayData.map((req: any) => {
                const currentStatus = hasPending ? req.status : "SUCCESS";
                const progress = currentStatus === "SUCCESS" ? 100 : currentStatus === "PROCESSING" ? 66 : 33;
                const consumer = hasPending ? req.consumer : req.wallet?.consumer;
                const initials = `${consumer?.firstName?.[0] || ""}${consumer?.lastName?.[0] || ""}`.toUpperCase();
                
                return (
                  <TableRow key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {/* Rounded Full Avatar */}
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20 shadow-2xs">
                          {initials || "C"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {consumer?.firstName} {consumer?.lastName}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {consumer?.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">
                          {hasPending ? req.fulfillmentMode : (req.actionCategory || "Redemption")}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                          {req.providerReference || req.id.slice(0, 8)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                          {hasPending ? parseFloat(req.amountValue).toLocaleString() : parseFloat(req.pointsAmount).toLocaleString()} {hasPending ? req.currencyCode : "PTS"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6 min-w-[160px]">
                      {hasPending ? (
                        <div className="flex flex-col gap-1">
                          <div className="relative h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${req.status === "SUCCESS" ? "bg-emerald-500" : "bg-brand-500"}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[11px] font-medium text-gray-400">
                            Settled {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-6 text-right">
                      <Badge
                        size="sm"
                        color={
                          (hasPending ? req.status : "SUCCESS") === "SUCCESS"
                            ? "success"
                            : req.status === "PENDING" || req.status === "INITIATED"
                            ? "warning"
                            : req.status === "PROCESSING"
                            ? "primary"
                            : "error"
                        }
                      >
                        {hasPending ? req.status : "SETTLED"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-xs font-semibold text-gray-400">
                  No pending redemptions in queue.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-3.5 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5 text-right">
        <Link href="/transactions" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          View Full Ledger Explorer &rarr;
        </Link>
      </div>
    </div>
  );
}
