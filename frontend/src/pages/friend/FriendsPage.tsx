import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  Search,
  User2Icon,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

// Mock data for friend requests
const friendRequests = [
  {
    id: 1,
    name: 'Sarah Wilson',
    username: '@sarahw',
    avatar: '/placeholder.svg?height=40&width=40',
    mutuals: 12,
    time: '2h ago',
  },
  {
    id: 2,
    name: 'Michael Chen',
    username: '@mchen_dev',
    avatar: '/placeholder.svg?height=40&width=40',
    mutuals: 3,
    time: '5h ago',
  },
  {
    id: 3,
    name: 'Emma Davis',
    username: '@emmad',
    avatar: '/placeholder.svg?height=40&width=40',
    mutuals: 8,
    time: '1d ago',
  },
];

// Mock data for friends list
const friends = [
  {
    id: 1,
    name: 'Alex Thompson',
    username: '@alex_t',
    status: 'online',
    avatar: '/placeholder.svg?height=80&width=80',
    role: 'Designer',
  },
  {
    id: 2,
    name: 'James Rodriguez',
    username: '@jrod',
    status: 'offline',
    avatar: '/placeholder.svg?height=80&width=80',
    role: 'Developer',
  },
  {
    id: 3,
    name: 'Lisa Wang',
    username: '@lisaw',
    status: 'online',
    avatar: '/placeholder.svg?height=80&width=80',
    role: 'Product Manager',
  },
  {
    id: 4,
    name: 'David Kim',
    username: '@dkim',
    status: 'idle',
    avatar: '/placeholder.svg?height=80&width=80',
    role: 'Frontend Dev',
  },
  {
    id: 5,
    name: 'Sophie Martin',
    username: '@smartin',
    status: 'offline',
    avatar: '/placeholder.svg?height=80&width=80',
    role: 'UX Researcher',
  },
  {
    id: 6,
    name: "Ryan O'Connor",
    username: '@ryano',
    status: 'online',
    avatar: '/placeholder.svg?height=80&width=80',
    role: 'DevOps',
  },
];

export default function FriendsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex flex-row justify-center items-center">
          <ArrowLeft
            size="1rem"
            className="mr-2 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => {
              navigate('/');
            }}
          />
          <p className="text-muted-foreground ">
            Manage your connections and requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search friends..."
              className="pl-9"
            />
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Friends List (2 Columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              All Friends ({friends.length})
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Online
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Newest
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Card
                key={friend.id}
                className="group hover:border-primary/50 transition-colors rounded-lg py-0 flex flex-col gap-2 border border-border shadow-sm"
              >
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage
                          src={friend.avatar || '/placeholder.svg'}
                          alt={friend.name}
                        />
                        <AvatarFallback>
                          {friend.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          friend.status === 'online'
                            ? 'bg-green-500'
                            : friend.status === 'idle'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none">
                        {friend.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {friend.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </CardContent>
                <div className="px-4 pb-4 pt-0 flex  flex-row gap-2 w-full">
                  <Button
                    variant="secondary"
                    className=" h-8 text-xs flex gap-0 justify-center items-center"
                  >
                    <MessageSquare className="mr-2 h-3 w-3" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className=" h-8 text-xs bg-transparent flex gap-0 justify-center items-center"
                  >
                    <User2Icon className="mr-2 h-3 w-3" />
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar - Friend Requests */}
        <div className="space-y-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Requests</h2>
            <div className="flex gap-2 h-8">
              <Badge variant="secondary" className="rounded-full">
                {friendRequests.length}
              </Badge>
            </div>
          </div>

          <Card className="overflow-scrollable max-h-[400px] flex flex-col gap-2 border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Requests</CardTitle>
              <CardDescription>
                People who want to connect with you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between gap-4 pb-4 last:pb-0 last:border-0 border-b"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={request.avatar || '/placeholder.svg'}
                        alt={request.name}
                      />
                      <AvatarFallback>
                        {request.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {request.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.mutuals} mutual friends
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Accept</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Decline</span>
                    </Button>
                  </div>
                </div>
              ))}
              {friendRequests.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No pending requests
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-background flex items-center justify-center mb-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Invite Friends</h3>
              <p className="text-sm text-muted-foreground">
                Share your profile link to connect with more people.
              </p>
              <Button variant="outline" className="w-full mt-2 bg-transparent">
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
