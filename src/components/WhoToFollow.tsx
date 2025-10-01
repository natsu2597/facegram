import { getRandomUser } from "@/actions/user.action"
import { Card, CardContent, CardHeader } from "./ui/card";
import  Link  from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";


async function WhoToFollow() {
  const users = await getRandomUser();

  if(users.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        Who to follow
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-1">
                    <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                        <Avatar>
                          <AvatarImage src={user.image ?? "/avatar.png"} />
                        </Avatar>
                    </Link>
                    <div className="text-xs">
                      <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                        {user.name}
                      </Link>
                      <p className="text-muted-foreground">@{user.username}</p>
                      <p className="text-muted-foreground">{user._count.followers} followers</p>
                    </div>
                </div>

            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


export default WhoToFollow