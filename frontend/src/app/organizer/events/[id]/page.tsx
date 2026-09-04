"use client";
import { useParams } from "next/navigation";
import { OrganizerEventDetailPage } from "@/components/organizer/pages/organizer-event-detail-page";
export default function Page() {
  const params = useParams<{ id: string }>();
  return <OrganizerEventDetailPage eventId={Number(params.id)} />;
}
