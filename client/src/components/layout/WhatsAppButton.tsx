import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { products, settings } = useStore();

  // Determine message based on current page path
  let message = 'Hello TREEBORN Skincare, I am interested in your botanical formulations. Can you please assist me?';

  if (path.startsWith('/product/')) {
    const productId = path.split('/product/')[1];
    const product = products.find((p) => p.id === productId);
    if (product) {
      message = `Hello, I am interested in purchasing ${product.name} - Rs. ${product.price.toFixed(2)}. Can you please help me with my order?`;
    }
  }

  const formatWhatsAppLink = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    return cleanNum.length === 10 ? `91${cleanNum}` : cleanNum;
  };

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formatWhatsAppLink(settings.whatsappNumber)}?text=${encodedMessage}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 1, damping: 15 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 bg-primary text-white p-3.5 rounded-full shadow-2xl hover:bg-primary-light transition-all flex items-center justify-center group cursor-pointer focus:outline-none"
      aria-label="Contact us on WhatsApp"
    >
      {/* WhatsApp SVG logo */}
      <svg
        className="w-7 h-7 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.73.001-2.597-1.006-5.038-2.834-6.87-1.827-1.83-4.258-2.836-6.857-2.837-5.442 0-9.87 4.372-9.873 9.734-.001 1.738.455 3.43 1.32 4.932l-.993 3.629 3.73-.978zm11.23-5.32c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.127-.992-1.89-2.22-2.112-2.6-.222-.38-.024-.585.126-.735.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.625-.926-2.225-.244-.589-.49-.51-.676-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 3.375-.275 2.725 1.7 5.35 1.95 5.675.25.325 3.42 5.22 8.28 7.32 1.155.498 2.058.796 2.76 1.02.822.26 1.57.223 2.16.136.66-.098 1.772-.725 2.022-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.225-.575-.375z" />
      </svg>

      {/* Slide-out tooltip helper on hover (slides out to the left) */}
      <span className="absolute right-full mr-3 bg-white text-dark border border-border-gray/80 px-3 py-1.5 rounded-lg text-xs font-semibold font-display shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Chat with TREEBORN
      </span>
    </motion.a>
  );
};

export default WhatsAppButton;
