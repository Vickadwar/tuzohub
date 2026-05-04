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

export default function PendingRedemptions() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const queue = stats?.pendingQueue || [];
  const recentTransactions = stats?.recentTransactions || [];
  const hasPending = queue.length > 0;
  const displayData = hasPending ? queue : recentTransactions;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] w-full animate-pulse">
        <div className="h-6 w-32 bg-gray-100 dark:bg-white/5 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-gray-50 dark:bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full h-full flex flex-col">
      <div className="p-5 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {hasPending ? "Pending Redemptions" : "Recent Redemption Activity"}
          </h3>
          {!hasPending && (
             <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                History Mode
             </span>
          )}
        </div>
        {hasPending && (
          <Badge color={queue.length > 5 ? "error" : "warning"} size="sm">
            {queue.length} items waiting
          </Badge>
        )}
      </div>

      <div className="max-w-full overflow-x-auto flex-1">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 pl-5 md:pl-6 font-semibold text-gray-500 text-start text-[11px] capitalize tracking-wider dark:text-gray-400">
                Beneficiary
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-[11px] capitalize tracking-wider dark:text-gray-400">
                Method / ref
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-[11px] capitalize tracking-wider dark:text-gray-400">
                Value
              </TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-[11px] capitalize tracking-wider dark:text-gray-400">
                {hasPending ? "Redemption journey" : "Settlement time"}
              </TableCell>
              <TableCell isHeader className="py-3 pr-5 md:pr-6 font-semibold text-gray-500 text-start text-[11px] capitalize tracking-wider dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayData.length > 0 ? (
              displayData.map((req: any) => {
                const statusSteps = ["INITIATED", "PROCESSING", "SUCCESS"];
                const currentStatus = hasPending ? req.status : "SUCCESS";
                const progress = currentStatus === "SUCCESS" ? 100 : currentStatus === "PROCESSING" ? 66 : 33;
                
                // For transactions, we need to extract consumer data from wallet
                const consumer = hasPending ? req.consumer : req.wallet?.consumer;
                
                return (
                  <TableRow key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <TableCell className="py-4 pl-5 md:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-full bg-gray-50 dark:bg-white/5 font-bold text-gray-500 border border-gray-100 dark:border-gray-800">
                          {consumer?.firstName?.[0]}{consumer?.lastName?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900 text-theme-sm dark:text-white/90">
                            {consumer?.firstName} {consumer?.lastName}
                          </p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {consumer?.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex flex-col">
                          <span className="text-gray-800 text-theme-sm dark:text-white/90 font-bold uppercase tracking-tight">
                            {hasPending ? req.fulfillmentMode : (req.actionCategory || "Redemption")}
                          </span>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400 line-clamp-1 tabular-nums">
                            {req.providerReference || req.id.slice(0, 8)}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-theme-sm dark:text-white/90 tabular-nums">
                          {hasPending ? parseFloat(req.amountValue).toLocaleString() : parseFloat(req.pointsAmount).toLocaleString()} {hasPending ? req.currencyCode : "PTS"}
                        </span>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                           {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 min-w-[200px]">
                       {hasPending ? (
                         <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                              <span className={req.status === "INITIATED" || req.status === "PROCESSING" || req.status === "SUCCESS" ? "text-brand-500" : ""}>Request</span>
                              <span className={req.status === "PROCESSING" || req.status === "SUCCESS" ? "text-brand-500" : ""}>Payout</span>
                              <span className={req.status === "SUCCESS" ? "text-success-500" : ""}>Settled</span>
                           </div>
                           <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                 className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${req.status === "SUCCESS" ? "bg-success-500" : "bg-brand-500"}`}
                                 style={{ width: `${progress}%` }}
                              />
                           </div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-success-500 pulse-green"></div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Settled {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                         </div>
                       )}
                    </TableCell>
                    <TableCell className="py-4 pr-5 md:pr-6">
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
                <TableCell colSpan={5} className="py-20 text-center">
                   <div className="flex flex-col items-center justify-center gap-3 grayscale opacity-40">
                      <div className="size-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                         <svg className="size-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white text-base font-bold">Queue Clean</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity detected.</p>
                      </div>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-gray-800 text-right">
         <Link href="/transactions" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-widest">
            View Ledger Explorer →
         </Link>
      </div>
    </div>
  );
}
