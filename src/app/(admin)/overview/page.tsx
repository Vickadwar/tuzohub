import type { Metadata } from "next";
import React from "react";
import OverviewDashboardContent from "@/components/overview/OverviewDashboardContent";

export const metadata: Metadata = {
  title: "Overview | TuzoHub Loyalty OS",
  description: "TuzoHub Loyalty and Rewards platform overview command center",
};

export default function OverviewPage() {
  return <OverviewDashboardContent />;
}