
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import { FadeIn, SlideIn } from '@/components/ui-custom/Animations';
import { apiService, payrollApiService, Employee, PaySlip, EmployeeBenefit, TaxDocument } from '@/lib/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Heart,
  FileText,
  ChevronRight,
  Download,
  Shield,
  Briefcase,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const PayrollPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [benefits, setBenefits] = useState<EmployeeBenefit[]>([]);
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let employeeId: number;
        
        if (!id) {
          // If no ID is provided, we're viewing the current user's profile
          // For demo purposes, we'll just use the first employee
          const allEmployees = await apiService.getEmployees();
          if (allEmployees.error) throw new Error(allEmployees.error);
          
          setEmployee(allEmployees.data[0]);
          employeeId = allEmployees.data[0].id;
        } else {
          const response = await apiService.getEmployeeById(Number(id));
          if (response.error) throw new Error(response.error);
          
          setEmployee(response.data);
          employeeId = response.data.id;
        }
        
        // Fetch payroll data
        const [payslipsRes, benefitsRes, taxDocumentsRes] = await Promise.all([
          payrollApiService.getEmployeePayslips(employeeId),
          payrollApiService.getEmployeeBenefits(employeeId),
          payrollApiService.getTaxDocuments(employeeId)
        ]);
        
        if (payslipsRes.error) throw new Error(payslipsRes.error);
        if (benefitsRes.error) throw new Error(benefitsRes.error);
        if (taxDocumentsRes.error) throw new Error(taxDocumentsRes.error);
        
        setPayslips(payslipsRes.data);
        setBenefits(benefitsRes.data);
        setTaxDocuments(taxDocumentsRes.data);
      } catch (error) {
        console.error('Failed to fetch payroll data:', error);
        toast.error('Failed to load payroll information', {
          description: 'Please try again later'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-hr-silver/20 rounded-md animate-pulse" />
          <div className="h-64 bg-white rounded-xl shadow-sm border border-hr-silver/10 animate-pulse" />
          <div className="grid grid-cols-1 gap-6">
            <div className="h-48 bg-white rounded-xl shadow-sm border border-hr-silver/10 animate-pulse" />
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (!employee) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Employee Not Found</h2>
          <p className="text-hr-text-secondary mt-2">
            The employee profile you're looking for doesn't exist.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="space-y-1 mb-6">
        <SlideIn direction="up" duration={400}>
          <h1 className="text-2xl font-semibold tracking-tight">Payroll & Benefits</h1>
        </SlideIn>
        <SlideIn direction="up" duration={400} delay={100}>
          <p className="text-hr-text-secondary">
            View salary details, benefits, and tax documents.
          </p>
        </SlideIn>
      </div>
      
      <FadeIn delay={200}>
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-hr-blue" />
                <span>Payroll Summary</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                Export to CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="bg-hr-silver/5 p-4 rounded-lg">
                <div className="text-sm text-hr-text-secondary mb-1">Current Salary</div>
                <div className="text-2xl font-semibold">${employee.salary?.toLocaleString()}</div>
                <div className="text-xs text-hr-text-secondary mt-2">Annual, before taxes</div>
              </div>
              
              <div className="bg-hr-silver/5 p-4 rounded-lg">
                <div className="text-sm text-hr-text-secondary mb-1">Last Paycheck</div>
                <div className="text-2xl font-semibold">$2,650</div>
                <div className="text-xs text-hr-text-secondary mt-2">Net amount, June 30, 2023</div>
              </div>
              
              <div className="bg-hr-silver/5 p-4 rounded-lg">
                <div className="text-sm text-hr-text-secondary mb-1">YTD Gross Pay</div>
                <div className="text-2xl font-semibold">$42,000</div>
                <div className="text-xs text-hr-text-secondary mt-2">As of June 30, 2023</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Recent Paychecks</h3>
              <div className="space-y-3">
                {payslips.map((payslip) => (
                  <div 
                    key={payslip.id} 
                    className="flex items-center justify-between bg-hr-silver/5 p-3 rounded-lg transition-colors hover:bg-hr-silver/10 cursor-pointer"
                    onClick={() => toast.info('Payslip details', { description: 'This would open detailed payslip information' })}
                  >
                    <div className="flex items-center">
                      <div className="bg-hr-blue/10 p-2 rounded-lg mr-3">
                        <Calendar className="h-4 w-4 text-hr-blue" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {new Date(payslip.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(payslip.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-hr-text-secondary mt-0.5">
                          Paid on {new Date(payslip.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="font-medium">${payslip.netAmount.toLocaleString()}</div>
                        <div className="text-xs text-hr-text-secondary">Net Amount</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-hr-text-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SlideIn direction="up" delay={300} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                <span>Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benefits.length > 0 ? (
                  benefits.map((benefit) => (
                    <div key={benefit.id} className="border border-hr-silver/10 rounded-lg overflow-hidden">
                      <div className="flex items-center bg-hr-silver/5 p-3">
                        <div className={cn(
                          "p-2 rounded-lg mr-3",
                          benefit.benefitPlan?.type === 'health' ? "bg-red-50 text-red-500" :
                          benefit.benefitPlan?.type === 'retirement' ? "bg-purple-50 text-purple-600" :
                          "bg-blue-50 text-hr-blue"
                        )}>
                          {benefit.benefitPlan?.type === 'health' ? (
                            <Heart className="h-4 w-4" />
                          ) : benefit.benefitPlan?.type === 'retirement' ? (
                            <Briefcase className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{benefit.benefitPlan?.name}</h4>
                          <p className="text-xs text-hr-text-secondary">
                            Enrolled since {new Date(benefit.enrollmentDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={cn(
                          "ml-2 px-2 py-0.5 text-xs rounded-full",
                          benefit.status === 'active' ? "bg-green-50 text-green-600" :
                          benefit.status === 'pending' ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-500"
                        )}>
                          <span className="capitalize">{benefit.status}</span>
                        </div>
                      </div>
                      <div className="p-3 text-sm">
                        <p>{benefit.benefitPlan?.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-hr-text-secondary">Coverage</p>
                            <p className="font-medium">{benefit.benefitPlan?.coverage}</p>
                          </div>
                          <div>
                            <p className="text-hr-text-secondary">Monthly Cost</p>
                            <div className="font-medium">
                              ${benefit.benefitPlan?.monthlyCost.toLocaleString()} 
                              <span className="text-xs text-hr-text-secondary ml-1">
                                (Company pays: ${benefit.benefitPlan?.employerContribution.toLocaleString()})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Heart className="h-10 w-10 mx-auto text-hr-text-secondary mb-2" />
                    <p className="text-hr-text-secondary">No benefits enrolled.</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => toast.info('Benefits Enrollment', { description: 'This would open the benefits enrollment page' })}
              >
                Manage Benefits
              </Button>
            </CardContent>
          </Card>
        </SlideIn>
        
        <SlideIn direction="up" delay={400}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-hr-text-secondary" />
                <span>Tax Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxDocuments.length > 0 ? (
                  taxDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-3 border border-hr-silver/10 rounded-lg hover:bg-hr-silver/5 cursor-pointer transition-colors"
                      onClick={() => toast.info('Document View', { description: 'This would open the document viewer' })}
                    >
                      <div className="flex items-center">
                        <div className="bg-hr-silver/10 p-2 rounded-lg mr-3">
                          <FileText className="h-4 w-4 text-hr-text-secondary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{doc.documentType} - {doc.year}</h4>
                          <p className="text-xs text-hr-text-secondary">
                            Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-hr-text-secondary" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 mx-auto text-hr-text-secondary mb-2" />
                    <p className="text-hr-text-secondary">No tax documents available.</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                Upload Tax Document
              </Button>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </PageContainer>
  );
};

export default PayrollPage;
