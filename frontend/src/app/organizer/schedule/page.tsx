import { Suspense } from "react";
import { OrganizerSchedulePage } from "@/components/organizer/pages/organizer-schedule-page";
export default function Page() {
  return (
    <Suspense>
      <OrganizerSchedulePage />
    </Suspense>
  );
}
