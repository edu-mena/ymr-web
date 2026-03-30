import PartnersCarousel from '../components/PartnersCarousel';
import { 
  Target, Eye, Heart, 
  Star, TrendingUp,
} from 'lucide-react';
import { companyValues } from '../data/companyValues';
import { aboutStats } from '../data/aboutData';
import { missionSection, visionSection, valuesSection, statsSection, testimonialSection } from '../data/aboutContent';

const About = () => {


  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">
      {/* ===== SEÇÃO MISSÃO E VISÃO ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <Target className="h-8 w-8 text-blue-900" />
                  </div>
                  <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{missionSection.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{missionSection.subtitle}</p>
                  </div>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {missionSection.description}
                </p>
              </div>
              
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <Eye className="h-8 w-8 text-blue-900" />
                  </div>
                  <div>
                  <h2 className="text-3xl font-bold text-gray-900">{visionSection.title}</h2>
                    <p className="text-gray-600 mt-1">{visionSection.subtitle}</p>
                  </div>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {visionSection.description}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://ymrindustrial.com/assets/about/3.jpg" 
                alt="Industrial facility"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Modern Industrial Solutions</h3>
                  <p className="text-sm opacity-90">State-of-the-art facilities and equipment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO VALORES DA EMPRESA ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Heart className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{valuesSection.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{valuesSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {valuesSection.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value) => (
              <div 
                key={value.title}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group"
              >
                <div className={`bg-gray-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="h-8 w-8 text-blue-900" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO ESTATÍSTICAS ===== */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">{statsSection.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{statsSection.title}</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {statsSection.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {aboutStats.map((stat) => (
              <div 
                key={stat.label}
                className="text-center rounded-2xl p-8 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO PARCEIROS ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PartnersCarousel />
        </div>
      </section>

      {/* ===== SEÇÃO DEPOIMENTO ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-3xl p-12 shadow-lg">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
            "{testimonialSection.quote}"
          </blockquote>
          <div className="flex items-center justify-center">
            <img 
              src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=200" 
              alt="Client testimonial"
                className="w-16 h-16 rounded-full mr-4 border-4 border-white shadow-lg"
            />
            <div className="text-left">
              <div className="font-semibold text-gray-900">{testimonialSection.authorName}</div>
              <div className="text-gray-600">{testimonialSection.authorRole}</div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;