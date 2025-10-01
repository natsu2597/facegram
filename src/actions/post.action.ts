"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";



export async function createPost(content : string, image: string){
    try{
        const userId = await getDbUserId();
        if(!userId) return;

        const post = await prisma.post.create({
            data : {
                content,
                image,
                authorId : userId,
            }
        });
        revalidatePath("/");
        return {success : true,post}
    }
    catch(error){
        console.error("Failed to create Post: ", error)
        return { success : false, error : "Failed to create Post" }
    }
}

export async function getPosts() : Promise<PostWithRelations[]>
{
    try{
        const posts = await prisma.post.findMany({
            orderBy : {
                createdAt : "desc"
            },
            include : {
                author : {
                    select : {
                        id : true,
                        name : true,
                        image : true,
                        username : true,
                    }
                },
                comments : {
                    include : {
                        author : {
                            select : {
                                id : true,
                                name : true,
                                image : true,
                                username : true,
                            }
                        }
                    },
                    orderBy : {
                        createdAt : "asc"
                    }
                },
                likes : {
                    select : {
                        userId : true
                    }
                },
                _count : {
                    select : {
                        likes : true,
                        comments: true,
                    }
                }
            }

        })
        return posts;
    }
    catch(error){
        console.log("Error fetching posts: ", error);
        throw new Error("Failed to fetch posts");
    }
}

export async function toggleLike(postId : string){
    try{
        const userId = await getDbUserId();
        if(!userId) return;

        //check if like exists
        const existingLike = await prisma.like.findUnique({
            where : {
                userId_postId : {
                    postId,
                    userId,
                }
            }
        });
        const post = await prisma.post.findUnique({
            where : {
                id : postId
            },
            select : {
                authorId : true
            }
        });
        if(!post) throw new Error("Post not found")
        if(existingLike){
            await prisma.like.delete({
                where : {
                    userId_postId : {
                        userId,
                        postId,
                    }
                }
            });

        }
        else{
            await prisma.$transaction([
                prisma.like.create({
                    data : {
                        userId,
                        postId,
                    }
                }),
                ...(post.authorId !== userId) ?
                [prisma.notification.create({
                    data : {
                        type : "LIKE",
                        userId : post.authorId,
                        creatorId : userId,
                        postId,
                    }
                }),
            ] : []
            ]);
        }
        revalidatePath("/")
        return {success : true};
        }

        
    catch(error){
        console.error("Failed to toggle like: ", error);
        return {success : false, error : "Failed to toggle like"};
    }
}

export async function createComment(postId : string, content: string){
    try{
        const userId = await getDbUserId();
        if(!userId) return;

        if(!content) throw new Error("Comment cannot be empty");

        const post = await prisma.post.findUnique({
            where : {
                id : postId,
            },
            select : {
                authorId : true
            }
        });
        if(!post) throw new Error("Post not found");

        //creating comment and notifications
        const [comment] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const newComment = await tx.comment.create({
                data: {
                    content,
                    authorId : userId,
                    postId,
                }
            });

            if(post.authorId !== userId){
                await tx.notification.create({
                    data : {
                        type : "COMMENT",
                        userId : post.authorId,
                        creatorId : userId,
                        postId,
                        commentId : newComment.id,
                    }
                })
            }
            return [newComment];
        });
        revalidatePath(`/`);
        return {success:true, comment}
    }
    catch(error){
        console.error("Failed to create comment: ", error);
        return {success : false, error : "Failed to create comment"}
    }
}

export async function deletePost(postId : string){
    try{
        const userId = await getDbUserId();
        const post = await prisma.post.findUnique({
            where : {
                id : postId
            },
            select : {
                authorId : true
            }
        });
        if(!post) throw new Error("Post not found");
        if(post.authorId !== userId) throw new Error("You are not authorized to delete this comment");

        await prisma.post.delete({
            where : {
                id : postId
            },
        });
        revalidatePath("/")
        return {success : true};
    }
    catch(error){
        return {success : false, error : "Failed to delete post"}
    }
}