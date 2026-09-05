import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../config/database";
import type { DiscussionIdentity } from "../middleware/require-discussion-user";

interface AccessRow extends RowDataPacket {
  eventId:number; eventName:string; slug:string; eventDate:string; startTime:string|null; timezone:string; eventStatus:string;
  venueName:string|null; discussionId:number|null; status:"Open"|"Closed"|null;
  organizerAccess:number; staffAccess:number; coOrganizerAccess:number; attendeeAccess:number; blocked:number;
}
function localTimestamp(date:string,time:string|null){const [year=1970,month=1,day=1]=date.split("-").map(Number);const [hour=0,minute=0,second=0]=(time??"00:00:00").split(":").map(Number);return Date.UTC(year,month-1,day,hour,minute,second);}
function nowInZone(timezone:string){
  try{const parts=new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts();const value=(type:string)=>Number(parts.find((part)=>part.type===type)?.value);return Date.UTC(value("year"),value("month")-1,value("day"),value("hour"),value("minute"),value("second"));}
  catch{return Date.now();}
}
function controlsActive(row:Pick<AccessRow,"eventDate"|"startTime"|"timezone"|"eventStatus">){
  if(row.eventStatus==="Active")return true;
  if(row.eventStatus!=="Upcoming")return false;
  const millisecondsUntilStart=localTimestamp(row.eventDate,row.startTime)-nowInZone(row.timezone);
  return millisecondsUntilStart>=0&&millisecondsUntilStart<=30*60_000;
}

function allowed(row:AccessRow,user:DiscussionIdentity){return user.isAdministrator||Boolean(row.organizerAccess||row.staffAccess||(row.attendeeAccess&&!row.blocked));}
// Admins can open or close a discussion at any time, ignoring the 30-minute
// pre-event window. Organizer moderation actions activate only within that window.
function canModerate(row:AccessRow,user:DiscussionIdentity){return user.isAdministrator||(Boolean(row.organizerAccess||row.coOrganizerAccess)&&controlsActive(row));}
function result(row:AccessRow,user:DiscussionIdentity){const active=controlsActive(row);return {eventId:row.eventId,eventName:row.eventName,slug:row.slug,eventDate:row.eventDate,startTime:row.startTime,venueName:row.venueName,discussionId:row.discussionId,status:row.status??"Closed",currentUserId:user.userId,isAdministrator:user.isAdministrator,canModerate:canModerate(row,user),controlsActive:active,canOpen:user.isAdministrator||(Boolean(row.organizerAccess||row.coOrganizerAccess)&&active),canClose:user.isAdministrator||(Boolean(row.organizerAccess||row.coOrganizerAccess)&&active)};}

async function getAccess(eventId:number,user:DiscussionIdentity){
  const [rows]=await pool.query<AccessRow[]>(`SELECT e.id eventId,e.name eventName,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') eventDate,TIME_FORMAT(e.start_time,'%H:%i:%s') startTime,e.timezone,e.status eventStatus,v.name venueName,d.id discussionId,d.status,
    (e.organizer_id=COALESCE(?,0)) organizerAccess,
    EXISTS(SELECT 1 FROM event_staff es WHERE es.event_id=e.id AND es.user_id=?) staffAccess,
    EXISTS(SELECT 1 FROM event_staff es WHERE es.event_id=e.id AND es.user_id=? AND es.assignment_role='co_organizer') coOrganizerAccess,
    EXISTS(SELECT 1 FROM registrations r WHERE r.event_id=e.id AND r.attendee_id=COALESCE(?,0) AND r.status='Confirmed' AND r.deleted_at IS NULL) attendeeAccess,
    EXISTS(SELECT 1 FROM discussion_participant_blocks b WHERE b.event_id=e.id AND b.user_id=?) blocked
    FROM events e LEFT JOIN venues v ON v.id=e.venue_id LEFT JOIN event_discussions d ON d.event_id=e.id WHERE e.id=? AND e.deleted_at IS NULL LIMIT 1`,[user.organizerId,user.userId,user.userId,user.attendeeId,user.userId,eventId]);
  return rows[0]&&allowed(rows[0],user)?rows[0]:null;
}

