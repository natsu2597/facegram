"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

export async function getProfileByUsername(username : string){
    try{
        const user = await prisma.user.findUnique({
            where : {
                username : username,
            },
            select : {
                id : true,
                name : true,
                username : true,
                bio : true,
                image : true,
                location : true,
                website : true,
                createdAt : true,
                _count : {
                    select : {
                        followers : true,
                        following : true,
                        posts : true,
                    }
                }
            }
        });
        return user;
    }
    catch(error){
        console.error("Error fetching profile: ", error);
    }
}

export async function getUserPosts(userId : string){
    try{
        const posts = await prisma.post.findMany({
            where : {
                authorId : userId,
            },
            include : {
                author : {
                select : {
                    id : true,
                    name : true,
                    username : true,
                    image : true
                },
            },
            comments : {
                include : {
                    author : {
                        select : {
                            id : true,
                            name : true,
                            username : true,
                            image : true
                        }
                    }
                },
                orderBy : {
                    createdAt : "asc",
                },
            },
            likes : {
                select : {
                    userId : true,
                },
            },
              _count : {
                select : {
                  comments : true,
                  likes : true,
                },
              }  
            }
        })
        return posts;
    }
    catch(error){
        console.error("Error fetching user posts: ", error);
        throw new Error("Failed to fetch user posts");
    }
}

export async function getUserLikedPosts(userId : string){
    try{
        const likePosts = await prisma.post.findMany({
            where : {
                likes : {
                    some : {
                        userId : userId
                    },
                },
            },
            include :{
                author : {
                    select : {
                        id : true,
                        name : true,
                        username : true,
                        image : true,
                    }
                }
            }
        });
        return likePosts;
    }
    catch(error){
        console.log("Error fetching user liked posts: ", error);
        throw new Error("Failed to fetch user liked posts");
    }
}

export async function updateProfile(formData : FormData){
    try{
        const {userId : clerkId} = await auth();
        if(!clerkId) throw new Error("Unauthorized user");
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;

        const user = await prisma.user.update({
            where : { clerkId },
            data : {
                name,
                bio,
                location,
                website,
            }
        });

        revalidatePath("/profile");
        return { success : true, user };
    }
    catch(error){
        console.log("There was an error updating the profile :", error);
        throw new Error("Failed to update profile");
    }
}

export async function isFollowing(userId : string){
    try{
        const currentUserId = await getDbUserId();
        if(!currentUserId) return false;

        const follow = await prisma.follows.findUnique({
            where : {
                followerId_followingId: {
                    followerId : currentUserId,
                    followingId : userId,
                }
            }
        });

        return !!follow;
    }
    catch(error){
        console.log("Error loading following status", error);
        throw new Error("Failed to load following status");
        return false;
    }
}



