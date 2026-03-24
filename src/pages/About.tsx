import { useState } from 'react';
import PartnersCarousel from '../components/PartnersCarousel';
import { 
  Target, Eye, Heart, 
  ArrowRight, Star, TrendingUp,
  Calendar, MessageCircle, BookOpen, X
} from 'lucide-react';
import { getFeaturedPost, getRegularPosts, type BlogPost } from '../data/blogPosts';
import { aboutStats } from '../data/aboutData';
import { companyValues } from '../data/companyValues';
import { aboutHero, missionSection, visionSection, valuesSection, statsSection, testimonialSection, blogSection } from '../data/aboutContent';

const About = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

  // ===== DADOS IMPORTADOS DE companyValues.ts =====

  // ===== DADOS DOS BLOGS =====

  // ===== DADOS DOS BLOGS =====
  const featuredPost = getFeaturedPost();
  const regularPosts = getRegularPosts();
  const displayedPosts = showAllPosts ? regularPosts : regularPosts.slice(0, 3);

  // ===== FUNÇÕES DO MODAL =====
  const openModal = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">
      {/* ===== SEÇÃO HERO - CABEÇALHO PRINCIPAL ===== */}
      <section className="relative text-white pt-7 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-blue-100 space-x-2 text-blue-900 backdrop-blur-sm rounded-full px-4 py-2">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">About US</span>
          </div>
        </div>
      </section>

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

      {/* ===== SEÇÃO BLOG ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800" id="blog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{blogSection.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{blogSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {blogSection.description}
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16"  id={`blog-${featuredPost.id}`}>
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {blogSection.featuredLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {featuredPost.category}
                      </span>
                      <span className="text-gray-500 text-sm">{featuredPost.readTime}</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=40" 
                          alt={featuredPost.author}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{featuredPost.author}</div>
                          <div className="text-gray-500 text-sm">{featuredPost.date}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openModal(featuredPost)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <span>{blogSection.readMore}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPosts.map((post) => (
              <div key={post.id} id={`blog-${post.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-gray-500 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {post.date}
                    </span>
                    <span className="text-gray-500 text-sm">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <img 
                        src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=32" 
                        alt={post.author}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-900">{post.author}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openModal(post)}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <span>{blogSection.readMore}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Posts Button */}
          {regularPosts.length > 3 && (
            <div className="text-center mt-12">
              <button 
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <span>{showAllPosts ? blogSection.showLess : blogSection.viewAllPosts}</span>
                <ArrowRight className={`h-5 w-5 transition-transform duration-200 ${showAllPosts ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== MODAL DO BLOG ===== */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header do Modal */}
            <div className="relative">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-800 rounded-full p-2 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedPost.category}
                </span>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-gray-500 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {selectedPost.date}
                </span>
                <span className="text-gray-500 text-sm">{selectedPost.readTime}</span>
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=32" 
                    alt={selectedPost.author}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-900">{selectedPost.author}</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedPost.title}
              </h1>

              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            </div>

            {/* Footer do Modal */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=40" 
                    alt={selectedPost.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{selectedPost.author}</div>
                    <div className="text-gray-500 text-sm">{blogSection.team}</div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  {blogSection.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;