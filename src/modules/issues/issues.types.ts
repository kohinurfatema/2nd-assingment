export interface CreateIssueBody {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
}

export interface IssueRecord {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReporterInfo {
  id: number;
  name: string;
  role: string;
}

export interface IssueWithReporter extends Omit<IssueRecord, 'reporter_id'> {
  reporter: ReporterInfo;
}

export interface GetIssuesQuery {
  sort?: 'newest' | 'oldest';
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}
