import { API_BASE_URL } from "@/lib/api/config";

export type ApiResponse<T>={success:boolean;message?:string;data:T};
export async function organizerApi<T>(path:string,init?:RequestInit):Promise<T>{const response=await fetch(`${API_BASE_URL}/api/organizer${path}`,{...init,credentials:"include",headers:{"Content-Type":"application/json",...init?.headers}});const result=await response.json().catch(()=>({success:false,message:"Invalid server response"})) as ApiResponse<T>;if(response.status===401&&typeof window!=="undefined"){window.location.href="/login";}if(!response.ok||!result.success)throw new Error(result.message??"The request could not be completed");return result.data;}
export async function currentSession(){const response=await fetch(`${API_BASE_URL}/api/auth/session`,{credentials:"include",cache:"no-store"});if(!response.ok)return null;const result=await response.json();return result.data as OrganizerSession;}
export async function organizerLogout(){await fetch(`${API_BASE_URL}/api/auth/logout`,{method:"POST",credentials:"include"});}
export type OrganizerSession={id:number;name:string;email:string;roles:string[];organizerId:number|null;organization:string|null};
