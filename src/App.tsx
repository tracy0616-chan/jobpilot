import { useEffect, useMemo, useState } from 'react'
import { Layout } from './components/Layout'
import { StatCard } from './components/StatCard'
import {
  mockContacts,
  mockInterviewSchedules,
  mockJobApplications,
  mockNavigationItems,
  mockPageSummaries,
  mockSkillResources,
} from './data/mockData'
import type {
  Contact,
  DashboardStat,
  InterviewSchedule,
  JobApplication,
  JobProgress,
  JobType,
  NavigationKey,
} from './types'

const STORAGE_KEY = 'jobpilot-applications'

type SortKey = 'matchScore' | 'lastUpdated' | 'applyDate'
type MockInterviewType = 'HR面' | '业务面' | '专业面' | '压力面'

interface ApplicationFilters {
  keyword: string
  industry: string
  jobType: string
  city: string
  progress: string
  sortBy: SortKey
}

interface NewApplicationForm {
  company: string
  role: string
  jobType: JobType
  industry: string
  city: string
  platform: JobApplication['platform']
  progress: JobProgress
  salary: string
}

interface MockInterviewFeedback {
  structureScore: number
  keywordCoverage: number
  keywordHits: string[]
  logicAdvice: string
  starAdvice: string
  improvements: string[]
  answerFramework: string
}

interface NewInterviewForm {
  company: string
  role: string
  round: string
  mode: InterviewSchedule['mode']
  scheduledAt: string
  interviewer: string
  interviewerTitle: string
  meetingLink: string
}

interface NewContactForm {
  company: string
  name: string
  role: string
  identity: 'HR' | '业务面试官' | '内推人' | '猎头' | '招聘经理' | '同事'
  email: string
  phone: string
  wechat: string
  nextAction: string
}

const defaultNewApplicationForm: NewApplicationForm = {
  company: '',
  role: '',
  jobType: '其他',
  industry: '',
  city: '',
  platform: 'Boss直聘',
  progress: '已投递',
  salary: '',
}

const defaultFilters: ApplicationFilters = {
  keyword: '',
  industry: '全部',
  jobType: '全部',
  city: '全部',
  progress: '全部',
  sortBy: 'lastUpdated',
}

const defaultInterviewForm: NewInterviewForm = {
  company: '',
  role: '',
  round: '一面',
  mode: '视频面试',
  scheduledAt: '2026-05-25T10:00',
  interviewer: '',
  interviewerTitle: '',
  meetingLink: '',
}

const defaultContactForm: NewContactForm = {
  company: '',
  name: '',
  role: '',
  identity: 'HR',
  email: '',
  phone: '',
  wechat: '',
  nextAction: '',
}

const INTERVIEW_STORAGE_KEY = 'jobpilot-interviews'
const CONTACT_STORAGE_KEY = 'jobpilot-contacts'

const interviewStageSet = new Set<JobProgress>(['笔试', '一面', '二面', 'HR面'])

const progressOrder: JobProgress[] = ['已投递', '筛选中', '笔试', '一面', '二面', 'HR面', 'Offer', '已拒绝']
const interviewTypes: MockInterviewType[] = ['HR面', '业务面', '专业面', '压力面']
const defaultSkillResources = [
  {
    skill: 'SQL',
    title: 'SQL 学习组合包',
    platform: '菜鸟教程 / LeetCode / B站',
    url: 'https://www.runoob.com/sql/sql-tutorial.html',
    description: '先过 SQL 基础语法，再做常见查询题和窗口函数练习。',
  },
  {
    skill: 'Excel',
    title: 'Excel 高效分析路径',
    platform: 'Excel Campus',
    url: 'https://www.excelcampus.com',
    description: '重点练习数据透视表、VLOOKUP、Power Query 和图表表达。',
  },
  {
    skill: 'Figma',
    title: 'Figma 官方与原型设计教程',
    platform: 'Figma / B站',
    url: 'https://help.figma.com',
    description: '适合补齐页面结构、组件规范和高保真原型表达能力。',
  },
  {
    skill: 'Axure',
    title: 'Axure RP 入门教程',
    platform: 'Axure 官方',
    url: 'https://www.axure.com/support',
    description: '适合补齐中后台原型设计与交互流程表达。',
  },
  {
    skill: '数据分析',
    title: '统计学基础与 A/B 测试路径',
    platform: 'Coursera / B站',
    url: 'https://www.coursera.org',
    description: '先理解指标体系，再补统计学、实验设计与结果解释。',
  },
  {
    skill: 'PRD',
    title: '产品需求文档写作与流程图训练',
    platform: '知乎专栏',
    url: 'https://www.zhihu.com',
    description: '建议同步练习功能结构、流程图和验收标准表达。',
  },
  {
    skill: '用户调研',
    title: '用户访谈与问卷设计指南',
    platform: '人人都是产品经理',
    url: 'https://www.woshipm.com',
    description: '重点补齐访谈提纲、问题设计和用户画像沉淀方法。',
  },
  {
    skill: '竞品分析',
    title: '竞品拆解与商业模式分析资料',
    platform: '人人都是产品经理',
    url: 'https://www.woshipm.com',
    description: '适合练习功能对比、增长策略拆解和商业模式分析。',
  },
]

