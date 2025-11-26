import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Grid } from '@/components/layout/Grid';
import { Stack } from '@/components/layout/Stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/user';

export default function HomePageNew() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.me);

  const stats = [
    {
      title: 'Total Messages',
      value: '1,284',
      description: 'Messages sent this month',
      trend: { value: 12, isPositive: true },
      icon: (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      title: 'Active Chats',
      value: '24',
      description: 'Ongoing conversations',
      trend: { value: 8, isPositive: true },
      icon: (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
    },
    {
      title: 'Online Friends',
      value: '18',
      description: 'Currently online',
      icon: (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Unread Messages',
      value: '7',
      description: 'Requires attention',
      trend: { value: 5, isPositive: false },
      icon: (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
  ];

  const recentChats = [
    {
      id: 1,
      name: 'Design Team',
      lastMessage: 'Great work on the mockups!',
      time: '2m ago',
      unread: 3,
    },
    {
      id: 2,
      name: 'Project Alpha',
      lastMessage: 'Meeting scheduled for tomorrow',
      time: '15m ago',
      unread: 0,
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      lastMessage: 'Thanks for the update',
      time: '1h ago',
      unread: 1,
    },
    {
      id: 4,
      name: 'Marketing Group',
      lastMessage: 'Campaign launched successfully',
      time: '3h ago',
      unread: 0,
    },
  ];

  return (
    <Stack spacing="xl" className="px-6 py-4">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'User'}!`}
        description="Here's what's happening with your chats today"
        actions={
          <Stack direction="row" spacing="sm">
            <Button variant="outline" onClick={() => navigate('/account')}>
              <svg
                className="size-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Button>
            <Button>
              <svg
                className="size-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </Button>
          </Stack>
        }
      />

      {/* Stats Grid */}
      <Grid cols={4} gap="md" responsive>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid cols={2} gap="lg" responsive>
        {/* Recent Chats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="sm">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="size-10 rounded-full from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {chat.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {chat.name}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="sm">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Create Group</div>
                    <div className="text-xs text-muted-foreground">
                      Start a group conversation
                    </div>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="size-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Add Contact</div>
                    <div className="text-xs text-muted-foreground">
                      Connect with someone new
                    </div>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Share Files</div>
                    <div className="text-xs text-muted-foreground">
                      Upload and share documents
                    </div>
                  </div>
                </div>
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  );
}
