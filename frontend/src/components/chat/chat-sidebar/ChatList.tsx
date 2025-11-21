// ChatList.tsx
import { IconCirclePlusFilled } from '@tabler/icons-react';
import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ChatListItem } from '@/components/chat/chat-sidebar/ChatListItem';
const mockChats = [
  {
    id: '1',
    name: 'Frontend Team',
    avatar: '/avatars/frontend-team.png',
    lastMessage: 'Duy: Để mai mình refactor lại đoạn đó nhé.',
    lastMessageTime: '09:24',
    unread: 2,
    isActive: true,
  },
  {
    id: '2',
    name: 'Product Design',
    avatar: '/avatars/product-design.png',
    lastMessage: 'Linh: Tớ vừa update lại figma.',
    lastMessageTime: 'Hôm qua',
    unread: 0,
  },
  {
    id: '3',
    name: 'Blau Chat – Beta',
    avatar: '/avatars/blau-chat.png',
    lastMessage: 'System: New deployment was successful ✅',
    lastMessageTime: 'Thứ 2',
    unread: 5,
  },
  {
    id: '4',
    name: 'Anh Nam',
    avatar: '/avatars/nam.png',
    lastMessage: 'Ok, để anh check lại PR.',
    lastMessageTime: 'Thứ 7',
    unread: 0,
  },
  {
    id: '5',
    name: 'DevOps',
    avatar: '/avatars/devops.png',
    lastMessage: 'Tuấn: Cluster đã scale xong rồi.',
    lastMessageTime: '2 tuần',
    unread: 1,
  },
];

export function ChatList() {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 h-full sm:min-w-[20rem]">
        {/* Header: Quick create + New chat */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground
                         active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear rounded-lg px-3 py-2 w-fit"
            >
              <IconCirclePlusFilled className="size-4" />
              <span className="truncate">Create new group</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <UserPlus className="size-4" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Chat list with ScrollArea */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1">
            {mockChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </div>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
