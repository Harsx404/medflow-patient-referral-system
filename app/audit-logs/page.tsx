'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuditLogsPanel } from '@/components/dashboard/audit-logs-panel'
import { UserActivityTimeline } from '@/components/dashboard/user-activity-timeline'
import { EnhancedAuditDashboard } from '@/components/dashboard/enhanced-audit-dashboard'
import { HomeButton } from '@/components/ui/home-button'

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail & User Activity</h1>
          <p className="text-muted-foreground">
            Track and monitor all user actions and system changes
          </p>
        </div>
        <HomeButton variant="outline" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Audit Overview</TabsTrigger>
          <TabsTrigger value="timeline">User Timeline</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AuditLogsPanel />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <UserActivityTimeline />
        </TabsContent>

        <TabsContent value="enhanced" className="space-y-6">
          <EnhancedAuditDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
} 