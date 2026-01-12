import { useState } from 'react';
import { Anomaly } from '@/types/cyber';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Cpu, 
  Network, 
  FileCode, 
  Key,
  ChevronRight,
  X,
  CheckCircle,
  Eye,
  Trash2,
  Brain,
  TrendingUp
} from 'lucide-react';

interface AnomaliesProps {
  anomalies: Anomaly[];
  onUpdateStatus: (id: string, status: Anomaly['status']) => void;
}

const typeIcons = {
  cpu_spike: Cpu,
  network_anomaly: Network,
  file_change: FileCode,
  auth_failure: Key,
  suspicious_activity: AlertTriangle,
};

const typeColors = {
  cpu_spike: 'bg-warning/10 text-warning border-warning/30',
  network_anomaly: 'bg-primary/10 text-primary border-primary/30',
  file_change: 'bg-success/10 text-success border-success/30',
  auth_failure: 'bg-destructive/10 text-destructive border-destructive/30',
  suspicious_activity: 'bg-accent/10 text-accent border-accent/30',
};

// Remediation steps based on anomaly type
const remediationSteps: Record<string, { steps: string[]; precautions: string[] }> = {
  cpu_spike: {
    steps: [
      "Identify the process causing high CPU usage using task manager or 'top' command",
      "Check for malware or cryptominers running in background",
      "Review recently installed software or updates",
      "Terminate suspicious processes and quarantine related files",
      "Run a full system antivirus scan"
    ],
    precautions: [
      "Set up CPU usage alerts at 70% threshold",
      "Implement application whitelisting",
      "Regular system performance monitoring",
      "Keep all software and OS updated"
    ]
  },
  network_anomaly: {
    steps: [
      "Capture network traffic using Wireshark or tcpdump",
      "Identify the source and destination of unusual traffic",
      "Block suspicious IPs at firewall level",
      "Check for data exfiltration attempts",
      "Review DNS queries for C2 communication patterns"
    ],
    precautions: [
      "Implement network segmentation",
      "Deploy intrusion detection systems (IDS)",
      "Enable deep packet inspection",
      "Maintain updated firewall rules",
      "Regular network traffic baseline analysis"
    ]
  },
  file_change: {
    steps: [
      "Compare file hash with known good version",
      "Check file modification timestamps and user context",
      "Restore file from backup if compromised",
      "Scan modified files for malware signatures",
      "Review file access logs for unauthorized changes"
    ],
    precautions: [
      "Implement file integrity monitoring (FIM)",
      "Use version control for critical files",
      "Restrict write permissions to essential users",
      "Enable audit logging for sensitive directories"
    ]
  },
  auth_failure: {
    steps: [
      "Lock the affected user account temporarily",
      "Review login attempt patterns and source IPs",
      "Check for credential stuffing or brute force attacks",
      "Reset passwords for compromised accounts",
      "Enable additional authentication factors"
    ],
    precautions: [
      "Implement account lockout policies",
      "Deploy multi-factor authentication (MFA)",
      "Use CAPTCHA after failed attempts",
      "Monitor for leaked credentials on dark web",
      "Implement geo-based login restrictions"
    ]
  },
  suspicious_activity: {
    steps: [
      "Isolate the affected system from network",
      "Collect forensic evidence (memory dump, logs)",
      "Analyze timeline of events leading to the alert",
      "Check for lateral movement indicators",
      "Engage incident response team if necessary"
    ],
    precautions: [
      "Implement behavior-based detection",
      "Regular security awareness training",
      "Deploy endpoint detection and response (EDR)",
      "Maintain incident response playbooks",
      "Conduct regular penetration testing"
    ]
  }
};

