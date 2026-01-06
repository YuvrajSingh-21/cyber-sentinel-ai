import { useState, useMemo } from 'react';
import { LogEntry } from '@/types/cyber';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Network, 
  Cpu, 
  FileCode, 
  Key,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

type SortField = 'timestamp' | 'source' | 'severity' | 'eventType';
type SortOrder = 'asc' | 'desc';

const sourceIcons = {
  network: Network,
  system: Cpu,
  file: FileCode,
  auth: Key,
};

export const Logs = ({ logs, onClearLogs }: LogsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.eventType.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query) ||
        (log.ip && log.ip.includes(query))
      );
    }

    // Source filter
    if (sourceFilter !== 'all') {
      result = result.filter(log => log.source === sourceFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter(log => log.severity === severityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'eventType':
          comparison = a.eventType.localeCompare(b.eventType);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [logs, searchQuery, sourceFilter, severityFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSeverityBadge = (severity: LogEntry['severity']) => {
    const variants = {
      critical: 'critical',
      high: 'warning',
      medium: 'info',
      low: 'default',
    } as const;
    return variants[severity];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Log Explorer</h1>
          <p className="text-muted-foreground mt-1">
            {filteredLogs.length} of {logs.length} logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="cyber-button-secondary">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={onClearLogs}
            className="cyber-button-ghost text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs by message, type, source, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full pl-10"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "cyber-button-secondary",
              showFilters && "bg-primary/10 border-primary/30"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              showFilters && "rotate-180"
            )} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Source</label>
              <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="search-input text-sm"
              >
                <option value="all">All Sources</option>
                <option value="network">Network</option>
                <option value="system">System</option>
                <option value="file">File</option>
                <option value="auth">Auth</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Severity</label>
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="search-input text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Log Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-cyber">
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-2">
                    Timestamp
                    {sortField === 'timestamp' && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        sortOrder === 'asc' && "rotate-180"
                      )} />
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-2">
                    Source
                    {sortField === 'source' && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        sortOrder === 'asc' && "rotate-180"
                      )} />
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('eventType')}
                >
                  <div className="flex items-center gap-2">
                    Event Type
                    {sortField === 'eventType' && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        sortOrder === 'asc' && "rotate-180"
                      )} />
                    )}
                  </div>
                </th>
                <th>Message</th>
                <th 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center gap-2">
                    Severity
                    {sortField === 'severity' && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        sortOrder === 'asc' && "rotate-180"
                      )} />
                    )}
                  </div>
                </th>
                <th>IP Address</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 50).map((log) => {
                const Icon = sourceIcons[log.source];
                return (
                  <tr key={log.id} className="group">
                    <td className="font-mono text-xs whitespace-nowrap">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{log.source}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{log.eventType}</td>
                    <td className="max-w-xs truncate">{log.message}</td>
                    <td>
                      <StatusBadge variant={getSeverityBadge(log.severity)}>
                        {log.severity}
                      </StatusBadge>
                    </td>
                    <td className="font-mono text-xs">{log.ip || '-'}</td>
                    <td className="font-mono text-xs text-muted-foreground">
                      {log.hash.slice(0, 12)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No logs match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
