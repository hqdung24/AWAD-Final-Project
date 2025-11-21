import { ChatSidebar } from '@/components/chat/chat-sidebar/ChatSidebar';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatWindow } from '@/components/chat/chat-main/ChatWindow';
export default function HomePage() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 96)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <ChatSidebar variant="floating" />
      <SidebarInset className="flex-1 mr-2">
        <ChatWindow />
      </SidebarInset>
    </SidebarProvider>
  );
}
