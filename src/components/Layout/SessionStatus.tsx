import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sessionManager } from '@/lib/sessionManager';

interface SessionStatusProps {
  className?: string;
}

export function SessionStatus({ className }: SessionStatusProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const timeUntilTimeout = sessionManager.getTimeUntilTimeout();
      const timeUntilWarning = sessionManager.getTimeUntilWarning();
      
      setTimeRemaining(timeUntilTimeout);
      setIsWarning(timeUntilWarning <= 0 && timeUntilTimeout > 0);
      setIsVisible(timeUntilTimeout > 0);
    };

    // Update immediately
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (timeRemaining <= 0) return 'text-red-500';
    if (isWarning) return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (timeRemaining <= 0) return <AlertTriangle className="h-4 w-4" />;
    if (isWarning) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border',
      isWarning ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50',
      className
    )}>
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className={cn('text-xs font-medium', getStatusColor())}>
          {isWarning ? 'เซสชันจะหมดอายุ' : 'เซสชันใช้งานได้'}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
}

// Compact version for header
export function SessionStatusCompact({ className }: SessionStatusProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const timeUntilTimeout = sessionManager.getTimeUntilTimeout();
      const timeUntilWarning = sessionManager.getTimeUntilWarning();
      
      setTimeRemaining(timeUntilTimeout);
      setIsWarning(timeUntilWarning <= 0 && timeUntilTimeout > 0);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    return `${minutes}m`;
  };

  if (timeRemaining <= 0) return null;

  return (
    <div className={cn(
      'group relative flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5',
      isWarning 
        ? 'text-amber-100 bg-gradient-to-br from-amber-500/40 via-orange-500/30 to-yellow-500/40 border-amber-400/50' 
        : 'text-green-100 bg-gradient-to-br from-green-500/40 via-emerald-500/30 to-teal-500/40 border-green-400/50',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl blur-sm"></div>
      <div className="relative flex items-center space-x-2">
        <div className={cn(
          'p-1 rounded-lg shadow-lg',
          isWarning 
            ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
            : 'bg-gradient-to-br from-green-400 to-emerald-500'
        )}>
          <Clock className="h-3 w-3 drop-shadow-sm" />
        </div>
        <span className="font-mono drop-shadow-sm">{formatTime(timeRemaining)}</span>
      </div>
    </div>
  );
}
