import { useModalManager } from '../hooks/useModalManager';
import Modal from '../components/Modal';
import { Download, FileText, Eye, CheckCircle, Building2, Globe, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// ===== LANGUAGE CONFIG =====
const PROFILE_VERSIONS = [
  {
    id: 'en',
    label: 'English',
    flag: '🇬🇧',
    file: 'https://ymrindustrial.com/assets/files/YMR%20Perfil%20da%20Empresa%20(en).pdf',
    filename: 'YMR_Company_Profile_EN.pdf',
    size: '8.82 MB',
    pages: '31 pages',
    updated: 'Mar 2026',
  },
  {
    id: 'pt',
    label: 'Português',
    flag: '🇵🇹',
    file: 'https://ymrindustrial.com/assets/files/YMR%20Perfil%20da%20Empresa%20(pt).pdf',
    filename: 'YMR_Perfil_Empresa_PT.pdf',
    size: '13.8 MB',
    pages: '42 páginas',
    updated: 'Mar 2026',
  },
] as const;

type LangId = (typeof PROFILE_VERSIONS)[number]['id'];

const CompanyProfile = () => {

  // ===== MODAL MANAGER =====
  const modal = useModalManager();

  // ===== WHAT'S INCLUDED =====
  const profileFeatures = [
    'Company history & milestones',
    'Mission, vision & core values',
    'Products & services overview',
    'Technical certifications',
    'Key partnerships & brands',
    'Team & organisational structure',
  ];

  // ===== DOWNLOAD HANDLER =====
  const downloadProfile = (langId: LangId) => {
    const version = PROFILE_VERSIONS.find((v) => v.id === langId);
    if (!version) return;

    try {
      const link = document.createElement('a');
      link.href = version.file;
      link.download = version.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      modal.closeModal('profile');
      modal.openModal('success');
    } catch (error) {
      console.error('Download error:', error);
      modal.closeModal('profile');
      modal.openModal('error');
    }
  };

  return (
    <div className="min-h-screen page-content">

      {/* ===== MAIN SECTION ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: Info ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Building2 className="h-4 w-4" />
                Official Document
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                YMR Industrial<br />
                <span className="text-blue-600">Company Profile</span>
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Get the complete overview of who we are, what we do, and why leading companies across Angola and beyond trust YMR Industrial for their equipment needs.
              </p>

              <div className="mb-10">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's included:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => modal.openModal('profile')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>

                <a
                  href={PROFILE_VERSIONS[0].file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 no-underline"
                >
                  <Eye className="h-5 w-5" />
                  Preview Online
                </a>
              </div>
            </div>

            {/* ── Right: Document card ── */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">

                {/* Document header */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-5">
                    <div className="bg-blue-600 p-3 rounded-xl mr-4 shrink-0">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">YMR Industrial</h3>
                      <p className="text-blue-700 font-medium">Company Profile 2025</p>
                    </div>
                  </div>

                  {/* Two language versions side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {PROFILE_VERSIONS.map((v) => (
                      <div key={v.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-base leading-none">{v.flag}</span>
                          <span className="font-semibold text-gray-900">{v.label}</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div>{v.size} · {v.pages}</div>
                          <div>Updated {v.updated}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section previews */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center hover:shadow-md transition-shadow duration-300">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Our Presence</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center hover:shadow-md transition-shadow duration-300">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Our Team</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center hover:shadow-md transition-shadow duration-300">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Certifications</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center hover:shadow-md transition-shadow duration-300">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== MODAL: CHOOSE LANGUAGE ===== */}
      <Modal
        isOpen={modal.isOpen('profile')}
        onClose={() => modal.closeModal('profile')}
        title="YMR Industrial — Company Profile"
        description={
          <>
            <p className="mb-6">
              The Company Profile is available in two languages. Choose your preferred version below.
            </p>

            {/* Language download cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {PROFILE_VERSIONS.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col items-start gap-2 border-2 border-gray-100 bg-gray-50 rounded-xl p-4 text-left transition-all duration-200 focus-within:border-blue-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl leading-none">{v.flag}</span>
                    <span className="font-semibold text-gray-900">{v.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <div>{v.size} · {v.pages}</div>
                    <div>Updated {v.updated}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => downloadProfile(v.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 text-xs font-semibold hover:text-blue-800 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </button>
                    <a
                      href={v.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-gray-600 text-xs font-semibold hover:text-gray-800 transition-colors no-underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              Need a custom presentation or have specific questions?{' '}
              <Link
                to="/contact"
                onClick={() => modal.closeModal('profile')}
                className="text-blue-600 font-semibold underline hover:text-blue-800 transition-colors"
              >
                Contact our team
              </Link>.
            </p>
          </>
        }
        icon="info"
        iconColor="blue-600"
        iconBackground="blue-100"
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
          },
        ]}
      />

      {/* ===== MODAL: SUCCESS ===== */}
      <Modal
        isOpen={modal.isOpen('success')}
        onClose={() => modal.closeModal('success')}
        title="Download started ✅"
        description="Your Company Profile is downloading. Check your downloads folder."
        icon="success"
        iconColor="green-600"
        iconBackground="green-100"
        actions={[
          {
            label: 'Back to site',
            onClick: () => modal.closeModal('success'),
            variant: 'primary',
          },
        ]}
      />

      {/* ===== MODAL: ERROR ===== */}
      <Modal
        isOpen={modal.isOpen('error')}
        onClose={() => modal.closeModal('error')}
        title="Download failed ⚠️"
        description="We couldn't start the download. Please try again or reach out to our support team."
        icon="alert"
        iconColor="red-600"
        iconBackground="red-100"
        actions={[
          {
            label: 'Try again',
            onClick: () => modal.openModal('profile'),
            variant: 'primary',
          },
          {
            label: 'Contact support',
            href: '/contact',
            variant: 'link',
          },
          {
            label: 'Close',
            onClick: () => modal.closeModal('error'),
            variant: 'secondary',
          },
        ]}
      />

    </div>
  );
};

export default CompanyProfile;