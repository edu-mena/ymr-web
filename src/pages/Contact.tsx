import React, { useState, useEffect } from 'react';
// integração com a API real usando o hook personalizado (descomente quando tiver a API pronta)
import { useContactPage } from '../hooks/useContactPage';
import {
  Send, MessageCircle, Phone, Mail,
  CheckCircle, AlertCircle, User, Building,
  ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const Contact = () => {
  const { isAuthenticated, user } = useAuth();
  const { info: contactInfo, faqs: contactFaqs, map: contactMap } = useContactPage();

  type ContactFormData = {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    subject: string;
    message: string;
  };

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const nameFromUser = user?.name;
  const emailFromUser = user?.email;
  // ===== PRÉ-PREENCHIMENTO PARA UTILIZADORES AUTENTICADOS =====
  useEffect(() => {
    if (!isAuthenticated) return;

    const prefill = async () => {
      try {
        const res = await apiFetch('/auth/profile');
        const apiUser = res.user as { name?: string; email?: string; phone?: string; company?: string };
        setFormData(prev => ({
          ...prev,
          fullName: apiUser.name ?? prev.fullName,
          email:    apiUser.email ?? prev.email,
          phone:    apiUser.phone ?? prev.phone,
          company:  apiUser.company ?? prev.company,
        }));
      } catch {
        // Fallback: usa os dados básicos do contexto de auth
        if (nameFromUser) {
          setFormData(prev => ({ ...prev, fullName: nameFromUser }));
        }
        if (emailFromUser) {
          setFormData(prev => ({ ...prev, email: emailFromUser }));
        }
      }
    };

    prefill();
  }, [isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData(prev => ({
        // Mantém os dados pessoais preenchidos, limpa só subject e message
        ...prev,
        subject: '',
        message: ''
      }));
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const subjectOptions = [
    { value: '', label: 'Selecione o assunto...' },
    { value: 'Solicitação de Produto',           label: 'Solicitação de Produto' },
    { value: 'Relatar Problemas no website',     label: 'Relatar Problemas no Website' },
    { value: 'Solicitação de Serviço',           label: 'Solicitação de Serviço' },
    { value: 'Outro',                            label: 'Outro' },
  ];

  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">
      {/* HERO */}
      <section className="relative bg-gray-50 text-white py-6 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 text-center">
        </div>
      </section>

      {/* FORMULÁRIO + INFO */}
      <section className="pb-10 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Formulário */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 border border-gray-100 dark:border-gray-700">
              <div className="mb-6 md:mb-8">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="p-2 md:p-3 bg-blue-100 rounded-xl mr-3 md:mr-4">
                    <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm md:text-base">
                      {isAuthenticated
                        ? 'Os seus dados foram preenchidos automaticamente.'
                        : "We'll respond within 24 hours"}
                    </p>
                  </div>
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 font-medium">Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-medium">Failed to send message. Please try again.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Nome + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Telefone + Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your company"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject — select */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    >
                      {subjectOptions.map(opt => (
                        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {/* Seta custom (o select nativo esconde a default com appearance-none) */}
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tell us about your project or requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Informações de Contato */}
            <div>
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Get in Touch</h2>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                  We're here to help with all your industrial equipment needs. Choose the best way to reach us.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {contactInfo.map((info) => (
                  <div
                    key={info.title}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 md:p-3 rounded-xl mr-3 md:mr-4">
                        <info.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">{info.title}</h3>
                        <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                          {Array.isArray(info.details) ? (
                            info.details.map((detail, i) => (
                              <p key={i} className="mb-1 text-sm md:text-base">{detail}</p>
                            ))
                          ) : (
                            <p className="text-sm md:text-base">{info.details}</p>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Mapa */}
          <div className="mt-12 md:mt-16">
            <div className="relative rounded-2xl h-64 md:h-80 overflow-hidden shadow-lg group">

              {contactMap && (
                <iframe
                  src={`https://www.google.com/maps?q=${contactMap.lat},${contactMap.lng}&z=17&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
                <div className="text-center text-white z-10 px-4">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">
                    {contactMap?.title ?? 'Visit Our Office'}
                  </h3>
                  <p className="text-sm md:text-base mb-1">
                    {contactMap?.address ?? ''}
                  </p>
                  <p className="text-sm md:text-base">
                    {contactMap?.city ?? ''}
                  </p>
                  <button
                    onClick={() => window.open(contactMap?.directionsUrl ?? '#', '_blank')}
                    className="mt-4 bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
                  >
                    Get Directions
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions about our products and services.
            </p>
          </div>

          <div className="space-y-4">
            {contactFaqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-xl"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;