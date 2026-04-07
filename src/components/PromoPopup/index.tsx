// src/components/PromoPopup/index.tsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export default function PromoPopup({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-900 rounded-2xl max-w-md w-full relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2">✕</button>
        <img src="https://images.pexels.com/photos/promo-vertical/pexels-photo-promo-vertical.jpeg" alt="Special Promotion" className="w-full h-64 object-cover" loading="lazy" />
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2 text-gray-900">SPECIAL OFFER!</h3>
          <p className="text-sm mb-4 text-gray-700">Up to 30% off on selected products</p>
          <Link to="/promotions" onClick={onClose} className="w-full bg-red-600 text-white py-3 rounded-lg inline-flex items-center justify-center gap-2">
            View Offers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