export async function listDiscussions(user:DiscussionIdentity){
  const params:Array<number|null>=[user.organizerId,user.userId,user.userId];let restriction="";
  if(!user.isAdministrator){restriction=`AND (e.organizer_id=COALESCE(?,0) OR EXISTS(SELECT 1 FROM event_staff es WHERE es.event_id=e.id AND es.user_id=?) OR (EXISTS(SELECT 1 FROM registrations ar WHERE ar.event_id=e.id AND ar.attendee_id=COALESCE(?,0) AND ar.status='Confirmed' AND ar.deleted_at IS NULL) AND NOT EXISTS(SELECT 1 FROM discussion_participant_blocks b WHERE b.event_id=e.id AND b.user_id=?)))`;params.push(user.organizerId,user.userId,user.attendeeId,user.userId);}
  const [rows]=await pool.query<RowDataPacket[]>(`SELECT e.id eventId,e.name eventName,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') eventDate,TIME_FORMAT(e.start_time,'%H:%i:%s') startTime,v.name venueName,d.id discussionId,COALESCE(d.status,'Closed') status,d.opened_at openedAt,d.closed_at closedAt,d.created_at createdAt,
    (e.organizer_id=COALESCE(?,0) OR EXISTS(SELECT 1 FROM event_staff ms WHERE ms.event_id=e.id AND ms.user_id=? AND ms.assignment_role='co_organizer') OR ?) canManage,
    (SELECT COUNT(*) FROM discussion_messages dm WHERE dm.discussion_id=d.id) messageCount,(SELECT COUNT(DISTINCT dm.user_id) FROM discussion_messages dm WHERE dm.discussion_id=d.id) participantCount,
    (SELECT dm.message FROM discussion_messages dm WHERE dm.discussion_id=d.id ORDER BY dm.id DESC LIMIT 1) latestMessage,(SELECT dm.created_at FROM discussion_messages dm WHERE dm.discussion_id=d.id ORDER BY dm.id DESC LIMIT 1) lastActivityAt
    FROM events e LEFT JOIN venues v ON v.id=e.venue_id LEFT JOIN event_discussions d ON d.event_id=e.id WHERE e.deleted_at IS NULL ${restriction} ORDER BY COALESCE(lastActivityAt,d.updated_at,e.event_date) DESC`,[...params.slice(0,2),user.isAdministrator?1:0,...params.slice(3)]);
  return rows;
}
export async function getDiscussion(eventId:number,user:DiscussionIdentity){const row=await getAccess(eventId,user);return row?result(row,user):null;}
export async function listMessages(eventId:number,user:DiscussionIdentity,afterId:number){const row=await getAccess(eventId,user);if(!row)return null;if(!row.discussionId)return{discussion:result(row,user),messages:[]};const[messages]=await pool.query<RowDataPacket[]>(`SELECT dm.id,dm.user_id userId,dm.message,dm.created_at createdAt,CONCAT_WS(' ',p.first_name,p.last_name) senderName,CASE WHEN o.user_id=dm.user_id AND e.organizer_id=o.id THEN 'Organizer' WHEN EXISTS(SELECT 1 FROM event_staff es WHERE es.event_id=e.id AND es.user_id=dm.user_id) THEN 'Staff' WHEN EXISTS(SELECT 1 FROM attendees a JOIN registrations r ON r.attendee_id=a.id AND r.event_id=e.id AND r.status='Confirmed' AND r.deleted_at IS NULL WHERE a.person_id=u.person_id) THEN 'Participant' WHEN EXISTS(SELECT 1 FROM user_roles ur JOIN roles rr ON rr.id=ur.role_id WHERE ur.user_id=dm.user_id AND rr.slug='system-administrator') THEN 'Administrator' ELSE 'Member' END senderRole FROM discussion_messages dm JOIN event_discussions d ON d.id=dm.discussion_id JOIN events e ON e.id=d.event_id JOIN users u ON u.id=dm.user_id JOIN people p ON p.id=u.person_id LEFT JOIN organizers o ON o.user_id=u.id AND o.deleted_at IS NULL WHERE dm.discussion_id=? AND dm.id>? AND dm.deleted_at IS NULL ORDER BY dm.id ASC LIMIT 250`,[row.discussionId,afterId]);return{discussion:result(row,user),messages};}
export async function deleteMessage(eventId:number,messageId:number,user:DiscussionIdentity){const row=await getAccess(eventId,user);if(!row||!row.discussionId||!canModerate(row,user))return false;const[update]=await pool.execute<ResultSetHeader>("UPDATE discussion_messages SET deleted_at=CURRENT_TIMESTAMP,deleted_by_user_id=? WHERE id=? AND discussion_id=? AND deleted_at IS NULL",[user.userId,messageId,row.discussionId]);return update.affectedRows>0;}
export async function sendMessage(eventId:number,user:DiscussionIdentity,message:string){const row=await getAccess(eventId,user);if(!row)return{kind:"forbidden" as const};if(!row.discussionId||row.status!=="Open")return{kind:"closed" as const};const[insert]=await pool.execute<ResultSetHeader>("INSERT INTO discussion_messages(discussion_id,user_id,message) VALUES(?,?,?)",[row.discussionId,user.userId,message]);return{kind:"ok" as const,id:insert.insertId};}
export async function setDiscussionStatus(eventId:number,user:DiscussionIdentity,status:"Open"|"Closed"){
  const row=await getAccess(eventId,user);if(!row)return false;const permissions=result(row,user);if(status==="Open"&&!permissions.canOpen)return false;if(status==="Closed"&&!permissions.canClose)return false;
  if(status==="Open")await pool.execute(`INSERT INTO event_discussions(event_id,status,opened_by_user_id,opened_at,closed_at) VALUES(?,'Open',?,CURRENT_TIMESTAMP,NULL) ON DUPLICATE KEY UPDATE status='Open',opened_by_user_id=VALUES(opened_by_user_id),opened_at=CURRENT_TIMESTAMP,closed_at=NULL`,[eventId,user.userId]);
  else if(row.discussionId)await pool.execute("UPDATE event_discussions SET status='Closed',closed_at=CURRENT_TIMESTAMP WHERE id=?",[row.discussionId]);
  return true;
}
export async function markTyping(eventId:number,user:DiscussionIdentity){const row=await getAccess(eventId,user);if(!row||!row.discussionId||row.status!=="Open")return false;await pool.execute(`INSERT INTO discussion_typing(discussion_id,user_id,last_typed_at) VALUES(?,?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE last_typed_at=CURRENT_TIMESTAMP`,[row.discussionId,user.userId]);return true;}
export async function listTyping(eventId:number,user:DiscussionIdentity){const row=await getAccess(eventId,user);if(!row)return null;if(!row.discussionId)return[];await pool.execute("DELETE FROM discussion_typing WHERE last_typed_at<CURRENT_TIMESTAMP-INTERVAL 1 MINUTE");const[rows]=await pool.query<RowDataPacket[]>(`SELECT dt.user_id userId,CONCAT_WS(' ',p.first_name,p.last_name) name FROM discussion_typing dt JOIN users u ON u.id=dt.user_id JOIN people p ON p.id=u.person_id WHERE dt.discussion_id=? AND dt.user_id<>? AND dt.last_typed_at>=CURRENT_TIMESTAMP-INTERVAL 7 SECOND`,[row.discussionId,user.userId]);return rows;}
export async function listParticipants(eventId:number,user:DiscussionIdentity){const row=await getAccess(eventId,user);if(!row||!canModerate(row,user))return null;const[rows]=await pool.query<RowDataPacket[]>(`SELECT u.id userId,CONCAT_WS(' ',p.first_name,p.last_name) name,p.email,r.reference_code referenceCode FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN users u ON u.person_id=a.person_id JOIN people p ON p.id=u.person_id WHERE r.event_id=? AND r.status='Confirmed' AND r.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM discussion_participant_blocks b WHERE b.event_id=r.event_id AND b.user_id=u.id) ORDER BY name`,[eventId]);return rows;}
export async function removeParticipant(eventId:number,targetUserId:number,user:DiscussionIdentity){const row=await getAccess(eventId,user);if(!row||!canModerate(row,user))return false;const[eligible]=await pool.query<RowDataPacket[]>(`SELECT 1 FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN users u ON u.person_id=a.person_id WHERE r.event_id=? AND u.id=? AND r.status='Confirmed' AND r.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM organizers o JOIN events e ON e.organizer_id=o.id WHERE e.id=r.event_id AND o.user_id=u.id) AND NOT EXISTS(SELECT 1 FROM event_staff es WHERE es.event_id=r.event_id AND es.user_id=u.id) LIMIT 1`,[eventId,targetUserId]);if(!eligible[0])return false;await pool.execute(`INSERT INTO discussion_participant_blocks(event_id,user_id,removed_by_user_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE removed_by_user_id=VALUES(removed_by_user_id),removed_at=CURRENT_TIMESTAMP`,[eventId,targetUserId,user.userId]);await pool.execute("DELETE dt FROM discussion_typing dt JOIN event_discussions d ON d.id=dt.discussion_id WHERE d.event_id=? AND dt.user_id=?",[eventId,targetUserId]);return true;}
