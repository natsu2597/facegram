"use client"

import { getProfileByUsername, getUserLikedPosts, getUserPosts, updateProfile } from "@/actions/profile.action"
import { toggleFollow } from "@/actions/user.action"
import { SignInButton, useUser } from "@clerk/nextjs"
import { useState } from "react"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@radix-ui/react-avatar"
import { AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CalendarIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, MapIcon, Table2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/PostCard"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


type User = Awaited<ReturnType<typeof getProfileByUsername>>
type Post = Awaited<ReturnType<typeof getUserPosts>>
type LikedPost = Awaited<ReturnType<typeof getUserLikedPosts>>

interface ProfilePageClientProps {
    user : NonNullable<User>,
    posts : Post,
    likedPosts : LikedPost,
    isUserFollowing : boolean
}

function ProfilePageClient({isUserFollowing: isCurrentUserFollowing,user,posts,likedPosts} : ProfilePageClientProps) {

    const { user : currentUser } = useUser();
    const [isFollowing ,setIsFollowing] = useState(isCurrentUserFollowing);
    const [ showEditDialog, setShowEditDialog ] = useState(false);
    const [isUpdateFollowing, setIsUpdateFollowing] = useState(false);

    const [editForm, setEditForm] = useState({
        name : user?.name || "",
        bio : user?.bio || "",
        location : user?.location || "",
        website : user?.website || "",
    });

    const handleSubmit = async () => {
        const formData = new FormData();
        Object.entries(editForm).forEach(([key,value]) => formData.append(key,value));

        const result = await updateProfile(formData);
        if(result.success){
            setShowEditDialog(false);
            toast.success("Profile updated successfully");
        }
    }

    const handleFollow = async () => {
        if(!currentUser) return;
        try{
            setIsUpdateFollowing(true);
            await toggleFollow(user.id);
            setIsFollowing(!isFollowing);

        }
        catch(error){
            toast.error(`Error ${isFollowing ? "unfollowing" : "following"} the profile`);

        }
        finally{
            setIsUpdateFollowing(false);
        }
        
    }

    const ownProfile = currentUser?.username === user.username || currentUser?.emailAddresses[0].emailAddress.split("@")[0].toLowerCase() === user.username;

    const formatDate = format(new Date(user.createdAt), "MMMM yyyy")
    return (
        <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 gap-6">
                {/* Display Card */}
                <div className="w-full mx-w-lg mx-auto">
                    <Card>
                        <CardContent>
                            <div className="flex flex-col items-center text-center ">
                                <Avatar className="w-24 h-24 mt-4">
                                    <AvatarImage className="rounded-full"  src={user.image ?? "/avatar.png"} />
                                </Avatar>
                                <h1 className="mt-4 text-2xl font-bold">{user.name || user.username}</h1>
                                <p className="text-muted-foreground">@{user.username}</p>
                                <p className="mt-2 text-sm">{user.bio}</p>

                                {/* Profile Stats */}
                                <div className="w-full mt-6">
                                    <div className="flex justify-between mt-6">
                                        <div>
                                            <div className="font-semibold"> {user._count.following}</div>
                                            <div className="text-sm text-muted-foreground">Following</div>
                                        </div>
                                        <Separator orientation="vertical" />
                                        <div>
                                            <div className="font-semibold"> {user._count.followers}</div>
                                            <div className="text-sm text-muted-foreground">Followers</div>
                                        </div>
                                        <Separator orientation="vertical" />
                                        <div>
                                            <div className="font-semibold"> {user._count.posts}</div>
                                            <div className="text-sm text-muted-foreground">Posts</div>
                                        </div>
                                    </div>
                                </div>
                                {/* FOLLOW and EDIT Buttons */}
                                {!currentUser ? (
                                    <SignInButton mode="modal">
                                        <Button className="w-full mt-4">Follow</Button>
                                    </SignInButton>
                                ) : ownProfile ? (
                                    <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                                        <EditIcon className="size-4 mr-2" />
                                        Edit Profile</Button>
                                ) : 
                                (
                                    <Button className="w-full mt-4" onClick={handleFollow} disabled={isUpdateFollowing} variant={isFollowing ?  "outline" : "default"}>
                                        {isFollowing ? "Unfollow" : "Follow"}
                                    </Button>
                                )
                                }

                                {/* LOCATION AND WEBSITE */}
                                <div className="w-full mt-6 space-y-2 text-sm">
                                    
                                    {user.location && (
                                        <div className="flex items-center text-muted-foreground">   
                                        <MapIcon className="size-4 mr-2" />
                                        {user.location}

                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center text-muted-foreground">
                                            <LinkIcon className="size-4 mr-2" />
                                            <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`}>
                                            {
                                                user.website
                                            }</a>
                                        </div>
                                    )}
                                    <div className="flex items-center text-muted-foreground">
                                        <CalendarIcon className="size-4 mr-2" />
                                        Joined {formatDate}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Tabs className="w-full">
                   <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger className="flex items-center gap-2 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 text-semibold" value="posts">
                        <FileTextIcon className="size-4" />
                        Posts
                    </TabsTrigger>
                    <TabsTrigger className="flex items-center rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state-active]:bg-transparent px-6 text-semibold" value="likes">
                        <HeartIcon className="size-4" />
                        Likes
                    </TabsTrigger>
                   </TabsList>
                   {/* Posts */}
                   <TabsContent value="posts" className="mt-6">
                       <div className="space-y-6">
                           {posts.length > 0 ? (
                                posts.map((post : any) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
                           ) : (
                                <div className="text-center text-muted-foreground">No posts</div>
                           )}
                       </div>
                   </TabsContent>
                   
                   <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post : any) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input name="name" value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                        placeholder="Your Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea name="bio" value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio :e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input name="location" value={editForm.location} onChange={(e) => setEditForm({...editForm,location: e.target.value})} placeholder="Where are you From??" />
                    </div>

                    <div>
                        <Label>Website</Label>
                        <Input name="website" placeholder="Do you have a website?" value={editForm.website}
                        onChange={(e) => setEditForm({...editForm, website : e.target.value})} />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit}>
                        Update 
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        </div>
        </div>
    )
}

export default ProfilePageClient;

