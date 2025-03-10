
import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import Button from '../ui-custom/Button';
import { cn } from '@/lib/utils';

interface EmployeeSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  onSearch,
  onFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };
  
  const handleFilter = () => {
    onFilter({ department, location });
    setIsFilterOpen(false);
  };
  
  const handleResetFilter = () => {
    setDepartment('');
    setLocation('');
    onFilter({});
    setIsFilterOpen(false);
  };
  
  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hr-text-secondary">
              <Search className="h-4 w-4" />
            </div>
            
            <input
              type="text"
              placeholder="Search employees by name, position, or department"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-hr-silver/30 bg-white focus:ring-2 focus:ring-hr-blue/20 focus:border-hr-blue/40 focus:outline-none transition-all duration-200"
            />
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-hr-text-secondary hover:text-hr-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="md"
            icon={<Filter className="h-4 w-4" />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "min-w-[100px]",
              (department || location) && "border-hr-blue/40 text-hr-blue"
            )}
          >
            {(department || location) ? 'Filtered' : 'Filters'}
          </Button>
          
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </div>
      </form>
      
      {isFilterOpen && (
        <div className="mt-3 p-4 bg-white rounded-lg shadow-apple-md border border-hr-silver/20 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-hr-text-secondary mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-hr-silver/30 focus:ring-2 focus:ring-hr-blue/20 focus:border-hr-blue/40 focus:outline-none"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-hr-text-secondary mb-1">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-hr-silver/30 focus:ring-2 focus:ring-hr-blue/20 focus:border-hr-blue/40 focus:outline-none"
              >
                <option value="">All Locations</option>
                <option value="San Francisco, CA">San Francisco, CA</option>
                <option value="New York, NY">New York, NY</option>
                <option value="Austin, TX">Austin, TX</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilter}
            >
              Reset
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              size="sm" 
              onClick={handleFilter}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
