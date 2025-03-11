import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import EmployeeCard from '@/components/employee/EmployeeCard';
import EmployeeSearch from '@/components/employee/EmployeeSearch';
import { SlideIn, StaggeredContainer } from '@/components/ui-custom/Animations';
import { apiService, Employee } from '@/lib/api';
import { toast } from 'sonner';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getEmployees();
        if (response.error) {
          throw new Error(response.error);
        }
        // Ensure we always have an array
        const employeeData = Array.isArray(response.data) ? response.data : [];
        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        toast.error('Failed to load employees', {
          description: 'Please try again later.'
        });
        // Set empty arrays on error
        setEmployees([]);
        setFilteredEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiService.searchEmployees(query);
      if (response.error) {
        throw new Error(response.error);
      }
      // Ensure we always have an array
      const searchResults = Array.isArray(response.data) ? response.data : [];
      setFilteredEmployees(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed', {
        description: 'Please try again with different terms.'
      });
      // Keep the current filtered employees on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilter = async (filters: Record<string, string>) => {
    // If no filters are applied, show all employees
    if (Object.values(filters).every(value => !value)) {
      setFilteredEmployees(employees);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiService.filterEmployees(filters);
      if (response.error) {
        throw new Error(response.error);
      }
      // Ensure we always have an array
      const filterResults = Array.isArray(response.data) ? response.data : [];
      setFilteredEmployees(filterResults);
    } catch (error) {
      console.error('Filter failed:', error);
      toast.error('Filter failed', {
        description: 'Please try again with different filters.'
      });
      // Keep the current filtered employees on error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ensure filteredEmployees is always an array before using map
  const employeesToRender = Array.isArray(filteredEmployees) ? filteredEmployees : [];
  
  return (
    <PageContainer>
      <div className="space-y-1 mb-6">
        <SlideIn direction="up" duration={400}>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        </SlideIn>
        <SlideIn direction="up" duration={400} delay={100}>
          <p className="text-hr-text-secondary">
            View and manage your company's employee directory.
          </p>
        </SlideIn>
      </div>
      
      <EmployeeSearch 
        onSearch={handleSearch} 
        onFilter={handleFilter} 
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div 
              key={index}
              className="h-48 bg-white rounded-lg shadow-sm border border-hr-silver/10 animate-pulse"
            />
          ))}
        </div>
      ) : employeesToRender.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-hr-text-primary">No employees found</h3>
          <p className="text-hr-text-secondary mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employeesToRender.map((employee, index) => (
            <EmployeeCard
              key={employee.id}
              id={employee.id}
              name={employee.name}
              position={employee.position}
              department={employee.department}
              email={employee.email}
              phone={employee.phone}
              location={employee.location}
              avatar={employee.avatar}
              delay={index * 50}
            />
          ))}
        </StaggeredContainer>
      )}
    </PageContainer>
  );
};

export default Employees;
