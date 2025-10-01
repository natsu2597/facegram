import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const onFileRouter = {
    postImage : f({image : {maxFileSize : "4MB", maxFileCount :1},}).middleware(async () => {
        const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");
        return { userId };
    }).onUploadComplete(async ({ metadata, file }) => {
        try{
            return {fileUrl: file.ufsUrl}
        }
        catch(error){
            console.error("Error in uploading image", error)
            throw error;
        }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof onFileRouter;