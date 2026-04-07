import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Settings2, Zap, Database, Wrench, Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api';
import {
  ANGOLA_PROVINCES,
  RENTAL_DURATIONS,
  SUPPORT_PLANS,
} from './quoteData';
import type { RentalSpec, RentalCategory, RentalCategoriesResponse } from './quoteData';

// Icon mapping per category slug
const categoryIcons: Record<string, typeof Settings2> = {
  compressores: Settings2,
  geradores: Zap,
  tanques: Database,
  manut_compressor: Wrench,
  manut_gerador: Wrench,
  manut_tanques: Wrench,
};

// Slug → icon fallback from label keywords
const iconForCategory = (slug: string, label: string): typeof Settings2 => {
  if (categoryIcons[slug]) return categoryIcons[slug];
  const lower = label.toLowerCase();
  if (lower.includes('compress')) return Settings2;
  if (lower.includes('gerad')) return Zap;
  if (lower.includes('tanque') || lower.includes('bomba')) return Database;
  return Wrench;
};

const firstSpecIndex = (cat: RentalCategory | undefined): number =>
  cat && cat.specs.length > 0 ? 0 : -1;

interface RentalQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

const RentalQuoteModal = ({ isOpen, onClose, initialCategory = '' }: RentalQuoteModalProps) => {
  // — Data from API —
  const [categories, setCategories] = useState<Record<string, RentalCategory>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // — Form state —
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [specIndex, setSpecIndex] = useState<number>(0);

  const [province, setProvince] = useState('');
  const [duration, setDuration] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [workReason, setWorkReason] = useState('');
  const [supportPlan, setSupportPlan] = useState('none');
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res: RentalCategoriesResponse = await apiFetch('/rental/categories', { noAuth: true });
        if (cancelled) return;
        if (res.success && res.data) {
          setCategories(res.data);
          // Set initial category
          if (initialCategory && res.data[initialCategory]) {
            setSelectedCategory(initialCategory);
            setSpecIndex(firstSpecIndex(res.data[initialCategory]));
          } else {
            const keys = Object.keys(res.data);
            if (keys.length > 0) {
              setSelectedCategory(keys[0]);
              setSpecIndex(firstSpecIndex(res.data[keys[0]]));
            }
          }
        } else {
          setError('Sem dados de categorias disponíveis.');
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || 'Erro ao carregar categorias.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, initialCategory]);

  // Reset specIndex when category changes
  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setSpecIndex(firstSpecIndex(categories[catId]));
  }, [categories]);

  const category = categories[selectedCategory] as RentalCategory | undefined;
  if (!category && !loading && !error) return null;

  const currentSpec = category?.specs?.[specIndex];
  const isAvailable = currentSpec?.available ?? true;
  const CatIcon = category ? iconForCategory(category.id, category.label) : Settings2;

  const getSpecLabel = (spec: RentalSpec): string => spec.spec_value;
  const specImage = currentSpec?.image ?? category?.categoryImage ?? '';

  const equipmentCategories = Object.values(categories).filter(c => c.type === 'equipment');
  const serviceCategories = Object.values(categories).filter(c => c.type === 'service');

  // — Submit handler —
  const handleSubmit = async () => {
    if (!isAvailable || !category) return;

    setSubmitting(true);
    const quoteData = {
      category_id: category.id,
      spec_id: currentSpec?.id,
      province,
      duration: duration === 'Personalizado' ? customDuration : duration,
      work_reason: workReason,
      support_plan: supportPlan,
    };

    try {
      const res = await apiFetch('/rental/quote', {
        method: 'POST',
        body: JSON.stringify(quoteData),
      });
      if (res.success) {
        alert('Solicitação de cotação enviada com sucesso!');
        onClose();
      }
    } catch (err: any) {
      alert('Erro ao enviar solicitação: ' + (err.message ?? 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form on close
  const handleClose = () => {
    setProvince('');
    setDuration('');
    setCustomDuration('');
    setWorkReason('');
    setSupportPlan('none');
    onClose();
  };

  if (!isOpen) return null;

  // — Loading state —
  if (loading) {
    return (
      <Fragment>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 flex flex-col items-center gap-3 animate-fade-in-up">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        </div>
      </Fragment>
    );
  }

  // — Error state —
  if (error || !category) {
    return (
      <Fragment>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in-up">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Erro</h3>
            <p className="text-sm text-gray-500 mb-4">{error || 'Categoria não encontrada.'}</p>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">

          {/* ── Hero: imagem da categoria em fundo ── */}
          <div className="relative h-44 rounded-t-2xl overflow-hidden">
            <img
              src={category.categoryImage}
              alt={category.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/30" />

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Availability badge */}
            <div className="absolute top-3 left-4">
              {isAvailable ? (
                <span className="inline-flex items-center gap-1 bg-green-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Disponível
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-red-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> Indisponível
                </span>
              )}
            </div>

            {/* Bottom row: category info (left) + spec thumbnail (right) */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">

              {/* Left: icon + category label */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-blue-600/80 rounded-xl p-2 shrink-0">
                  <CatIcon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">
                    {category.type === 'equipment' ? 'Equipamento' : 'Serviço'}
                  </p>
                  <p className="text-white font-bold text-lg leading-tight truncate">
                    {category.label}
                  </p>
                </div>
              </div>

              {/* Right: spec thumbnail + label */}
              {currentSpec?.image && (
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                    <img
                      src={currentSpec.image}
                      alt={getSpecLabel(currentSpec)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white/70 text-xs text-right max-w-[130px] truncate leading-tight">
                    {getSpecLabel(currentSpec)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Form body ── */}
          <div className="p-6 space-y-5">

            {/* Row 1: Equipamento + Capacidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Equipamento / Serviço
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {equipmentCategories.length > 0 && (
                    <optgroup label="Equipamentos">
                      {equipmentCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </optgroup>
                  )}
                  {serviceCategories.length > 0 && (
                    <optgroup label="Serviços">
                      {serviceCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {category.type === 'equipment' ? 'Capacidade / Modelo' : 'Tipo de Serviço'}
                </label>
                <select
                  value={specIndex}
                  onChange={(e) => setSpecIndex(Number(e.target.value))}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white ${
                    !isAvailable
                      ? 'border-red-200 ring-1 ring-red-200 focus:ring-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  {category.specs.map((spec, idx) => {
                    const ava = spec.available;
                    return (
                      <option key={idx} value={idx} disabled={!ava}>
                        {spec.spec_value} {ava ? '' : '(Indisponível)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Row 2: Duração + Localização */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tempo de Aluguer / Serviço
                </label>
                <select
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    if (e.target.value !== 'Personalizado') setCustomDuration('');
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Selecionar...</option>
                  {RENTAL_DURATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {duration === 'Personalizado' && (
                  <textarea
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Descreva a duração necessária..."
                    rows={2}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Localização
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Selecionar província...</option>
                  {ANGOLA_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Motivo do Trabalho
              </label>
              <textarea
                value={workReason}
                onChange={(e) => setWorkReason(e.target.value)}
                placeholder="Descreva brevemente o motivo ou contexto do trabalho..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Plano de Suporte */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Plano de Suporte
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SUPPORT_PLANS.map(plan => (
                  <label
                    key={plan.value}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      supportPlan === plan.value
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="supportPlan"
                      value={plan.value}
                      checked={supportPlan === plan.value}
                      onChange={(e) => setSupportPlan(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-gray-700">{plan.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Unavailability warning */}
            {!isAvailable && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600">
                  Este {category.type === 'equipment' ? 'equipamento' : 'serviço'} está actualmente indisponível.
                  Entre em contacto directo para alternativas.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                A nossa equipa responde em até{' '}
                <span className="text-gray-500 font-medium">2 dias úteis</span>{' '}
                com uma proposta detalhada.
              </p>
              <button
                onClick={handleSubmit}
                disabled={!isAvailable || submitting}
                className={`shrink-0 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  isAvailable && !submitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Enviando...' : isAvailable ? 'Solicitar Cotação' : 'Indisponível'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default RentalQuoteModal;
