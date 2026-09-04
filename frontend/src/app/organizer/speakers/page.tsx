import { Suspense } from "react";
import { OrganizerSpeakersPage } from "@/components/organizer/pages/organizer-speakers-page";
export default function Page() {
  return (
    <Suspense>
      <OrganizerSpeakersPage />
    </Suspense>
  );
}
