import { Suspense } from "react";
import { OrganizerRegistrationsPage } from "@/components/organizer/pages/organizer-registrations-page";
export default function Page() {
  return (
    <Suspense>
      <OrganizerRegistrationsPage />
    </Suspense>
  );
}
