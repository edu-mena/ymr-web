// ===== TIPOS =====
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured: boolean;
  content: string;
}

// ===== DADOS DOS BLOGS =====
export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Future of Industrial Safety Equipment',
    excerpt: 'Exploring the latest innovations in safety gear and how they\'re revolutionizing workplace protection.',
    author: 'Marketing YMR',
    date: '2025-06-15',
    readTime: '2 min read',
    category: 'Compressorsors',
    image: 'https://ymrindustrial.com/assets/produtos/elgi.jpg',
    featured: true,
    content: `
      <p>Our equipment leasing division is increasing its fleet with 16 additional compressors, of which 6 ATEX approved zone 2 of different sizes and specifications. We are happy to share that we will be receiving the first batch within the first quarter of next year. </p>
      <p>We are gearing up to be able to serve the SADC region, as we believe and see great evolving potential for our region. </p>
      
      <h3>Smart Safety Gear Integration</h3>
      <p>Modern safety equipment now incorporates IoT sensors and connectivity features that provide real-time monitoring of worker conditions. Smart helmets can detect falls, monitor vital signs, and automatically alert emergency services when needed.</p>
      
      <h3>Advanced Materials and Design</h3>
      <p>New composite materials are making safety equipment lighter, more durable, and more comfortable. These innovations ensure that workers can maintain peak performance while staying protected throughout their shifts.</p>
      
      <h3>Predictive Safety Analytics</h3>
      <p>AI-powered systems can now predict potential safety incidents before they occur, allowing companies to take proactive measures and prevent accidents before they happen.</p>
      
      <h3>Environmental Adaptability</h3>
      <p>Safety equipment is becoming more adaptable to various environmental conditions, from extreme temperatures to hazardous chemical exposure, ensuring comprehensive protection in all industrial settings.</p>
      
      <p>These innovations represent just the beginning of a new era in industrial safety, where technology and protection work hand in hand to create safer, more efficient workplaces.</p>
    `
  },
  {
    id: 2,
    title: 'Sustainable Manufacturing: A New Era',
    excerpt: 'How industrial companies are adopting eco-friendly practices without compromising efficiency.',
    author: 'João Silva',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Sustainability',
    image: 'https://media.licdn.com/dms/image/v2/D4D1FAQG4Zu_5On4qtw/feedshare-document-images_480/B4DZXxl.Q5HkAk-/3/1743515033994?e=1773273600&v=beta&t=Z8_FrPnpX3JZReJIQn3Zmg2cEs22dcVqH44oAU892ms',
    featured: false,
    content: `
      <p>Sustainable manufacturing is no longer just a trend—it's a necessity for companies looking to thrive in the modern industrial landscape. This comprehensive guide explores how Angolan manufacturers are leading the way in eco-friendly practices.</p>
      
      <h3>Energy Efficiency Revolution</h3>
      <p>Modern manufacturing facilities are implementing smart energy management systems that reduce consumption by up to 40% while maintaining production efficiency. Solar panels, wind turbines, and energy storage systems are becoming standard features.</p>
      
      <h3>Waste Reduction Strategies</h3>
      <p>Zero-waste manufacturing processes are being adopted across various industries, with companies achieving 95% waste diversion from landfills through innovative recycling and reuse programs.</p>
      
      <h3>Circular Economy Implementation</h3>
      <p>Companies are redesigning their production processes to create closed-loop systems where materials are continuously reused, reducing the need for virgin resources and minimizing environmental impact.</p>
      
      <h3>Green Supply Chain Management</h3>
      <p>Supply chains are being optimized for sustainability, with companies working closely with suppliers to ensure environmentally responsible practices throughout the entire production process.</p>
      
      <p>The future of manufacturing lies in sustainable practices that protect our environment while driving economic growth and innovation.</p>
    `
  },
  {
    id: 3,
    title: 'Expansão Estratégica: Nova Frota de Compressores YMR',
    excerpt: 'Concluímos a diversificação da nossa divisão de compressores, oferecendo agora equipamentos de 1.77m³/min a 45m³/min, com suporte completo de peças e assistência técnica.',
    author: 'Yaba Rosinho',
    date: '2025-01-15',
    readTime: '4 min read',
    category: 'Compressors',
    image: 'https://media.licdn.com/dms/image/v2/D4D1FAQG4Zu_5On4qtw/feedshare-document-images_480/B4DZXxl.Q5HkAk-/2/1743515033994?e=1773273600&v=beta&t=R9UVFV8JjTr_kxBx8zCLdOOpAVp1BXYjEBp7-nS0bcM',
    featured: true,
    content: `
      <p>Como parte da nossa estratégia de crescimento de 25 anos, a YMR Equipment Rental & Leasing estabeleceu no início deste ano o objetivo de diversificar a nossa divisão de compressores. Temos o prazer de anunciar que esta expansão está agora concluída.</p>
      
      <h3>Especificações Técnicas Atualizadas</h3>
      <p>Oferecemos agora compressores com vazões que variam de <strong>1.77m³/min a 7barg</strong> até <strong>45m³/min (1600CFM) a 10barg</strong> e superiores. Para suportar este equipamento, disponibilizamos:</p>
      <ul>
        <li>Inventário completo de peças sobresselentes</li>
        <li>Equipa de assistência técnica dedicada, disponível para responder às suas consultas sob demanda</li>
        <li>Suporte técnico especializado para manutenção preventiva e corretiva</li>
      </ul>
      
      <h3>Visão para 2026</h3>
      <p>Olhando para o futuro, planeamos fortalecer ainda mais as parcerias com os nossos clientes, integrando os nossos compressores, tanques, bombas e geradores com equipamentos adicionais, incluindo:</p>
      <ul>
        <li>Torres de iluminação móveis</li>
        <li>Contentores de rigging e loft</li>
        <li>Reboques e camiões especializados</li>
      </ul>
      
      <p>O nosso objetivo é servir como um parceiro abrangente e <strong>one-stop equipment</strong> para o seu negócio, proporcionando soluções integradas que otimizam a eficiência operacional e reduzem custos logísticos.</p>
      
      <p><em>Desejamos a todos um Feliz Natal e um Próspero Ano Novo. Estamos prontos para apoiar o seu sucesso em 2026.</em></p>
      
      <p>Para mais informações, visite: <a href="https://www.ymrindustrial.com" target="_blank">www.ymrindustrial.com</a></p>
    `
  },
  {
    id: 4,
    title: 'Compressores Industriais ATEX: Segurança e Performance em Zonas de Risco',
    excerpt: 'Comissionamento concluído de novos compressores industriais certificados ATEX Zone II, disponíveis para aluguer e leasing de longo prazo em Luanda.',
    author: 'Yaba Rosinho',
    date: '2024-05-20',
    readTime: '3 min read',
    category: 'Safety & Compliance',
    image: 'https://media.licdn.com/dms/image/v2/C5622AQFnClYxFZpM8w/feedshare-shrink_800/feedshare-shrink_800/0/1582290822141?e=1774483200&v=beta&t=4S8nc4UT_oWotudQaNhUgz5v3lPSM4crI5dDxMC_oUI',
    featured: false,
    content: `
      <p>Temos o prazer de anunciar o comissionamento concluído da mais recente adição à nossa frota de compressores industriais. Estas unidades representam o compromisso da YMR com a segurança, qualidade e conformidade normativa.</p>
      
      <h3>Especificações Técnicas</h3>
      <ul>
        <li><strong>Quantidade:</strong> 2 unidades disponíveis para aluguer e leasing de longo prazo</li>
        <li><strong>Vazão:</strong> 750 CFM</li>
        <li><strong>Pressão:</strong> 10 Bar</li>
        <li><strong>Certificação:</strong> DNV 2.7.1</li>
        <li><strong>Classificação ATEX:</strong> Aprovado para Zone II (atmosferas potencialmente explosivas)</li>
      </ul>
      
      <h3>Disponibilidade Imediata</h3>
      <p>Estas unidades estão disponíveis para recolha no nosso parque em <strong>Luanda, Angola</strong>. A logística de entrega pode ser coordenada pela nossa equipa de operações para garantir uma implementação rápida e eficiente no seu projeto.</p>
      
      <h3>Expansão Contínua</h3>
      <p>Além destas unidades, esperamos receber 5 equipamentos adicionais de capacidades variadas até meados de maio de 2025, completando o investimento do primeiro semestre para esta divisão estratégica.</p>
      
      <p><em>Agradecemos o esforço dos nossos colaboradores, parceiros e clientes, cujo trabalho árduo, dedicação e confiança tornaram este marco possível.</em></p>
      
      <p>Para mais informações técnicas ou comerciais: <a href="https://www.ymrindustrial.com" target="_blank">www.ymrindustrial.com</a></p>
    `
  },
  {
    id: 5,
    title: 'Crescimento Regional: YMR Preparada para Servir a Região SADC',
    excerpt: 'Expansão da frota com 16 novos compressores, incluindo 6 certificados ATEX Zone 2, posiciona a YMR como parceiro estratégico na região da SADC.',
    author: 'Yaba Rosinho',
    date: '2023-12-10',
    readTime: '3 min read',
    category: 'Business Growth',
    image: 'https://media.licdn.com/dms/image/v2/D4E22AQFqxUItSaPy4A/feedshare-shrink_1280/B4EZO3MQO5HkAk-/0/1733945264797?e=1774483200&v=beta&t=ajuwum7MsVfvBaN5YhuqRNVkhZCsTYEWXeAUpHmTAHg',
    featured: false,
    content: `
      <p>A YMR Group anuncia um marco significativo na expansão da nossa divisão de equipamento: o reforço da frota com <strong>16 compressores adicionais</strong>, dos quais 6 contam com certificação ATEX para Zone 2, em diferentes tamanhos e especificações técnicas.</p>
      
      <h3>Calendário de Implementação</h3>
      <p>Temos o prazer de partilhar que receberemos o primeiro lote destes equipamentos no <strong>primeiro trimestre do próximo ano</strong>, permitindo uma resposta ágil às necessidades dos nossos clientes na região.</p>
      
      <h3>Foco na Região SADC</h3>
      <p>Esta expansão estratégica reflete a nossa convicção no potencial evolutivo da região da <strong>Comunidade para o Desenvolvimento da África Austral (SADC)</strong>. Estamos a preparar-nos para:</p>
      <ul>
        <li>Oferecer soluções de aluguer e leasing flexíveis e adaptadas às necessidades locais</li>
        <li>Garantir suporte técnico especializado e disponibilidade de peças sobresselentes</li>
        <li>Estabelecer parcerias de longo prazo com operadores industriais, construtoras e empresas de energia</li>
      </ul>
      
      <p>Acreditamos que o investimento em equipamento de qualidade, combinado com um serviço de excelência, é fundamental para impulsionar o desenvolvimento industrial sustentável na nossa região.</p>
      
      <p>Para explorar oportunidades de colaboração: <a href="https://www.ymrindustrial.com" target="_blank">www.ymrindustrial.com</a></p>
    `
  },
  {
    id: 6,
    title: 'Expansão de Infraestrutura: Novo Espaço de Armazém para a Divisão de Compressores',
    excerpt: 'Adição de 900m² de espaço de armazém em Luanda reforça a capacidade operacional da YMR para suportar o crescimento da divisão de compressores.',
    author: 'Yaba Rosinho',
    date: '2023-08-15',
    readTime: '2 min read',
    category: 'Infrastructure',
    image: 'https://media.licdn.com/dms/image/v2/C5622AQE7c40vcW-zxg/feedshare-shrink_800/feedshare-shrink_800/0/1584879711665?e=1774483200&v=beta&t=0vx9Hepk5NLBEjdtS2GYFZN-9hAH5BWtjJy2APxLYMc',
    featured: false,
    content: `
      <p>A YMR Group concluiu com sucesso a expansão da nossa infraestrutura logística em Luanda, com a adição de <strong>900m² de espaço de armazém</strong> dedicado à divisão de compressores.</p>
      
      <h3>Benefícios Operacionais</h3>
      <p>Este novo espaço permite:</p>
      <ul>
        <li>Armazenamento seguro e organizado de equipamento de maior dimensão</li>
        <li>Áreas dedicadas para manutenção preventiva e preparação de equipamentos</li>
        <li>Otimização dos processos de logística e entrega aos clientes</li>
        <li>Melhoria das condições de trabalho para as nossas equipas técnicas</li>
      </ul>
      
      <h3>Reconhecimento de Equipa</h3>
      <p>Gostaríamos de destacar o excelente trabalho do nosso coordenador de projeto, <strong>Afonso Pedro</strong>, um profissional resiliente que cresceu dentro da YMR Group e demonstrou liderança e dedicação excecionais na execução deste projeto.</p>
      
      <p>Os trabalhos de acabamento exterior estão em curso, e esperamos concluir esta fase nas próximas semanas, reforçando ainda mais a nossa capacidade de servir o mercado angolano e regional com excelência.</p>
      
      <p>Saiba mais sobre as nossas instalações e capacidades: <a href="https://www.ymrindustrial.com" target="_blank">www.ymrindustrial.com</a></p>
    `
  },
  {
    id: 7,
    title: 'Dobro do Espaço: YMR Expande Escritórios e Armazém para Apoiar Crescimento',
    excerpt: 'Expansão para mais de 1.600m² de armazém e duplicação do espaço de escritórios suportam o crescimento de 50% ao ano da divisão de leasing de equipamento.',
    author: 'Yaba Rosinho',
    date: '2022-02-10',
    readTime: '3 min read',
    category: 'Company News',
    image: 'https://media.licdn.com/dms/image/v2/C4E22AQFpsR5yCv4pAQ/feedshare-shrink_800/feedshare-shrink_800/0/1597056093542?e=1774483200&v=beta&t=1wPlWpplC9wmQDwkA5TKlHzHccj3bkHxaBMt8Dzrx6k',
    featured: false,
    content: `
      <p>É com grande satisfação que partilhamos um marco importante no desenvolvimento da YMR Group: <strong>duplicámos o nosso espaço de escritórios</strong> e expandimos a área de armazém para mais de <strong>1.600m² (16.000 pés quadrados)</strong>.</p>
      
      <h3>Suporte ao Crescimento Sustentado</h3>
      <p>Esta expansão estratégica foi planeada para suportar:</p>
      <ul>
        <li>A integração de novos colaboradores e o fortalecimento das nossas equipas técnicas e administrativas</li>
        <li>O crescimento de <strong>50% ano sobre ano</strong> registado pela nossa divisão de leasing de equipamento desde 2021</li>
        <li>A criação de um espaço dedicado e otimizado para a gestão, manutenção e preparação do nosso parque de equipamentos</li>
      </ul>
      
      <h3>Próximos Passos</h3>
      <p>Os trabalhos de acabamento e organização interna estão em curso, e esperamos partilhar convosco o resultado final no segundo semestre deste ano. Esta nova infraestrutura representa não apenas mais espaço físico, mas um compromisso reforçado com a qualidade, eficiência e proximidade aos nossos clientes.</p>
      
      <p><em>Fiquem atentos às nossas atualizações. Temos muito mais para partilhar!</em></p>
      
      <p>Conheça as nossas instalações e serviços: <a href="https://www.ymrindustrial.com" target="_blank">www.ymrindustrial.com</a></p>
    `
  }
];

// ===== FUNÇÕES UTILITÁRIAS =====
export const getFeaturedPost = (): BlogPost | undefined => {
  return blogPosts.find(post => post.featured);
};

export const getRegularPosts = (): BlogPost[] => {
  return blogPosts.filter(post => !post.featured);
};

export const getPostById = (id: number): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

export const getPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
};
