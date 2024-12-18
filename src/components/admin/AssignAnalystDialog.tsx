'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { trpc } from "@/app/_providers/trpc-provider"


interface AssignAnalystDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  milestoneId: string | null
  onSuccess?: () => void
}

export function AssignAnalystDialog({
  isOpen,
  onOpenChange,
  milestoneId,
  onSuccess
}: AssignAnalystDialogProps) {
  const { toast } = useToast()
  const { data: analysts } = trpc.getAllAnalysts.useQuery()

  const { mutate: assignMilestone, isLoading } = trpc.assignMilestoneToAnalyst.useMutation({
    onSuccess: () => {
      toast({ description: "Milestone assigned successfully" })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({ 
        description: error.message || "Failed to assign milestone", 
        variant: "destructive" 
      })
    }
  })

  const handleAssignMilestone = (analystId: string) => {
    if (milestoneId) {
      assignMilestone({
        milestone_id: milestoneId,
        analyst_id: analystId,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Milestone to Analyst</DialogTitle>
          <DialogDescription>
            Select an analyst to assign this milestone
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {analysts?.map((analyst) => (
            <div key={analyst.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">{analyst.name}</p>
                <p className="text-sm text-gray-500">{analyst.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {analyst.pending_milestones} pending milestones
                </span>
                <Button
                  onClick={() => handleAssignMilestone(analyst.id)}
                  size="sm"
                  disabled={isLoading}
                >
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 