import React, { useState, useEffect } from 'react';
import { BankAccount } from '@/lib/api-models';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Plus, Trash2, CheckCircle, Edit, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BankAccountListProps {
  employeeId: number;
}

const BankAccountList: React.FC<BankAccountListProps> = ({ employeeId }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [employeeId]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getBankAccounts(employeeId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      toast.error('Failed to load bank accounts', {
        description: 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (accountId: number) => {
    try {
      const response = await apiService.updateBankAccount(accountId, { isPrimary: true });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the local state
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => ({
          ...acc,
          isPrimary: acc.id === accountId
        }))
      );
      
      toast.success('Primary account updated');
    } catch (error) {
      console.error('Failed to update primary account:', error);
      toast.error('Failed to update primary account');
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    try {
      const response = await apiService.deleteBankAccount(accountId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Remove from local state
      setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
      
      toast.success('Bank account removed');
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      toast.error('Failed to delete bank account');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-hr-blue" />
            <span>Bank Accounts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-hr-silver/20 rounded-md animate-pulse" />
            <div className="h-12 bg-hr-silver/20 rounded-md animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-hr-blue" />
          <span>Bank Accounts</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-6 text-hr-text-secondary">
            <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No bank accounts found</p>
            <Button 
              variant="link" 
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              Add your first bank account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div 
                key={account.id} 
                className={cn(
                  "border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  account.isPrimary ? "bg-blue-50/50 border-blue-200" : ""
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{account.bankName}</span>
                    {account.isPrimary && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {account.accountType}
                    </Badge>
                  </div>
                  <div className="text-sm text-hr-text-secondary mt-1">
                    Account: {account.accountNumber}
                  </div>
                  <div className="text-sm text-hr-text-secondary">
                    Routing: {account.routingNumber}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!account.isPrimary && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetPrimary(account.id)}
                      className="h-8 px-2 text-blue-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Set as Primary
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-hr-text-secondary hover:text-hr-text"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="h-8 w-8 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showAddForm && (
          <div className="mt-4 border rounded-lg p-4 bg-hr-silver/5">
            <h4 className="font-medium mb-3 flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Add New Bank Account
            </h4>
            
            <div className="space-y-3">
              {/* Form fields would go here */}
              <p className="text-sm text-hr-text-secondary">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Bank account form implementation is coming soon
              </p>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                >
                  Save Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountList; 