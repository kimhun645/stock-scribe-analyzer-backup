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
      'flex items-center space-x-1 px-2 py-1 rounded text-xs',
      isWarning ? 'text-amber-600 bg-amber-100' : 'text-green-600 bg-green-100',
      className
    )}>
      <Clock className="h-3 w-3" />
      <span className="font-mono">{formatTime(timeRemaining)}</span>
    </div>
  );
}

