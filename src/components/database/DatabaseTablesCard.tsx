
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table } from 'lucide-react';

interface DatabaseTable {
  name: string;
  rowCount: number;
}

interface DatabaseTablesCardProps {
  tables: DatabaseTable[];
}

const DatabaseTablesCard: React.FC<DatabaseTablesCardProps> = ({ tables }) => {
  if (!tables.length) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Table className="mr-2 h-5 w-5" />
          Database Tables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tables.map((table) => (
            <div key={table.name} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
              <div className="flex items-center">
                <Table className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-mono text-sm">{table.name}</span>
              </div>
              <Badge variant="outline">{table.rowCount} rows</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTablesCard;
