import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Se houver hash (#algo), faz scroll para o elemento
    if (location.hash) {
      const id = location.hash.replace('#', '');

      // pequeno delay para garantir que o DOM já foi renderizado
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);

      return; // NÃO executa scroll para topo
    }

    // Caso NÃO haja hash → scroll normal para topo
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

  }, [location]);

  return null;
};

export default ScrollToTop;