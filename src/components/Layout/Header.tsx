import React, { useState, useEffect } from 'react';
import { Bell, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionStatusCompact } from './SessionStatus';
import { GlobalSearch } from '@/components/Search/GlobalSearch';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';
import { notificationService } from '@/lib/notificationService';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial unread count
    setUnreadCount(notificationService.getUnreadCount());

    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((notifications) => {
      setUnreadCount(notifications.filter(n => !n.read).length);
    });

    return unsubscribe;
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-card border-b border-gray-200 relative z-30 font-thai">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800 font-kanit">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <GlobalSearch />

          <SessionStatusCompact />

          <Button 
            variant="ghost" 
            size="sm" 
            className="relative hover:bg-gray-100"
            onClick={() => setIsNotificationOpen(true)}
          >
            <Bell className="h-5 w-5 text-gray-700" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </header>
  );
}