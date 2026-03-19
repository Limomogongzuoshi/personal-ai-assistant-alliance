import { LearningProgress, LEARNING_PATHS, getNextMilestone } from './learning-paths'

class LearningStore {
  private progress: Map<string, LearningProgress> = new Map()
  private activityLog: ActivityEntry[] = []

  constructor() {
    this.initializeProgress()
  }

  private initializeProgress() {
    Object.keys(LEARNING_PATHS).forEach((domainId) => {
      this.progress.set(domainId, {
        domainId,
        currentStage: 0,
        completedStages: [],
        completedMilestones: [],
        totalXp: 0,
        weeklyGoal: 100,
        weeklyProgress: 0,
        streak: 0,
        lastActivity: Date.now(),
      })
    })
  }

  getProgress(domainId: string): LearningProgress | null {
    return this.progress.get(domainId) || null
  }

  getAllProgress(): LearningProgress[] {
    return Array.from(this.progress.values())
  }

  getTotalXp(): number {
    let total = 0
    this.progress.forEach((p) => {
      total += p.totalXp
    })
    return total
  }

  completeMilestone(domainId: string, milestoneId: string): boolean {
    const progress = this.progress.get(domainId)
    if (!progress) return false

    const path = LEARNING_PATHS[domainId]
    if (!path) return false

    if (progress.completedMilestones.includes(milestoneId)) {
      return false
    }

    const xp = path.stages
      .flatMap((s) => s.milestones)
      .find((m) => m.id === milestoneId)?.xp || 0

    progress.completedMilestones.push(milestoneId)
    progress.totalXp += xp
    progress.weeklyProgress += xp
    progress.lastActivity = Date.now()

    this.addActivity({
      id: `activity-${Date.now()}`,
      domainId,
      type: 'milestone',
      description: `完成了里程碑: ${milestoneId}`,
      xp,
      timestamp: Date.now(),
    })

    const next = getNextMilestone(progress, path)
    if (next) {
      const currentStageIndex = progress.currentStage
      const currentStage = path.stages[currentStageIndex]
      if (currentStage && currentStage.milestones.every((m) => progress.completedMilestones.includes(m.id))) {
        if (!progress.completedStages.includes(currentStageIndex)) {
          progress.completedStages.push(currentStageIndex)
          if (currentStageIndex + 1 < path.stages.length) {
            progress.currentStage = currentStageIndex + 1
          }
        }
      }
    }

    return true
  }

  setWeeklyGoal(domainId: string, goal: number): void {
    const progress = this.progress.get(domainId)
    if (progress) {
      progress.weeklyGoal = goal
    }
  }

  updateStreak(): void {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    this.progress.forEach((p) => {
      const daysSinceActivity = (now - p.lastActivity) / oneDay
      if (daysSinceActivity < 2) {
        if (daysSinceActivity >= 1) {
          p.streak += 1
        }
      } else {
        p.streak = 0
      }
    })
  }

  getActivityLog(domainId?: string): ActivityEntry[] {
    if (domainId) {
      return this.activityLog.filter((a) => a.domainId === domainId)
    }
    return this.activityLog
  }

  private addActivity(entry: ActivityEntry): void {
    this.activityLog.unshift(entry)
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(0, 100)
    }
  }

  getLeaderboard(): { domainId: string; totalXp: number }[] {
    return Object.keys(LEARNING_PATHS).map((domainId) => ({
      domainId,
      totalXp: this.progress.get(domainId)?.totalXp || 0,
    })).sort((a, b) => b.totalXp - a.totalXp)
  }
}

export interface ActivityEntry {
  id: string
  domainId: string
  type: 'milestone' | 'stage' | 'resource' | 'discussion'
  description: string
  xp: number
  timestamp: number
}

export const learningStore = new LearningStore()