import { notFound } from "next/navigation";
import { DiscussionRoomPage } from "@/components/discussions/discussion-room-page";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;const eventId=Number(id);if(!Number.isSafeInteger(eventId)||eventId<1)notFound();return <DiscussionRoomPage eventId={eventId} basePath="/organizer/discussions"/>;}
