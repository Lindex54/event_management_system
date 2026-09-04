"use client";
import { useParams } from "next/navigation";
import { StaffEventDetailPage } from "@/components/staff/pages/staff-event-detail-page";
export default function Page() {
  const params = useParams<{ id: string }>();
  return <StaffEventDetailPage eventId={Number(params.id)} />;
}
