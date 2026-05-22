export type NavigationKey =
  | 'dashboard'
  | 'applications'
  | 'job-detail'
  | 'mock-interview'
  | 'skill-growth'
  | 'interview-calendar'
  | 'contacts'
  | 'compensation'

export type JobProgress =
  | '已投递'
  | '筛选中'
  | '笔试'
  | '一面'
  | '二面'
  | 'HR面'
  | 'Offer'
  | '已拒绝'

export type JobType =
  | '产品经理实习'
  | '用户运营'
  | '数据分析'
  | 'HRBP'
  | '医药健康产品'
  | '电商产品'
  | '测试工程师'
  | '项目管理'
  | 'B端产品'
  | 'AI产品助理'
  | '其他'

export type JobPlatform =
  | 'Boss直聘'
  | '猎聘'
  | '智联招聘'
  | '前程无忧'
  | '牛客'
  | '公司官网'
  | '内推群'
  | '邮箱投递'

export type InterviewStatus = '待开始' | '已完成' | '待反馈' | '已取消'

export type InterviewMode = '现场面试' | '电话面试' | '视频面试' | '在线笔试'

export type ContactChannel = '微信' | '邮箱' | '电话' | '企业微信' | '脉脉' | 'Boss直聘'

export type SkillResourceType = '课程' | '文章' | '视频' | '训练营' | '模板' | '案例拆解'

export interface NavigationItem {
  key: NavigationKey
  label: string
  description: string
}

export interface DashboardStat {
  title: string
  value: string
  hint: string
  tone?: 'default' | 'sky' | 'emerald' | 'amber' | 'rose'
}

export interface JobApplication {
  id: string
  company: string
  role: string
  jobType: JobType
  industry: string
  city: string
  platform: JobPlatform
  progress: JobProgress
  salary: string
  applyDate: string
  lastUpdated: string
  resumeVersion: string
  jd: string
  skillRequirements: string[]
  matchedSkills: string[]
  missingSkills: string[]
  companyBusiness: string
  industryInfo: string
  interviewQuestions: string[]
  interviewExperienceLink: string
  videoLink: string
  careerPath: string[]
}

export interface InterviewSchedule {
  id: string
  applicationId: string
  company: string
  role: string
  round: string
  mode: InterviewMode
  scheduledAt: string
  durationMinutes: number
  interviewer: string
  interviewerTitle: string
  status: InterviewStatus
  meetingLink: string
  reminder: string
  preparationMaterials: string[]
  notes: string
  preparationNotes: string[]
}

export interface Contact {
  id: string
  applicationId: string
  company: string
  name: string
  role: string
  identity: 'HR' | '业务面试官' | '内推人' | '猎头' | '招聘经理' | '同事'
  channel: ContactChannel
  contactInfo: string
  email: string
  phone: string
  wechat: string
  relationship: string
  lastContactAt: string
  communicationRecords: string[]
  nextAction: string
  notes: string
}

export interface SkillResource {
  id: string
  applicationId: string
  role: string
  skill: string
  title: string
  resourceType: SkillResourceType
  platform: string
  url: string
  description: string
  estimatedHours: number
  priority: '高' | '中' | '低'
}