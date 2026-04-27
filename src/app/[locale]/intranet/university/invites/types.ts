export interface UniversityInvite {
  id: string;
  code: string;
  inviteUrl?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
  status?: 'active' | 'expired' | 'exhausted' | string;
}

export interface CreateInvitePayload {
  expiresAt?: string | null;
  maxUses?: number | null;
}
