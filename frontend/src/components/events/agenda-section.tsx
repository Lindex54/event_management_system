import Image from "next/image";
import { Download, ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicEventDetail } from "@/lib/api/public-events";

export function AgendaSection({ event }: { event: PublicEventDetail }) {
  if (event.agendaType === "None" || !event.agendaUrl) return null;

  return (
    <Card className="shadow-none">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-text-primary">Agenda</h2>
        {event.agendaType === "Url" ? (
          <Button asChild variant="outline"><a href={event.agendaUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /> Open Agenda</a></Button>
        ) : event.agendaFileType?.startsWith("image/") ? (
          <div className="space-y-3">
            <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
              <Image src={event.agendaUrl} alt="Event agenda" fill sizes="(max-width: 768px) 100vw, 480px" className="object-contain" />
            </div>
            <Button asChild variant="outline"><a href={event.agendaUrl} target="_blank" rel="noopener noreferrer"><Download /> View Full Size</a></Button>
          </div>
        ) : (
          <Button asChild variant="outline"><a href={event.agendaUrl} target="_blank" rel="noopener noreferrer"><FileText /> View / Download Agenda{event.agendaFileName ? ` (${event.agendaFileName})` : ""}</a></Button>
        )}
      </CardContent>
    </Card>
  );
}
