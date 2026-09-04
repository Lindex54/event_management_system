import { API_BASE_URL } from "@/lib/api/config";

export type ApiResponse<T>={success:boolean;message?:string;data:T};
export async function attendeeApi<T>(path:string,init?:RequestInit):Promise<T>{const response=await fetch(`${API_BASE_URL}/api/attendee${path}`,{...init,credentials:"include",headers:{"Content-Type":"application/json",...init?.headers}});const result=await response.json().catch(()=>({success:false,message:"Invalid server response"})) as ApiResponse<T>;if(response.status===401&&typeof window!=="undefined"){window.location.href="/login";}if(!response.ok||!result.success)throw new Error(result.message??"The request could not be completed");return result.data;}
export async function currentAttendeeSession(){const response=await fetch(`${API_BASE_URL}/api/auth/session`,{credentials:"include",cache:"no-store"});if(!response.ok)return null;const result=await response.json();return result.data as AttendeeSession;}
export async function attendeeLogout(){await fetch(`${API_BASE_URL}/api/auth/logout`,{method:"POST",credentials:"include"});}
export type AttendeeSession={id:number;name:string;email:string;roles:string[];attendeeId:number|null};
