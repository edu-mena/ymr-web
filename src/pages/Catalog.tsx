import { FileText, Clock, Award, CheckCircle } from 'lucide-react';
import NewsletterSubscribe from '../components/NewsletterSubscribe';

const Catalog = () => {
  return (
    <div className="min-h-screen page-content">

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Clock className="h-4 w-4" />
                In Preparation
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                YMR Industrial Catalog<br />
                <span className="text-blue-600">2024</span>
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Our complete product catalog is being finalized and will be available soon.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Sign up for our newsletter and be the first to know when the catalog is available for download.
              </p>

              <NewsletterSubscribe variant="card" />
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 opacity-60 select-none">

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-5">
                    <div className="bg-gray-400 p-3 rounded-xl mr-4 shrink-0">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">CYMR Industrial Catalog 2024</h3>
                      <p className="text-gray-500 font-medium">Complete Product Guide</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Size</span>
                      <div className="font-semibold text-gray-400">— —</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Pages</span>
                      <div className="font-semibold text-gray-400">— —</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Format</span>
                      <div className="font-semibold text-gray-400">PDF</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Available</span>
                      <div className="font-semibold text-gray-400">Coming Soon</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-400">Staircases Section</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-400">Equipment</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white border-2 border-amber-300 shadow-xl rounded-2xl px-6 py-4 text-center rotate-[-2deg]">
                  <Clock className="h-7 w-7 text-amber-500 mx-auto mb-1" />
                  <p className="font-bold text-gray-900 text-lg">Coming Soon</p>
                  <p className="text-gray-500 text-sm">Available soon</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Catalog;
