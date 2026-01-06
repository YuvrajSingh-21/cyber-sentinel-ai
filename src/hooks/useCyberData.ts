import { useState, useEffect, useCallback } from 'react';
import { LogEntry, Anomaly, TimelineEvent, SystemMetrics } from '@/types/cyber';
import {
  generateLogEntry,
  generateInitialLogs,
  generateAnomaly,
  generateInitialAnomalies,
  generateTimelineEvent,
  generateInitialTimeline,
  generateSystemMetrics,
} from '@/lib/mockData';

export const useCyberData = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateInitialLogs(50));
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => generateInitialAnomalies(8));
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => generateInitialTimeline(15));
  const [metrics, setMetrics] = useState<SystemMetrics>(() => generateSystemMetrics());
  const [isLive, setIsLive] = useState(true);

  // Real-time log updates
  useEffect(() => {
    if (!isLive) return;

    const logInterval = setInterval(() => {
      const newLog = generateLogEntry();
      setLogs(prev => [newLog, ...prev].slice(0, 200));
      
      // Random chance to generate anomaly
      if (Math.random() < 0.05) {
        const newAnomaly = generateAnomaly();
        setAnomalies(prev => [newAnomaly, ...prev].slice(0, 50));
        
        const newTimelineEvent = generateTimelineEvent();
        setTimeline(prev => [newTimelineEvent, ...prev].slice(0, 100));
      }
    }, 2000);

    return () => clearInterval(logInterval);
  }, [isLive]);

  // System metrics updates
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setMetrics(generateSystemMetrics());
    }, 3000);

    return () => clearInterval(metricsInterval);
  }, []);

  const updateAnomalyStatus = useCallback((id: string, status: Anomaly['status']) => {
    setAnomalies(prev => 
      prev.map(a => a.id === id ? { ...a, status } : a)
    );
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev);
  }, []);

  return {
    logs,
    anomalies,
    timeline,
    metrics,
    isLive,
    updateAnomalyStatus,
    clearLogs,
    toggleLive,
  };
};
