
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui-custom/Card';
import { FadeIn } from '../ui-custom/Animations';

interface EmployeeCardProps {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  delay?: number;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  id,
  name,
  position,
  department,
  email,
  phone,
  location,
  avatar,
  delay = 0
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/employees/${id}`);
  };
  
  return (
    <FadeIn delay={delay}>
      <Card hover className="h-full" onClick={handleClick}>
        <div className="flex flex-col p-4">
          <div className="flex items-start mb-4">
            <div className="relative mr-4">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-lg object-cover shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-lg">{name}</h3>
              <p className="text-sm text-hr-text-secondary">{position}</p>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-hr-silver/10 text-xs rounded-full">
                {department}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-hr-text-secondary">
              <Mail className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            
            <div className="flex items-center text-hr-text-secondary">
              <Phone className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span>{phone}</span>
            </div>
            
            <div className="flex items-center text-hr-text-secondary">
              <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
};

export default EmployeeCard;
