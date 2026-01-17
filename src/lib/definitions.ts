
export type UserRole = 
  | 'consultant' 
  | 'manager' 
  | 'Service Writer' 
  | 'Service Manager' 
  | 'Finance Manager' 
  | 'Parts Consultant' 
  | 'Parts Manager' 
  | 'Owner'
  | 'Trainer'
  | 'Admin';

export type User = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  dealershipId: string;
  avatarUrl: string;
};

export type LessonRole = Exclude<UserRole, 'Owner' | 'Admin'>;

export type LessonCategory =
  | 'Sales - Meet and Greet'
  | 'Sales - Needs Assessment'
  | 'Sales - Vehicle Presentation'
  | 'Sales - Test Drive'
  | 'Sales - Negotiation'
  | 'Sales - Closing'
  | 'Sales - Delivery'
  | 'Sales - Follow-up'
  | 'Service - Appointment'
  | 'Service - Write-up'
  | 'Service - Walk-around'
  | 'Service - Presenting MPI'
  | 'Service - Status Updates'
  | 'Service - Active Delivery'
  | 'Parts - Identifying Needs'
  | 'Parts - Sourcing'
  | 'F&I - Menu Selling'
  | 'F&I - Objection Handling'
  | 'Product Knowledge';

export type CxTrait = 'empathy' | 'listening' | 'trust' | 'followUp' | 'closing' | 'relationshipBuilding';

export type Lesson = {
  lessonId: string;
  title: string;
  role: LessonRole;
  category: LessonCategory;
  associatedTrait: CxTrait;
  customScenario?: string;
};

export type LessonLog = {
  logId: string;
  timestamp: Date;
  userId: string;
  lessonId: string;
  stepResults: Record<string, 'pass' | 'fail'>;
  xpGained: number;
  empathy: number;
  listening: number;
  trust: number;
  followUp: number;
  closing: number;
  relationshipBuilding: number;
};
