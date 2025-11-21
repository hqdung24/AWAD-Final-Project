// ChatList.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type Chat = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime?: string;
  unread?: number;
  isActive?: boolean;
};
export function ChatListItem({ chat }: { chat: Chat }) {
  const initials = getInitials(chat.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={chat.name}
          className="h-auto rounded-xl px-3 py-2 data-[state=active]:bg-muted data-[state=active]:shadow-sm"
          data-state={chat.isActive ? 'active' : 'inactive'}
        >
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback className="text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-sm font-medium">
                  {chat.name}
                </p>
                {chat.lastMessageTime && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {chat.lastMessageTime}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-xs text-muted-foreground">
                  {chat.lastMessage}
                </p>

                {chat.unread && chat.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {chat.unread > 9 ? '9+' : chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
