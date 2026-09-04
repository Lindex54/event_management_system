import { Suspense } from "react";
import { StaffSchedulePage } from "@/components/staff/pages/staff-schedule-page";
export default function Page() {
  return (
    <Suspense>
      <StaffSchedulePage />
    </Suspense>
  );
}