function getStoredApplications() {
  if (typeof window === 'undefined') {
    return mockJobApplications
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return mockJobApplications
  }

  try {
    const parsed = JSON.parse(raw) as JobApplication[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockJobApplications
  } catch {
    return mockJobApplications
  }
}

function getStoredInterviews() {
  if (typeof window === 'undefined') {
    return mockInterviewSchedules
  }

  const raw = window.localStorage.getItem(INTERVIEW_STORAGE_KEY)

  if (!raw) {
    return mockInterviewSchedules
  }

  try {
    const parsed = JSON.parse(raw) as InterviewSchedule[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockInterviewSchedules
  } catch {
    return mockInterviewSchedules
  }
}

function getStoredContacts() {
  if (typeof window === 'undefined') {
    return mockContacts
  }

  const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY)

  if (!raw) {
    return mockContacts
  }

  try {
    const parsed = JSON.parse(raw) as Contact[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockContacts
  } catch {
    return mockContacts
  }
}

function calculateMatchScore(requiredSkills: string[], matchedSkills: string[]) {
  if (!requiredSkills.length) {
    return 0
  }

  return Math.round((matchedSkills.length / requiredSkills.length) * 100)
}

function getMatchLabel(score: number) {
  if (score >= 80) return '高度匹配'
  if (score >= 60) return '较匹配'
  if (score >= 40) return '一般匹配'
  return '匹配较低'
}

function getProgressBadge(progress: JobProgress) {
  switch (progress) {
    case 'Offer':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case '已拒绝':
      return 'bg-rose-50 text-rose-700 border border-rose-100'
    case 'HR面':
    case '二面':
    case '一面':
      return 'bg-sky-50 text-sky-700 border border-sky-100'
    case '笔试':
      return 'bg-violet-50 text-violet-700 border border-violet-100'
    case '筛选中':
      return 'bg-amber-50 text-amber-700 border border-amber-100'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

function getMatchBadge(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (score >= 60) return 'bg-sky-50 text-sky-700 border border-sky-100'
  if (score >= 40) return 'bg-amber-50 text-amber-700 border border-amber-100'
  return 'bg-rose-50 text-rose-700 border border-rose-100'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(date))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getFunnelData(applications: JobApplication[]) {
  return progressOrder.map((stage) => ({
    stage,
    count: applications.filter((application) => application.progress === stage).length,
  }))
}

function getDistribution(items: string[]) {
  const total = items.length || 1

  return Object.entries(
    items.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item] = (accumulator[item] ?? 0) + 1
      return accumulator
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
    }))
}

function getDashboardStats(applications: JobApplication[]): DashboardStat[] {
  const totalCount = applications.length
  const thisWeekThreshold = new Date('2026-05-14T00:00:00+08:00')
  const weeklyAdded = applications.filter((application) => new Date(application.applyDate) >= thisWeekThreshold).length
  const interviewingCount = applications.filter((application) => interviewStageSet.has(application.progress)).length
  const offerCount = applications.filter((application) => application.progress === 'Offer').length
  const rejectedCount = applications.filter((application) => application.progress === '已拒绝').length
  const averageMatchScore = totalCount
    ? Math.round(
        applications.reduce(
          (sum, application) =>
            sum + calculateMatchScore(application.skillRequirements, application.matchedSkills),
          0,
        ) / totalCount,
      )
    : 0

  return [
    {
      title: '总投递数量',
      value: String(totalCount),
      hint: '当前工作台中已沉淀的全部岗位投递记录',
    },
    {
      title: '本周新增投递',
      value: String(weeklyAdded),
      hint: '近 7 天内新增录入或导入的岗位数量',
    },
    {
      title: '面试中岗位',
      value: String(interviewingCount),
      hint: '包含笔试、一面、二面与 HR 面阶段',
    },
    {
      title: 'Offer 数量',
      value: String(offerCount),
      hint: '已经进入 offer 沟通或确认的岗位数量',
    },
    {
      title: '已拒绝数量',
      value: String(rejectedCount),
      hint: '便于复盘投递效果和后续改进方向',
    },
    {
      title: '平均岗位匹配度',
      value: `${averageMatchScore}%`,
      hint: `${getMatchLabel(averageMatchScore)}，可据此优先推进更高匹配岗位`,
    },
  ]
}

function buildTodoItems(applications: JobApplication[], interviews: InterviewSchedule[]) {
  const todos: Array<{ id: string; title: string; description: string; tone: string }> = []

  const nearestInterview = interviews
    .filter((interview) => interview.status === '待开始')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

  if (nearestInterview) {
    todos.push({
      id: `todo-interview-${nearestInterview.id}`,
      title: `准备 ${nearestInterview.company} ${nearestInterview.round}`,
      description: `${formatDateTime(nearestInterview.scheduledAt)} · ${nearestInterview.preparationNotes[0]}`,
      tone: 'bg-sky-50 text-sky-700 border-sky-100',
    })
  }

  const lowMatchItem = applications
    .map((application) => ({
      application,
      score: calculateMatchScore(application.skillRequirements, application.matchedSkills),
    }))
    .filter((item) => item.score < 60)
    .sort((a, b) => a.score - b.score)[0]

  if (lowMatchItem) {
    todos.push({
      id: `todo-skill-${lowMatchItem.application.id}`,
      title: `补强 ${lowMatchItem.application.role} 关键技能`,
      description: `优先补齐：${lowMatchItem.application.missingSkills.slice(0, 2).join('、')}`,
      tone: 'bg-amber-50 text-amber-700 border-amber-100',
    })
  }

  const waitingFeedback = applications.find((application) => application.progress === 'HR面')

  if (waitingFeedback) {
    todos.push({
      id: `todo-followup-${waitingFeedback.id}`,
      title: `跟进 ${waitingFeedback.company} 反馈进度`,
      description: `当前状态为 ${waitingFeedback.progress}，建议准备礼貌跟进话术`,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    })
  }

  return todos
}

function getInterviewQuestions(application: JobApplication, interviewType: MockInterviewType) {
  const skillQuestions = application.skillRequirements.slice(0, 2).map((skill) => {
    if (interviewType === '专业面') {
      return `请结合 ${application.role} 的实际场景，说明你如何应用 ${skill} 解决问题？`
    }

    if (interviewType === '业务面') {
      return `如果你负责这个岗位相关业务，你会如何围绕 ${skill} 推动业务目标达成？`
    }

    if (interviewType === '压力面') {
      return `当团队质疑你在 ${skill} 上的经验不足时，你会如何回应并证明自己？`
    }

    return `你为什么认为 ${skill} 对 ${application.role} 很重要？你目前具备到什么程度？`
  })

  const typeSpecificQuestions: Record<MockInterviewType, string[]> = {
    HR面: [
      `你为什么想加入 ${application.company} 并投递 ${application.role}？`,
      '你怎么看待这份工作的稳定性和长期发展空间？',
      '如果同时拿到其他 offer，你会基于哪些因素做选择？',
    ],
    业务面: [
      `请拆解一下 ${application.company} 当前业务在 ${application.industry} 中的核心挑战。`,
      `如果让你负责一个与 ${application.role} 相关的新项目，你会如何拆解问题并推进落地？`,
      '请分享一个你做过的与业务增长或效率优化相关的案例。',
    ],
    专业面: [
      `请围绕 ${application.role} 的核心方法论，讲一个你最有把握的专业案例。`,
      `如果岗位要求你快速上手 ${application.missingSkills[0] ?? application.skillRequirements[0]}，你会如何补齐？`,
      '你会如何衡量一个专业方案是否真正有效？',
    ],
    压力面: [
      '如果面试官连续质疑你的项目价值，你会如何稳定表达并继续推进回答？',
      '当你负责的方案被业务方否定时，你会如何处理情绪并重新组织方案？',
      '如果短时间内需要同时推进多个高优先级任务，你会如何取舍？',
    ],
  }

  return [...application.interviewQuestions.slice(0, 2), ...skillQuestions, ...typeSpecificQuestions[interviewType]].slice(
    0,
    5,
  )
}

function generateMockInterviewFeedback(
  answer: string,
  application: JobApplication,
  interviewType: MockInterviewType,
): MockInterviewFeedback {
  const normalizedAnswer = answer.trim()
  const answerLength = normalizedAnswer.length
  const structureKeywords = ['背景', '目标', '行动', '结果']
  const structureHits = structureKeywords.filter((keyword) => normalizedAnswer.includes(keyword)).length
  const structureScore = Math.min(100, 40 + structureHits * 15 + (answerLength >= 120 ? 10 : 0))

  const keywordHits = application.skillRequirements.filter((skill) =>
    normalizedAnswer.toLowerCase().includes(skill.toLowerCase()),
  )
  const keywordCoverage = application.skillRequirements.length
    ? Math.round((keywordHits.length / application.skillRequirements.length) * 100)
    : 0

  const hasQuantifiedWords = ['数字', '结果', '提升', '降低', '增长', '%', '倍', '万', '千'].some((keyword) =>
    normalizedAnswer.includes(keyword),
  )

  const improvements: string[] = []

  if (answerLength < 80) {
    improvements.push('回答篇幅偏短，建议补充背景、行动细节和最终结果。')
  }

  if (!hasQuantifiedWords) {
    improvements.push('建议加入量化结果，例如提升、降低、增长等具体数字，增强说服力。')
  }

  if (application.missingSkills.length > 3) {
    improvements.push('当前岗位缺失技能较多，建议在回答中主动强调补齐核心技能的学习路径。')
  }

  if (application.missingSkills.some((skill) => ['SQL', '数据分析', 'A/B测试', 'AB实验分析'].includes(skill))) {
    improvements.push('建议补充数据分析相关表达，突出你对指标、实验和结果复盘的理解。')
  }

  if (application.missingSkills.some((skill) => ['PRD', 'PRD 撰写', '竞品分析', '用户调研'].includes(skill))) {
    improvements.push('建议补充产品基本功案例，例如需求分析、PRD、竞品拆解或用户调研方法。')
  }

  if (interviewType === 'HR面') {
    improvements.push('HR 面建议更明确表达求职动机、稳定性、岗位理解和加入原因。')
  }

  if (interviewType === '业务面') {
    improvements.push('业务面建议更强调业务目标、问题拆解过程和跨团队推进细节。')
  }

  if (interviewType === '专业面') {
    improvements.push('专业面建议突出方法论、技能掌握程度以及可复用案例。')
  }

  if (interviewType === '压力面') {
    improvements.push('压力面建议控制情绪表达，先确认问题，再稳定输出逻辑与行动方案。')
  }

  const logicAdvice =
    structureHits >= 3
      ? '你的回答结构比较完整，已经具备较清晰的叙事顺序，可以继续压缩赘述并突出结果。'
      : '建议按“背景-目标-行动-结果”组织答案，先讲问题场景，再讲你的判断与动作。'

  const starAdvice =
    structureHits === 4
      ? '已经较好地覆盖了 STAR/STARL 结构，可以再补充复盘或学习点，让答案更成熟。'
      : '建议显式补足 STAR 法则中的缺失部分，尤其是行动细节和结果复盘。'

  const answerFramework =
    interviewType === 'HR面'
      ? '推荐框架：求职动机 -> 岗位理解 -> 过往匹配经历 -> 稳定性与未来规划。'
      : interviewType === '业务面'
        ? '推荐框架：业务背景 -> 问题拆解 -> 关键策略 -> 推进过程 -> 结果与复盘。'
        : interviewType === '专业面'
          ? '推荐框架：场景说明 -> 方法论选择 -> 工具/技能应用 -> 案例结果 -> 能力迁移。'
          : '推荐框架：先稳住情绪 -> 澄清问题 -> 给出判断逻辑 -> 提供行动方案 -> 总结反思。'

  return {
    structureScore,
    keywordCoverage,
    keywordHits,
    logicAdvice,
    starAdvice,
    improvements,
    answerFramework,
  }
}

function buildSkillInsights(applications: JobApplication[]) {
  const requiredSkills = applications.flatMap((application) => application.skillRequirements)
  const matchedSkills = Array.from(new Set(applications.flatMap((application) => application.matchedSkills))).sort()
  const missingSkills = Array.from(new Set(applications.flatMap((application) => application.missingSkills))).sort()

  const skillFrequency = Object.entries(
    requiredSkills.reduce<Record<string, number>>((accumulator, skill) => {
      accumulator[skill] = (accumulator[skill] ?? 0) + 1
      return accumulator
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .map(([skill, count]) => ({ skill, count }))

  const resourceMap = new Map<string, Array<{ title: string; platform: string; url: string; description: string }>>()

  ;[...mockSkillResources, ...defaultSkillResources].forEach((resource) => {
    const normalized = resourceMap.get(resource.skill) ?? []
    normalized.push({
      title: resource.title,
      platform: resource.platform,
      url: resource.url,
      description: resource.description,
    })
    resourceMap.set(resource.skill, normalized)
  })

  return {
    skillFrequency,
    matchedSkills,
    missingSkills,
    resourceMap,
  }
}

function estimateAnnualSalary(salary: string) {
  const normalized = String(salary ?? '').toLowerCase()

  if (!normalized) return '待估算'

  if (normalized.includes('元/天')) {
    const matches = salary.match(/(\d+)-(\d+)/)
    if (!matches) return '待估算'
    const low = Number(matches[1]) * 22 * 12
    const high = Number(matches[2]) * 22 * 12
    return `${Math.round(low / 1000)}k-${Math.round(high / 1000)}k / 年`
  }

  const matches = normalized.match(/(\d+)-(\d+)k/)
  if (!matches) return '待估算'

  const low = Number(matches[1])
  const high = Number(matches[2])
  const multiplier = normalized.includes('产品') || normalized.includes('经理') ? 14 : 12

  return `${low * multiplier}k-${high * multiplier}k / 年`
}

function getRoleLevel(role: string) {
  const normalized = String(role ?? '')
  if (normalized.includes('实习') || normalized.includes('助理') || normalized.includes('专员')) return '初阶 / Entry'
  if (normalized.includes('经理')) return '中阶 / Mid'
  if (normalized.includes('高级') || normalized.includes('负责人')) return '高阶 / Senior'
  return '成长中 / Growth'
}

function getCareerAdvice(jobType: string) {
  const adviceMap: Record<
    string,
    { path: string[]; oneYear: string; threeYear: string; fiveYear: string; growthDirections: string[] }
  > = {
    产品经理实习: {
      path: ['产品助理', '产品经理', '高级产品经理', '产品专家', '产品负责人'],
      oneYear: '补齐 PRD、竞品分析、用户调研和数据分析基础，形成完整产品作品案例。',
      threeYear: '承担独立业务模块，强化跨团队推进、指标拆解和产品策略能力。',
      fiveYear: '走向产品负责人或产品专家方向，负责更完整的业务线或核心平台能力。',
      growthDirections: ['用户增长产品', '中后台产品', '商业化产品', 'AI 产品'],
    },
    用户运营: {
      path: ['运营助理', '用户运营', '高级运营', '运营专家', '运营负责人'],
      oneYear: '补齐活动复盘、用户分层和留存分析方法，建立一套增长案例库。',
      threeYear: '负责完整用户生命周期运营，强化策略设计和跨部门协作能力。',
      fiveYear: '向增长负责人、社区运营负责人或业务运营负责人发展。',
      growthDirections: ['增长运营', '社区运营', '内容运营', '商业化运营'],
    },
    HRBP: {
      path: ['招聘专员', 'HRBP', '高级 HRBP', '组织发展', 'HR 负责人'],
      oneYear: '提升业务理解、组织诊断和人才盘点的表达能力。',
      threeYear: '从单点招聘协同走向业务组织支持和组织发展项目。',
      fiveYear: '向 OD、COE 或人力负责人方向升级，承担组织层面问题解决。',
      growthDirections: ['组织发展', '人才发展', '招聘管理', '人力资源负责人'],
    },
    测试工程师: {
      path: ['测试工程师', '高级测试工程师', '测试开发', '测试负责人'],
      oneYear: '补齐自动化测试和质量平台基础，建立稳定的回归测试能力。',
      threeYear: '从执行测试转向测试开发与质量工程建设。',
      fiveYear: '向质量负责人或稳定性平台负责人发展。',
      growthDirections: ['测试开发', '质量平台', '自动化建设', '稳定性工程'],
    },
    项目管理: {
      path: ['项目助理', '项目经理', '高级项目经理', '项目负责人'],
      oneYear: '强化项目排期、风险识别与汇报表达。',
      threeYear: '承担更复杂项目集管理，提升跨团队协调与资源统筹能力。',
      fiveYear: '向 PMO 或项目群负责人发展。',
      growthDirections: ['PMO', '交付管理', '研发项目管理', '组织协同管理'],
    },
  }

  return (
    adviceMap[jobType] ?? {
      path: ['岗位成长路径待补充'],
      oneYear: '建议先围绕目标岗位补齐核心技能与项目案例。',
      threeYear: '建议逐步承担更大范围的业务或项目责任。',
      fiveYear: '建议结合个人优势选择管理线或专家线发展。',
      growthDirections: ['专家方向', '管理方向'],
    }
  )
}

function MockInterviewSection({ applications }: { applications: JobApplication[] }) {
  const [selectedJobId, setSelectedJobId] = useState(applications[0]?.id ?? '')
  const [interviewType, setInterviewType] = useState<MockInterviewType>('HR面')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, MockInterviewFeedback>>({})

  const selectedApplication =
    applications.find((application) => application.id === selectedJobId) ?? applications[0]

  const questions = selectedApplication ? getInterviewQuestions(selectedApplication, interviewType) : []

  const handleGenerateFeedback = (question: string) => {
    if (!selectedApplication) return
    const answer = answers[question] ?? ''
    setFeedback((previous) => ({
      ...previous,
      [question]: generateMockInterviewFeedback(answer, selectedApplication, interviewType),
    }))
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.82fr_1.15fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Interview Setup</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">模拟面试配置</h3>
          <div className="mt-5 space-y-4">
            <SelectField
              label="选择岗位"
              value={selectedJobId}
              options={applications.map((application) => ({
                label: `${application.company} · ${application.role}`,
                value: application.id,
              }))}
              onChange={setSelectedJobId}
            />
            <SelectField
              label="面试类型"
              value={interviewType}
              options={interviewTypes}
              onChange={(value) => setInterviewType(value as MockInterviewType)}
            />
          </div>
        </div>

        {selectedApplication ? (
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Position Snapshot</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">{selectedApplication.role}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {selectedApplication.company} · {selectedApplication.industry}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedApplication.skillRequirements.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Use Guide</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <p>1. 先选择一个真实投递岗位，系统会结合岗位信息生成更贴合的提问。</p>
            <p>2. 选择面试类型后，问题会偏向 HR、业务、专业或压力面视角。</p>
            <p>3. 回答尽量包含背景、目标、行动、结果，并加入量化结果。</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => {
          const answer = answers[question] ?? ''
          const result = feedback[question]

          return (
            <div key={question} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Question {index + 1}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{question}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateFeedback(question)}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  生成反馈
                </button>
              </div>

              <textarea
                value={answer}
                onChange={(event) =>
                  setAnswers((previous) => ({
                    ...previous,
                    [question]: event.target.value,
                  }))
                }
                placeholder="在这里输入你的回答，尽量包含背景、目标、行动、结果。"
                className="mt-5 min-h-[140px] w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
              />

              {result ? (
                <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">回答结构评分</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">{result.structureScore}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">关键词覆盖度</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">{result.keywordCoverage}%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900">命中关键词</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywordHits.length ? (
                          result.keywordHits.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">当前回答还没有覆盖岗位技能关键词。</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5">
                    <FeedbackTextCard title="逻辑表达建议" content={result.logicAdvice} />
                    <FeedbackTextCard title="STAR 法则建议" content={result.starAdvice} />
                    <FeedbackTextCard title="推荐回答框架" content={result.answerFramework} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">可以改进的地方</p>
                      <div className="mt-3 space-y-2">
                        {result.improvements.map((improvement) => (
                          <div
                            key={improvement}
                            className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800"
                          >
                            {improvement}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SkillGrowthSection({ applications }: { applications: JobApplication[] }) {
  const insights = useMemo(() => buildSkillInsights(applications), [applications])

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Skill Ranking</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">高频技能排行榜</h3>
          <div className="mt-6 space-y-4">
            {insights.skillFrequency.slice(0, 8).map((item, index) => (
              <div key={item.skill}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    #{index + 1} {item.skill}
                  </span>
                  <span className="text-slate-500">{item.count} 次出现</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${Math.min(100, item.count * 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Owned Skills</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">已掌握技能</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {insights.matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Missing Skills</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">待补齐技能</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {insights.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {insights.missingSkills.map((skill) => {
          const resources = insights.resourceMap.get(skill) ?? defaultSkillResources.filter((resource) => resource.skill === skill)

          return (
            <div key={skill} className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Learning Path</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{skill}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                建议路径：先理解基础概念，再通过案例或练习做迁移，最后结合目标岗位做表达训练。
              </p>

              <div className="mt-5 space-y-3">
                {resources.length ? (
                  resources.map((resource) => (
                    <a
                      key={`${skill}-${resource.title}`}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100/80"
                    >
                      <p className="text-sm font-semibold text-slate-900">{resource.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {resource.platform}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{resource.description}</p>
                    </a>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    暂无专属资源，建议先从通用教程和岗位面经中补齐该技能。
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function InterviewCalendarSection({
  interviews,
  onAddInterview,
  onDeleteInterview,
}: {
  interviews: InterviewSchedule[]
  onAddInterview: (payload: NewInterviewForm) => void
  onDeleteInterview: (id: string) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState<NewInterviewForm>(defaultInterviewForm)

  const sortedInterviews = [...interviews].sort(
    (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime(),
  )

  const submit = () => {
    if (!form.company.trim() || !form.role.trim() || !form.interviewer.trim()) return
    onAddInterview(form)
    setForm(defaultInterviewForm)
    setShowCreateForm(false)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Interview Schedule</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">面试日历</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((previous) => !previous)}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            新增面试日程
          </button>
        </div>

        {showCreateForm ? (
          <div className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2 xl:grid-cols-4">
            <TextField label="公司" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
            <TextField label="岗位" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
            <TextField label="轮次" value={form.round} onChange={(value) => setForm({ ...form, round: value })} />
            <SelectField
              label="面试形式"
              value={form.mode}
              options={['现场面试', '电话面试', '视频面试', '在线笔试']}
              onChange={(value) => setForm({ ...form, mode: value as InterviewSchedule['mode'] })}
            />
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">面试时间</span>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
              />
            </label>
            <TextField label="面试官" value={form.interviewer} onChange={(value) => setForm({ ...form, interviewer: value })} />
            <TextField
              label="面试官信息"
              value={form.interviewerTitle}
              onChange={(value) => setForm({ ...form, interviewerTitle: value })}
            />
            <TextField label="会议链接" value={form.meetingLink} onChange={(value) => setForm({ ...form, meetingLink: value })} />
            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
              <button
                type="button"
                onClick={submit}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                保存日程
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setForm(defaultInterviewForm)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {sortedInterviews.map((interview) => {
          const daysDiff =
            (new Date(interview.scheduledAt).getTime() - new Date('2026-05-21T00:00:00+08:00').getTime()) /
            (1000 * 60 * 60 * 24)
          const isUpcoming = daysDiff >= 0 && daysDiff <= 3

          return (
            <div
              key={interview.id}
              className={`rounded-[28px] border bg-white p-6 shadow-sm ${
                isUpcoming ? 'border-sky-200 bg-sky-50/40' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {formatDateTime(interview.scheduledAt)}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    {interview.company} · {interview.role}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {interview.round} · {interview.mode} · {interview.interviewer} / {interview.interviewerTitle}
                  </p>
                </div>
                <div className="flex gap-3">
                  {interview.meetingLink ? (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      打开会议链接
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDeleteInterview(interview.id)}
                    className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InfoCard title="提醒事项" content={interview.reminder} />
                <ListCard title="准备材料" items={interview.preparationMaterials} />
                <InfoCard title="备注" content={interview.notes} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ContactsSection({
  contacts,
  onAddContact,
  onDeleteContact,
}: {
  contacts: Contact[]
  onAddContact: (payload: NewContactForm) => void
  onDeleteContact: (id: string) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState<NewContactForm>(defaultContactForm)

  const filteredContacts = contacts.filter((contact: Contact) => {
    const target = `${contact.company} ${contact.role} ${contact.name}`.toLowerCase()
    return keyword.trim() ? target.includes(keyword.trim().toLowerCase()) : true
  })

  const submit = () => {
    if (!form.company.trim() || !form.name.trim() || !form.role.trim()) return
    onAddContact(form)
    setForm(defaultContactForm)
    setShowCreateForm(false)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <label className="block flex-1">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">搜索联系人</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索公司、岗位、联系人姓名"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowCreateForm((previous) => !previous)}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            新增联系人
          </button>
        </div>

        {showCreateForm ? (
          <div className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2 xl:grid-cols-4">
            <TextField label="公司" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
            <TextField label="联系人姓名" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <TextField label="岗位" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
            <SelectField
              label="身份"
              value={form.identity}
              options={['HR', '业务面试官', '内推人', '猎头', '招聘经理', '同事']}
              onChange={(value) => setForm({ ...form, identity: value as NewContactForm['identity'] })}
            />
            <TextField label="邮箱" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <TextField label="电话" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <TextField label="微信" value={form.wechat} onChange={(value) => setForm({ ...form, wechat: value })} />
            <TextField
              label="下一步动作"
              value={form.nextAction}
              onChange={(value) => setForm({ ...form, nextAction: value })}
            />
            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
              <button
                type="button"
                onClick={submit}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                保存联系人
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setForm(defaultContactForm)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredContacts.map((contact: Contact) => (
          <div key={contact.id} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{contact.company}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{contact.name}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {contact.identity} · {contact.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteContact(contact.id)}
                className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                删除
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard title="邮箱" content={contact.email || '待补充'} />
              <InfoCard title="电话" content={contact.phone || '待补充'} />
              <InfoCard title="微信" content={contact.wechat || '待补充'} />
              <InfoCard title="最近联系时间" content={contact.lastContactAt} />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ListCard title="沟通记录" items={contact.communicationRecords} />
              <InfoCard title="下一步动作" content={contact.nextAction} />
            </div>
            <div className="mt-5">
              <a
                href={`mailto:${contact.email}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                发邮件联系
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CompensationSection({
  applications,
  filters,
  onFilterChange,
}: {
  applications: JobApplication[]
  filters: ApplicationFilters
  onFilterChange: (next: ApplicationFilters) => void
}) {
  const industries = ['全部', ...new Set(applications.map((application) => application.industry))]
  const jobTypes = ['全部', ...new Set(applications.map((application) => application.jobType))]
  const cities = ['全部', ...new Set(applications.map((application) => application.city))]

  const filteredApplications = applications
    .filter((application) => {
      const matchIndustry = filters.industry === '全部' || application.industry === filters.industry
      const matchJobType = filters.jobType === '全部' || application.jobType === filters.jobType
      const matchCity = filters.city === '全部' || application.city === filters.city
      return matchIndustry && matchJobType && matchCity
    })
    .sort((left, right) => estimateAnnualSalary(right.salary).localeCompare(estimateAnnualSalary(left.salary)))

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            label="城市"
            value={filters.city}
            options={cities}
            onChange={(value) => onFilterChange({ ...filters, city: value })}
          />
          <SelectField
            label="岗位类型"
            value={filters.jobType}
            options={jobTypes}
            onChange={(value) => onFilterChange({ ...filters, jobType: value })}
          />
          <SelectField
            label="行业"
            value={filters.industry}
            options={industries}
            onChange={(value) => onFilterChange({ ...filters, industry: value })}
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                {['公司', '岗位', '城市', '行业', '薪资范围', '年薪估算', '岗位级别', '补齐能力'].map((label) => (
                  <th key={label} className="border-b border-slate-200 px-4 py-4 font-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id} className="align-top text-sm text-slate-700">
                  <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-900">{application.company}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{application.role}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{application.city}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{application.industry}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{application.salary}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{estimateAnnualSalary(application.salary)}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{getRoleLevel(application.role)}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{application.missingSkills.join('、')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredApplications.map((application) => {
          const advice = getCareerAdvice(application.jobType)
          return (
            <div key={application.id} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{application.company}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">{application.role}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {advice.path.map((step) => (
                  <span key={step} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                    {step}
                  </span>
                ))}
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                <p><span className="font-semibold text-slate-900">1 年建议：</span>{advice.oneYear}</p>
                <p><span className="font-semibold text-slate-900">3 年建议：</span>{advice.threeYear}</p>
                <p><span className="font-semibold text-slate-900">5 年建议：</span>{advice.fiveYear}</p>
                <p><span className="font-semibold text-slate-900">晋升方向：</span>{advice.growthDirections.join('、')}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DashboardSection({
  applications,
  interviews,
  onViewApplication,
}: {
  applications: JobApplication[]
  interviews: InterviewSchedule[]
  onViewApplication: (id: string) => void
}) {
  const stats = useMemo(() => getDashboardStats(applications), [applications])
  const funnelData = useMemo(() => getFunnelData(applications), [applications])
  const industryDistribution = useMemo(
    () => getDistribution(applications.map((application) => application.industry)),
    [applications],
  )
  const jobTypeDistribution = useMemo(
    () => getDistribution(applications.map((application) => application.jobType)),
    [applications],
  )
  const recentInterviews = useMemo(
    () =>
      interviews
        .filter((interview) => interview.status === '待开始')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 4),
    [interviews],
  )
  const todoItems = useMemo(() => buildTodoItems(applications, interviews), [applications, interviews])

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Stage Funnel
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                投递阶段漏斗
              </h3>
            </div>
            <p className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
              从投递到 Offer 的进度分布
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {funnelData.map((item) => {
              const percent = applications.length ? Math.max(8, Math.round((item.count / applications.length) * 100)) : 0
              return (
                <div key={item.stage}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.stage}</span>
                    <span className="text-slate-500">{item.count} 个岗位</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Next Actions
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">待办事项 / 下一步提醒</h3>
          <div className="mt-6 space-y-3">
            {todoItems.map((todo) => (
              <div key={todo.id} className={`rounded-2xl border px-4 py-4 ${todo.tone}`}>
                <p className="text-sm font-semibold">{todo.title}</p>
                <p className="mt-2 text-sm leading-6 opacity-90">{todo.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Industry Mix</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">行业分布</h3>
          <div className="mt-5 space-y-4">
            {industryDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">
                    {item.count} / {item.percent}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Role Mix</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">岗位类型分布</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {jobTypeDistribution.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.count} 个岗位 · {item.percent}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Recent Interviews</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">最近面试日程</h3>
          <div className="mt-5 space-y-3">
            {recentInterviews.map((interview) => (
              <button
                key={interview.id}
                type="button"
                onClick={() => onViewApplication(interview.applicationId)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-100/80"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {interview.company} · {interview.round}
                </p>
                <p className="mt-1 text-sm text-slate-600">{interview.role}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateTime(interview.scheduledAt)} · {interview.mode}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ApplicationsSection({
  applications,
  filters,
  onFilterChange,
  onAddApplication,
  onDeleteApplication,
  onChangeProgress,
  onViewApplication,
}: {
  applications: JobApplication[]
  filters: ApplicationFilters
  onFilterChange: (next: ApplicationFilters) => void
  onAddApplication: (payload: NewApplicationForm) => void
  onDeleteApplication: (id: string) => void
  onChangeProgress: (id: string, progress: JobProgress) => void
  onViewApplication: (id: string) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState<NewApplicationForm>(defaultNewApplicationForm)

  const industries = ['全部', ...new Set(mockJobApplications.map((application) => application.industry))]
  const jobTypes = ['全部', ...new Set(mockJobApplications.map((application) => application.jobType))]
  const cities = ['全部', ...new Set(mockJobApplications.map((application) => application.city))]
  const progresses: Array<'全部' | JobProgress> = ['全部', ...progressOrder]

  const filteredApplications = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()

    const searched = applications.filter((application) => {
      const target = `${application.company} ${application.role} ${application.industry}`.toLowerCase()
      const matchKeyword = keyword ? target.includes(keyword) : true
      const matchIndustry = filters.industry === '全部' || application.industry === filters.industry
      const matchJobType = filters.jobType === '全部' || application.jobType === filters.jobType
      const matchCity = filters.city === '全部' || application.city === filters.city
      const matchProgress = filters.progress === '全部' || application.progress === filters.progress

      return matchKeyword && matchIndustry && matchJobType && matchCity && matchProgress
    })

    return searched.sort((left, right) => {
      if (filters.sortBy === 'matchScore') {
        return (
          calculateMatchScore(right.skillRequirements, right.matchedSkills) -
          calculateMatchScore(left.skillRequirements, left.matchedSkills)
        )
      }

      if (filters.sortBy === 'applyDate') {
        return new Date(right.applyDate).getTime() - new Date(left.applyDate).getTime()
      }

      return new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime()
    })
  }, [applications, filters])

  const submitCreateForm = () => {
    if (!form.company.trim() || !form.role.trim() || !form.industry.trim() || !form.city.trim()) {
      return
    }

    onAddApplication(form)
    setForm(defaultNewApplicationForm)
    setShowCreateForm(false)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">搜索</span>
              <input
                value={filters.keyword}
                onChange={(event) => onFilterChange({ ...filters, keyword: event.target.value })}
                placeholder="搜索公司、岗位、行业"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
              />
            </label>

            <SelectField
              label="行业"
              value={filters.industry}
              options={industries}
              onChange={(value) => onFilterChange({ ...filters, industry: value })}
            />
            <SelectField
              label="岗位类型"
              value={filters.jobType}
              options={jobTypes}
              onChange={(value) => onFilterChange({ ...filters, jobType: value })}
            />
            <SelectField
              label="城市"
              value={filters.city}
              options={cities}
              onChange={(value) => onFilterChange({ ...filters, city: value })}
            />
            <SelectField
              label="状态"
              value={filters.progress}
              options={progresses}
              onChange={(value) => onFilterChange({ ...filters, progress: value })}
            />
          </div>

          <div className="flex gap-3">
            <SelectField
              label="排序"
              compact
              value={filters.sortBy}
              options={[
                { label: '按更新时间', value: 'lastUpdated' },
                { label: '按投递日期', value: 'applyDate' },
                { label: '按匹配度', value: 'matchScore' },
              ]}
              onChange={(value) => onFilterChange({ ...filters, sortBy: value as SortKey })}
            />
            <button
              type="button"
              onClick={() => setShowCreateForm((previous) => !previous)}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              新增岗位
            </button>
          </div>
        </div>

        {showCreateForm ? (
          <div className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2 xl:grid-cols-4">
            <TextField label="公司名称" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
            <TextField label="岗位名称" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
            <TextField label="行业" value={form.industry} onChange={(value) => setForm({ ...form, industry: value })} />
            <TextField label="城市" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
            <SelectField
              label="岗位类型"
              value={form.jobType}
              options={jobTypes.filter((item) => item !== '全部')}
              onChange={(value) => setForm({ ...form, jobType: value as JobType })}
            />
            <SelectField
              label="投递平台"
              value={form.platform}
              options={['Boss直聘', '猎聘', '智联招聘', '前程无忧', '牛客', '公司官网', '内推群', '邮箱投递']}
              onChange={(value) => setForm({ ...form, platform: value as JobApplication['platform'] })}
            />
            <SelectField
              label="当前状态"
              value={form.progress}
              options={progressOrder}
              onChange={(value) => setForm({ ...form, progress: value as JobProgress })}
            />
            <TextField label="薪资范围" value={form.salary} onChange={(value) => setForm({ ...form, salary: value })} />
            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
              <button
                type="button"
                onClick={submitCreateForm}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                保存岗位
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setForm(defaultNewApplicationForm)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                {[
                  '公司名称',
                  '岗位名称',
                  '岗位类型',
                  '行业',
                  '城市',
                  '投递平台',
                  '当前状态',
                  '投递日期',
                  '匹配度',
                  '薪资范围',
                  '更新时间',
                  '操作',
                ].map((label) => (
                  <th key={label} className="border-b border-slate-200 px-4 py-4 font-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => {
                const score = calculateMatchScore(application.skillRequirements, application.matchedSkills)

                return (
                  <tr key={application.id} className="align-top text-sm text-slate-700">
                    <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-900">
                      {application.company}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <button
                        type="button"
                        onClick={() => onViewApplication(application.id)}
                        className="text-left font-semibold text-sky-700 transition hover:text-sky-800"
                      >
                        {application.role}
                      </button>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">{application.jobType}</td>
                    <td className="border-b border-slate-100 px-4 py-4">{application.industry}</td>
                    <td className="border-b border-slate-100 px-4 py-4">{application.city}</td>
                    <td className="border-b border-slate-100 px-4 py-4">{application.platform}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getProgressBadge(application.progress)}`}>
                        {application.progress}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">{formatDate(application.applyDate)}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMatchBadge(score)}`}>
                          {score}% · {getMatchLabel(score)}
                        </span>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">{application.salary}</td>
                    <td className="border-b border-slate-100 px-4 py-4">{formatDate(application.lastUpdated)}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <select
                          value={application.progress}
                          onChange={(event) =>
                            onChangeProgress(application.id, event.target.value as JobProgress)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-sky-300"
                        >
                          {progressOrder.map((progress) => (
                            <option key={progress} value={progress}>
                              {progress}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteApplication(application.id)}
                          className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          删除岗位
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function JobDetailSection({ application }: { application: JobApplication | undefined }) {
  if (!application) {
    return (
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">请选择一个岗位查看详情。</p>
      </section>
    )
  }

  const score = calculateMatchScore(application.skillRequirements, application.matchedSkills)

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">
              {application.company}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {application.role}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {application.industry} · {application.city} · {application.platform}
            </p>
          </div>
          <div className="space-y-3">
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getProgressBadge(application.progress)}`}>
              当前状态：{application.progress}
            </span>
            <span className={`block rounded-full px-4 py-2 text-sm font-semibold ${getMatchBadge(score)}`}>
              匹配度：{score}% · {getMatchLabel(score)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <InfoCard title="岗位 JD" content={application.jd} />
          <InfoCard title="公司业务" content={application.companyBusiness} />
          <InfoCard title="行业信息" content={application.industryInfo} />
          <ListCard title="常见面试问题" items={application.interviewQuestions} />
        </div>
        <div className="space-y-6">
          <ListCard title="技能要求" items={application.skillRequirements} />
          <ListCard title="已匹配技能" items={application.matchedSkills} accent="emerald" />
          <ListCard title="缺失技能" items={application.missingSkills} accent="amber" />
          <ListCard title="职业路径" items={application.careerPath} />
          <InfoCard
            title="资料链接"
            content={`面经链接：${application.interviewExperienceLink}\n视频链接：${application.videoLink}`}
          />
        </div>
      </div>
    </section>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string
  value: string
  options: Array<string | { label: string; value: string } | null | undefined>
  onChange: (value: string) => void
  compact?: boolean
}) {
  const safeOptions = options
    .filter((option): option is string | { label: string; value: string } => {
      if (option == null) return false

      if (typeof option === 'string') {
        return option.trim().length > 0
      }

      return option.label.trim().length > 0 && option.value.trim().length > 0
    })
    .map((option) => (typeof option === 'string' ? { label: option, value: option } : option))

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 ${
          compact ? 'py-3' : 'py-3'
        }`}
      >
        {safeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
      />
    </label>
  )
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600">{content}</p>
    </div>
  )
}

function ListCard({
  title,
  items,
  accent = 'slate',
}: {
  title: string
  items: string[]
  accent?: 'slate' | 'emerald' | 'amber'
}) {
  const accentClass =
    accent === 'emerald'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : accent === 'amber'
        ? 'bg-amber-50 text-amber-700 border-amber-100'
        : 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {items.map((item) => (
          <span key={item} className={`rounded-full border px-3 py-2 text-sm font-medium ${accentClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function FeedbackTextCard({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{content}</p>
    </div>
  )
}

function PlaceholderSection({
  title,
  summary,
  cards,
}: {
  title: string
  summary: string
  cards: Array<{ title: string; description: string }>
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Module Entry</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-4 text-sm leading-8 text-slate-600">{summary}</p>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 p-6">
            <p className="text-sm font-semibold text-slate-900">当前状态</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              这里先保留为当前模块的页面入口，等你下一步指定后，我会继续把它变成真正可用的页面。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [activePage, setActivePage] = useState<NavigationKey>('dashboard')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>(mockJobApplications[0]?.id ?? '')
  const [applications, setApplications] = useState<JobApplication[]>(() => getStoredApplications())
  const [filters, setFilters] = useState<ApplicationFilters>(defaultFilters)
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(() => getStoredInterviews())
  const [contacts, setContacts] = useState<Contact[]>(() => getStoredContacts())
  const [compensationFilters, setCompensationFilters] = useState<ApplicationFilters>({
    ...defaultFilters,
    keyword: '',
    progress: '全部',
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  useEffect(() => {
    window.localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(interviews))
  }, [interviews])

  useEffect(() => {
    window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts))
  }, [contacts])

  const currentPage =
    mockNavigationItems.find((item) => item.key === activePage) ?? mockNavigationItems[0]

  const pageSummary = mockPageSummaries[activePage]
  const selectedApplication =
    applications.find((application) => application.id === selectedApplicationId) ?? applications[0]

  const addApplication = (payload: NewApplicationForm) => {
    const nextApplication: JobApplication = {
      id: `app-${crypto.randomUUID()}`,
      company: payload.company.trim(),
      role: payload.role.trim(),
      jobType: payload.jobType,
      industry: payload.industry.trim(),
      city: payload.city.trim(),
      platform: payload.platform,
      progress: payload.progress,
      salary: payload.salary.trim() || '待补充',
      applyDate: '2026-05-21',
      lastUpdated: '2026-05-21',
      resumeVersion: 'General-V1',
      jd: '待补充岗位 JD 摘要。',
      skillRequirements: ['需求分析', '沟通协同'],
      matchedSkills: ['沟通协同'],
      missingSkills: ['需求分析'],
      companyBusiness: '待补充公司业务介绍。',
      industryInfo: '待补充行业信息。',
      interviewQuestions: ['待补充面试问题'],
      interviewExperienceLink: 'https://example.com/interview-notes',
      videoLink: 'https://example.com/video',
      careerPath: [payload.role.trim(), '岗位成长路径待补充'],
    }

    setApplications((previous) => [nextApplication, ...previous])
    setSelectedApplicationId(nextApplication.id)
  }

  const updateApplicationProgress = (id: string, progress: JobProgress) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === id ? { ...application, progress, lastUpdated: '2026-05-21' } : application,
      ),
    )
  }

  const deleteApplication = (id: string) => {
    setApplications((previous) => previous.filter((application) => application.id !== id))

    if (selectedApplicationId === id) {
      const remaining = applications.filter((application) => application.id !== id)
      setSelectedApplicationId(remaining[0]?.id ?? '')
    }
  }

  const goToJobDetail = (id: string) => {
    setSelectedApplicationId(id)
    setActivePage('job-detail')
  }

  const addInterview = (payload: NewInterviewForm) => {
    setInterviews((previous) => [
      ...previous,
      {
        id: `interview-${crypto.randomUUID()}`,
        applicationId: selectedApplicationId || applications[0]?.id || '',
        company: payload.company.trim(),
        role: payload.role.trim(),
        round: payload.round.trim(),
        mode: payload.mode,
        scheduledAt: payload.scheduledAt,
        durationMinutes: 45,
        interviewer: payload.interviewer.trim(),
        interviewerTitle: payload.interviewerTitle.trim(),
        status: '待开始',
        meetingLink: payload.meetingLink.trim(),
        reminder: '面试前 30 分钟再次确认设备与材料',
        preparationMaterials: ['简历', '项目案例'],
        notes: '待补充面试备注',
        preparationNotes: ['自我介绍', '项目复盘'],
      },
    ])
  }

  const deleteInterview = (id: string) => {
    setInterviews((previous) => previous.filter((item) => item.id !== id))
  }

  const addContact = (payload: NewContactForm) => {
    setContacts((previous: Contact[]) => [
      ...previous,
      {
        id: `contact-${crypto.randomUUID()}`,
        applicationId: selectedApplicationId || applications[0]?.id || '',
        company: payload.company.trim(),
        name: payload.name.trim(),
        role: payload.role.trim(),
        identity: payload.identity,
        channel: payload.email ? '邮箱' : payload.phone ? '电话' : '微信',
        contactInfo: payload.email || payload.phone || payload.wechat,
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        wechat: payload.wechat.trim(),
        relationship: `${payload.identity} 联系人`,
        lastContactAt: '2026-05-21 18:00',
        communicationRecords: ['新建联系人记录'],
        nextAction: payload.nextAction.trim() || '待补充',
        notes: '待补充备注',
      },
    ])
  }

  const deleteContact = (id: string) => {
    setContacts((previous: Contact[]) => previous.filter((item: Contact) => item.id !== id))
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      <section className="space-y-8">
        <div className="rounded-[28px] border border-slate-200/80 bg-white px-8 py-8 shadow-soft">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">
                JobPilot 求职驾驶舱
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                {currentPage.label}
              </h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">{pageSummary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
              <a
                href="https://v.wjx.cn/vm/wMEyNEJ.aspx"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100/70"
              >
                提交试用反馈
              </a>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                  Current Stage
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">数据驱动 MVP</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Build Goal
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">先跑通投递管理，再继续扩展模块</p>
              </div>
            </div>
          </div>
        </div>

        {activePage === 'dashboard' ? (
          <DashboardSection
            applications={applications}
            interviews={mockInterviewSchedules}
            onViewApplication={goToJobDetail}
          />
        ) : null}

        {activePage === 'applications' ? (
          <ApplicationsSection
            applications={applications}
            filters={filters}
            onFilterChange={setFilters}
            onAddApplication={addApplication}
            onDeleteApplication={deleteApplication}
            onChangeProgress={updateApplicationProgress}
            onViewApplication={goToJobDetail}
          />
        ) : null}

        {activePage === 'job-detail' ? <JobDetailSection application={selectedApplication} /> : null}

        {activePage === 'mock-interview' ? <MockInterviewSection applications={applications} /> : null}

        {activePage === 'skill-growth' ? <SkillGrowthSection applications={applications} /> : null}

        {activePage === 'interview-calendar' ? (
          <InterviewCalendarSection
            interviews={interviews}
            onAddInterview={addInterview}
            onDeleteInterview={deleteInterview}
          />
        ) : null}

        {activePage === 'contacts' ? (
          <ContactsSection contacts={contacts} onAddContact={addContact} onDeleteContact={deleteContact} />
        ) : null}

        {activePage === 'compensation' ? (
          <CompensationSection
            applications={applications}
            filters={compensationFilters}
            onFilterChange={setCompensationFilters}
          />
        ) : null}
      </section>
    </Layout>
  )
}

export default App
