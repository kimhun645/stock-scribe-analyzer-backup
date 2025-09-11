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
    <header className="group relative overflow-hidden mb-6 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] transform backdrop-blur-lg border-0">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-indigo-400/30 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500 blur-sm"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 blur-md"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Main Header Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Title with 3D Effect */}
          <div className="flex-1">
            <div className="relative">
              <h1 className="relative text-2xl lg:text-3xl font-bold text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <span className="relative z-10">{title}</span>
                <div className="absolute inset-0 text-white/20 blur-sm transform translate-x-1 translate-y-1">
                  {title}
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm"></div>
              </h1>
              <p className="text-white/90 text-sm font-medium drop-shadow-md mt-1">
                จัดการข้อมูลและระบบของคุณ
              </p>
            </div>
          </div>

          {/* Right Side - Actions with 3D Effects */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <GlobalSearch />
            </div>

            <div className="relative">
              <SessionStatusCompact />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="group/btn relative p-3 rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-sm border-white/30 hover:from-white/30 hover:via-white/20 hover:to-white/10 text-white hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
              <Bell className="relative h-4 w-4 drop-shadow-lg group-hover/btn:rotate-12 transition-transform duration-300" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 shadow-lg"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </header>
  );
}