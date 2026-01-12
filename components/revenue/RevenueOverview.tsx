import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, TrendingUp, TrendingDown, Building } from 'lucide-react';
import { Project, User, CompanyRevenue } from '../../types';

interface RevenueOverviewProps {
  projects: Project[];
  companyRevenue: CompanyRevenue[];
  currentUser: User;
}

export function RevenueOverview({ projects, companyRevenue, currentUser }: RevenueOverviewProps) {
  const getFilteredProjects = () => {
    if (currentUser.role === 'admin') {
      return projects;
    }
    if (currentUser.role === 'supervisor') {
      return projects.filter(p => p.supervisorId === currentUser.id);
    }
    return projects.filter(p => p.fabricatorIds.includes(currentUser.id));
  };

  const filteredProjects = getFilteredProjects();
  
  const canViewCompanyRevenue = currentUser.role === 'admin';
  const canViewProjectRevenue = currentUser.role === 'admin' || currentUser.role === 'supervisor';

  // Calculate project-level revenue
  const totalProjectRevenue = filteredProjects.reduce((sum, p) => sum + p.revenue, 0);
  const totalProjectBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalProjectSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
  const projectProfit = totalProjectRevenue - totalProjectSpent;

  // Company-level revenue (admin only)
  const latestCompanyData = companyRevenue[0];

  if (currentUser.role === 'fabricator') {
    // Calculate total allocated revenue for this fabricator
    const totalAllocatedRevenue = filteredProjects.reduce((sum, project) => {
      const fabricatorBudget = project.fabricatorBudgets?.find(fb => fb.fabricatorId === currentUser.id);
      return sum + (fabricatorBudget?.allocatedRevenue || 0);
    }, 0);

    return (
      <div className="space-y-6">
        <h2>My Revenue & Projects</h2>
        
        {/* Total Revenue Summary */}
        <Card className="bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Total Allocated Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-accent">
              ₱{totalAllocatedRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              From {filteredProjects.length} active project{filteredProjects.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Individual Project Cards */}
        <div className="grid gap-4">
          {filteredProjects.map((project) => {
            const fabricatorBudget = project.fabricatorBudgets?.find(fb => fb.fabricatorId === currentUser.id);
            const myRevenue = fabricatorBudget?.allocatedRevenue || 0;
            const revenuePercentage = project.revenue > 0 
              ? ((myRevenue / project.revenue) * 100).toFixed(1) 
              : '0';

            return (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{project.name}</span>
                    {myRevenue > 0 && (
                      <span className="text-accent text-base">
                        ₱{myRevenue.toLocaleString()}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Client</span>
                      </div>
                      <p>{project.clientName}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Total Project Value</span>
                      </div>
                      <p className="text-lg">₱{project.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {myRevenue > 0 && (
                    <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Your Allocated Revenue</p>
                          <p className="text-xl text-accent">₱{myRevenue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Your Share</p>
                          <p className="text-xl">{revenuePercentage}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Project Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2>Revenue & Financial Overview</h2>

      {/* Project-level revenue (Supervisor and Admin) */}
      {canViewProjectRevenue && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Project Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₱{totalProjectRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {filteredProjects.length} projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Project Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₱{totalProjectBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total allocated budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Project Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₱{totalProjectSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((totalProjectSpent / totalProjectBudget) * 100)}% of budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Project Profit</CardTitle>
              {projectProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl ${projectProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₱{projectProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue - Expenses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Company-level revenue (Admin only) */}
      {canViewCompanyRevenue && latestCompanyData && (
        <>
          <div className="border-t pt-6">
            <h3 className="mb-4">Company Revenue Overview</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Company Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">₱{latestCompanyData.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Q{latestCompanyData.quarter} {latestCompanyData.year}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Expenses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">₱{latestCompanyData.totalExpenses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Operating costs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Net Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-500">
                    ₱{latestCompanyData.netProfit.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {latestCompanyData.projectsCompleted} projects completed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Project Details Table */}
      {canViewProjectRevenue && (
        <Card>
          <CardHeader>
            <CardTitle>Project Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4>{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.clientName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm">Revenue: ₱{project.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Spent: ₱{project.spent.toLocaleString()} / ₱{project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}