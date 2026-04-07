import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id?: string;
  name: string;
  image: string;
  category: string;
  to?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, image, category, to }) => {
  return (
    <Link
      to={to || (id ? `/product/${id}` : '#')}
      className="block w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 group"
    >
      <div className="relative bg-gray-100 w-full aspect-[4/3] sm:aspect-square">
        <img 
          src={image} 
          alt={name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute top-1 right-1 text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full z-10">
          {category}
        </span>
      </div>

      <div className="p-2 bg-[#e6e6e6]">
        <h3 className="text-sm sm:text-base md:text-lg py-2 md:py-3 font-semibold text-gray-900 text-left group-hover:text-red-600 transition-colors leading-tight truncate">
          {name}
        </h3>
      </div>
    </Link>
  );
};

export default ProductCard;
