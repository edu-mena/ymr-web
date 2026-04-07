import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  itemCount: number;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  name, 
  description, 
  icon: Icon, 
  itemCount, 
  onClick 
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 card-hover cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-600 transition-colors duration-200">
          <Icon className="h-6 w-6 text-red-600 group-hover:text-white transition-colors duration-200" />
        </div>
        <span className="text-sm text-gray-500">{itemCount} items</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default CategoryCard;