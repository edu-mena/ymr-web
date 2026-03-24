// src/components/AsideNewsletter/index.tsx
export default function AsideNewsletter() {

  return (
    <>
      <div className="bg-[#e6e6e6] dark:bg-gray-800 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Newsletter YMR</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Receba ofertas exclusivas e novidades do setor industrial</p>
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="Seu e-mail"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg text-black dark:text-gray-100 placeholder-gray-900 dark:placeholder-gray-300 text-sm focus:outline-none focus:border-red-500"
          />
          <button className="w-full bg-blue-900 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors">
            Subscrever
          </button>
        </div>
      </div>
    </>
  );
}
