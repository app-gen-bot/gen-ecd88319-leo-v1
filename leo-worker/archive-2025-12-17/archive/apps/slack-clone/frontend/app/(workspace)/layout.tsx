'use client';

import { AuthCheck } from '@/components/auth-check';
import { WorkspaceLayout } from '@/components/workspace/workspace-layout';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </AuthCheck>
  );
}