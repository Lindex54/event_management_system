import { Suspense } from "react";
import { StaffCheckInPage } from "@/components/staff/pages/staff-check-in-page";
export default function Page() {
  return (
    <Suspense>
      <StaffCheckInPage />
    </Suspense>
  );
}
