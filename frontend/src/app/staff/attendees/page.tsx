import { Suspense } from "react";
import { StaffAttendeesPage } from "@/components/staff/pages/staff-attendees-page";
export default function Page() {
  return (
    <Suspense>
      <StaffAttendeesPage />
    </Suspense>
  );
}
