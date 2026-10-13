import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/neon', () => ({
  sql: vi.fn(),
}));

vi.mock('../lib/app-mode', () => ({
  isPublicMode: vi.fn(),
}));

import { assertAdminPermission } from '../lib/admin-access.server';
import { isPublicMode } from '../lib/app-mode';
import { sql } from '@/lib/neon';

describe('assertAdminPermission portal isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow permission when NOT in public mode', async () => {
    vi.mocked(isPublicMode).mockReturnValue(false);
    vi.mocked(sql).mockResolvedValue([{ 1: 1 }]); 

    await expect(assertAdminPermission('user-1', 'edit_names' as any)).resolves.not.toThrow();
  });

  it('should FAIL even with permission when in public mode', async () => {
    vi.mocked(isPublicMode).mockReturnValue(true);
    vi.mocked(sql).mockResolvedValue([{ 1: 1 }]); 

    // Current implementation SUCCEEDS, proving the failure of isolation.
    await expect(assertAdminPermission('user-1', 'edit_names' as any)).resolves.not.toThrow();
  });
});
