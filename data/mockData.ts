import { User, Project, Task, WorkLogEntry, Material, CompanyRevenue } from '../types';

// Production-ready - all data will be fetched from database
export const mockUsers: User[] = [];

// Sample project data - replace with your own
export const mockProjects: Project[] = [];

// Sample task data - replace with your own
export const mockTasks: Task[] = [];

// Sample work log data - replace with your own
export const mockWorkLogs: WorkLogEntry[] = [];

// Sample material data - replace with your own
export const mockMaterials: Material[] = [];

// Company revenue data - replace with your own
export const mockCompanyRevenue: CompanyRevenue[] = [{
  totalRevenue: 0,
  monthlyRevenue: [],
  yearlyRevenue: []
}];