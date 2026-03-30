
import { useModalManager } from '../hooks/useModalManager';
import Modal from '../components/Modal';
import { Download, FileText, Eye, CheckCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Catalog = () => {

  // ===== GERENCIADOR DE MODAIS =====
  // Use IDs únicos para cada modal: 'catalog', 'error', 'success'
  const modal = useModalManager();

  // ===== DADOS DAS CARACTERÍSTICAS DO CATÁLOGO =====
  const catalogFeatures = [
    'Especificações completas dos produtos',
    'Certificações técnicas',
    'Diretrizes de instalação',
    'Instruções de manutenção',
    'Informações de segurança',
    'Preços e disponibilidade'
  ];

  // ===== FUNÇÃO DE DOWNLOAD COM TRATAMENTO DE ERRO =====
  const downloadCatalog = async () => {
    try {
      // Simula chamada de API ou download real
      const response = await fetch('/api/catalog/download');
      
      if (!response.ok) {
        throw new Error('Falha ao baixar catálogo');
      }
      
      // Se sucesso: fecha modal principal e abre modal de sucesso
      modal.closeModal('catalog');
      modal.openModal('success');
      
    } catch (error) {
      console.error('Erro no download:', error);
      
      // Se erro: fecha modal principal e abre modal de erro
      modal.closeModal('catalog');
      modal.openModal('error');
    }
  };

  // ===== FUNÇÃO DE RETRY =====
  const handleRetryDownload = () => {
    modal.closeModal('error'); // Fecha modal de erro
    downloadCatalog(); // Tenta novamente
  };

  return (
    <div className="min-h-screen page-content">

      {/* ===== SEÇÃO CONTEÚDO PRINCIPAL ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Conteúdo Informativo */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">O que está incluído:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalogFeatures.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Botão Download - Abre modal principal */}
                <button 
                  onClick={() => modal.openModal('catalog')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Baixar Catálogo PDF</span>
                </button>
                
                {/* Botão Visualizar - Também abre modal principal */}
                <button 
                  onClick={() => modal.openModal('catalog')} 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>Visualizar Online</span>
                </button>
              </div>
            </div>
            
            {/* Preview do Catálogo */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 p-3 rounded-xl mr-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Catálogo YMR Industrial 2024</h3>
                      <p className="text-blue-700 font-medium">Guia Completo de Produtos</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-gray-600">Tamanho:</span>
                      <div className="font-semibold text-gray-900">12.5 MB</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-gray-600">Páginas:</span>
                      <div className="font-semibold text-gray-900">156 páginas</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-gray-600">Formato:</span>
                      <div className="font-semibold text-gray-900">PDF</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-gray-600">Atualizado:</span>
                      <div className="font-semibold text-gray-900">Dez 2024</div>
                    </div>
                  </div>
                </div>
                
                {/* Páginas simuladas do catálogo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center hover:shadow-md transition-shadow duration-300">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Seção Escadas</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center hover:shadow-md transition-shadow duration-300">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Equipamentos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MODAL PRINCIPAL: INFORMAÇÃO SOBRE CATÁLOGO ===== */}
      <Modal
        isOpen={modal.isOpen('catalog')}
        onClose={() => modal.closeModal('catalog')}
        title="Catálogo YMR Industrial"
        description={
          <>
            <p className="mb-4">
              O catálogo completo está disponível para download em formato PDF.
            </p>
            <p className="text-sm text-gray-500">
              Para mais informações técnicas ou suporte personalizado,{' '}
              <Link
                to="/contact"
                onClick={() => modal.closeModal('catalog')}
                className="text-blue-600 font-semibold underline hover:text-blue-800 transition-colors"
              >
                entre em contato conosco
              </Link>.
            </p>
          </>
        }
        icon="info"
        iconColor="blue-600"
        iconBackground="blue-100"
        actions={[
          {
            label: 'Baixar PDF',
            onClick: downloadCatalog,
            variant: 'primary',
          },
          {
            label: 'Fechar',
            variant: 'secondary',
          },
        ]}
      />

      {/* ===== MODAL DE SUCESSO ===== */}
      <Modal
        isOpen={modal.isOpen('success')}
        onClose={() => modal.closeModal('success')}
        title="Download Iniciado! ✅"
        description="Seu catálogo está sendo baixado. Verifique sua pasta de downloads."
        icon="success"
        iconColor="green-600"
        iconBackground="green-100"
        actions={[
          {
            label: 'Voltar ao site',
            onClick: () => modal.closeModal('success'),
            variant: 'primary',
          },
        ]}
      />

      {/* ===== MODAL DE ERRO ===== */}
      <Modal
        isOpen={modal.isOpen('error')}
        onClose={() => modal.closeModal('error')}
        title="Erro ao Baixar ⚠️"
        description="Não foi possível iniciar o download. Por favor, tente novamente ou contate nosso suporte."
        icon="alert"
        iconColor="red-600"
        iconBackground="red-100"
        actions={[
          {
            label: 'Tentar Novamente',
            onClick: handleRetryDownload,
            variant: 'primary',
          },
          {
            label: 'Contatar Suporte',
            href: '/contact',
            variant: 'link',
          },
          {
            label: 'Fechar',
            onClick: () => modal.closeModal('error'),
            variant: 'secondary',
          },
        ]}
      />

    </div>
  );
};

export default Catalog;