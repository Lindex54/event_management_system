import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, databaseErrorSqlMessage, pool } from "../config/database";

interface UploadedFileRow extends RowDataPacket {
  originalName:string;
  mimeType:string;
  fileSize:number;
  fileData:Buffer;
}

const router=Router();

router.get("/:storageKey",async(request,response)=>{
  const storageKey=typeof request.params.storageKey==="string"&&/^[a-f0-9]{48}$/.test(request.params.storageKey)?request.params.storageKey:null;
  if(!storageKey){response.status(400).json({success:false,message:"Invalid file link"});return;}
  try{
    const[rows]=await pool.query<UploadedFileRow[]>("SELECT original_name originalName,mime_type mimeType,file_size fileSize,file_data fileData FROM uploaded_files WHERE storage_key=? LIMIT 1",[storageKey]);
    const file=rows[0];
    if(!file){response.status(404).json({success:false,message:"File not found"});return;}
    const fallbackName=file.originalName.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,120)||"event-file";
    response.set({
      "Content-Type":file.mimeType,
      "Content-Length":String(file.fileSize),
      "Content-Disposition":`inline; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      "Cache-Control":"public, max-age=604800, immutable",
      "X-Content-Type-Options":"nosniff",
    });
    response.send(file.fileData);
  }catch(error){
    const code=databaseErrorCode(error),sqlMessage=databaseErrorSqlMessage(error);
    console.error(`Load uploaded file failed (${code})${sqlMessage?`: ${sqlMessage}`:""}`);
    response.status(500).json({success:false,message:"Unable to load this file"});
  }
});

export default router;
