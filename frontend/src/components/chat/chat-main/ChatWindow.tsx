// ChatWindow.tsx
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

export function ChatWindow() {
  return (
    <Card
      className="
        flex h-full w-full flex-col
        bg-sidebar                      /* giống sidebar */
        rounded-lg                      /* giống sidebar */
        border border-sidebar-border    /* giống sidebar */
        shadow-sm                       /* giống sidebar */
        my-2                            /* giống sidebar */
        mr-4
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar>
          <AvatarImage src="/avatars/frontend-team.png" />
          <AvatarFallback>FT</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <p className="text-sm font-semibold">Frontend Team</p>
          <p className="text-xs text-muted-foreground">
            5 members • Active now
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {/* Friend message */}
          <div className="flex items-start gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src="/avatars/user1.png" />
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>

            <div className="rounded-lg bg-muted p-2 text-sm">
              Chào đội, mai mình sẽ refactor lại đoạn đó nhé!
            </div>
          </div>

          {/* Your message */}
          <div className="flex items-start justify-end gap-2">
            <div className="rounded-lg bg-primary p-2 text-sm text-primary-foreground">
              Ok nhé, để mình chuẩn bị trước.
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button className="rounded-md p-2 hover:bg-muted">
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