export const Anomalies = ({ anomalies, onUpdateStatus }: AnomaliesProps) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'investigating' | 'resolved'>('all');
  const [showRemediation, setShowRemediation] = useState(false);

  const filteredAnomalies = filter === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.status === filter);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-warning';
    return 'text-primary';
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return 'bg-destructive';
    if (score >= 60) return 'bg-warning';
    return 'bg-primary';
  };

  const getRemediation = (type: string) => {
    return remediationSteps[type] || remediationSteps['suspicious_activity'];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-warning" />
            Anomaly Detection
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered threat analysis with XAI explanations
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'investigating', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                filter === status 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-destructive">
            {anomalies.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Investigating</p>
          <p className="text-2xl font-bold text-warning">
            {anomalies.filter(a => a.status === 'investigating').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-success">
            {anomalies.filter(a => a.status === 'resolved').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Risk Score</p>
          <p className="text-2xl font-bold text-primary">
            {Math.round(anomalies.reduce((acc, a) => acc + a.riskScore, 0) / anomalies.length)}
          </p>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="grid gap-4">
        {filteredAnomalies.map((anomaly) => {
          const Icon = typeIcons[anomaly.type];
          
          return (
            <div
              key={anomaly.id}
              className={cn(
                "glass-card-hover p-4 cursor-pointer",
                selectedAnomaly?.id === anomaly.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedAnomaly(anomaly)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-xl border shrink-0",
                  typeColors[anomaly.type]
                )}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold">{anomaly.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {anomaly.timestamp.toLocaleString()} • {anomaly.source}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Risk Score */}
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <p className={cn("text-xl font-bold", getRiskColor(anomaly.riskScore))}>
                          {anomaly.riskScore}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <StatusBadge 
                        variant={
                          anomaly.status === 'active' ? 'critical' :
                          anomaly.status === 'investigating' ? 'warning' :
                          anomaly.status === 'resolved' ? 'success' : 'default'
                        }
                        pulse={anomaly.status === 'active'}
                      >
                        {anomaly.status}
                      </StatusBadge>
                    </div>
                  </div>

                  {/* Risk Bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                    <div 
                      className={cn("h-full rounded-full transition-all", getRiskBg(anomaly.riskScore))}
                      style={{ width: `${anomaly.riskScore}%` }}
                    />
                  </div>

                  {/* Related Logs */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{anomaly.relatedLogs.length} related logs</span>
                    <span>•</span>
                    <span className="font-mono">{anomaly.type.replace(/_/g, ' ')}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* XAI Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">XAI Analysis</h2>
              </div>
              <button 
                onClick={() => {
                  setSelectedAnomaly(null);
                  setShowRemediation(false);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">{selectedAnomaly.description}</h3>
                <p className="text-sm text-muted-foreground">
                  Detected at {selectedAnomaly.timestamp.toLocaleString()}
                </p>
              </div>

              {/* Risk Score Visual */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Risk Assessment</span>
                  <span className={cn("text-2xl font-bold", getRiskColor(selectedAnomaly.riskScore))}>
                    {selectedAnomaly.riskScore}/100
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", getRiskBg(selectedAnomaly.riskScore))}
                    style={{ width: `${selectedAnomaly.riskScore}%` }}
                  />
                </div>
              </div>

              {/* XAI Explanation */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Why was this flagged?</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedAnomaly.xaiReason}
                </p>
              </div>

              {/* Remediation Steps - shown after clicking Investigate */}
              {showRemediation && (
                <div className="space-y-4 animate-fade-in">
                  <div className="glass-card p-4 border-l-4 border-primary">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Steps to Remediate
                    </h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {getRemediation(selectedAnomaly.type).steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="glass-card p-4 border-l-4 border-warning">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Precautions to Prevent Recurrence
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {getRemediation(selectedAnomaly.type).precautions.map((precaution, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                          <span className="leading-relaxed">{precaution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                {!showRemediation ? (
                  <button
                    onClick={() => {
                      setShowRemediation(true);
                      onUpdateStatus(selectedAnomaly.id, 'investigating');
                    }}
                    className="cyber-button-secondary flex-1"
                  >
                    <Eye className="w-4 h-4" />
                    Investigate
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedAnomaly.id, 'resolved');
                      setSelectedAnomaly(null);
                      setShowRemediation(false);
                    }}
                    className="cyber-button-primary flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                )}
                {!showRemediation && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedAnomaly.id, 'resolved');
                      setSelectedAnomaly(null);
                    }}
                    className="cyber-button-primary flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => {
                    onUpdateStatus(selectedAnomaly.id, 'dismissed');
                    setSelectedAnomaly(null);
                    setShowRemediation(false);
                  }}
                  className="cyber-button-ghost"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
