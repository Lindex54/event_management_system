import { Suspense } from "react";
import { OrganizerAttendeesPage } from "@/components/organizer/pages/organizer-attendees-page";
export default function Page() {
  return (
    <Suspense>
      <OrganizerAttendeesPage />
    </Suspense>
  );
}
