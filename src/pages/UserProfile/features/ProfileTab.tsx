import { UserCheck, Edit3, Save } from 'lucide-react';

type Props = {
  userData: any;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  handleSave: () => void;
  setUserData: (data: any) => void;
};

const ProfileTab = ({
  userData,
  isEditing,
  setIsEditing,
  handleSave,
  setUserData,
}: Props) => {
  return (
    <>
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gapy-2 px-3 mb-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-1 rounded-xl">
                    <UserCheck className="h-6 w-6 text-gray-900" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Detalhes Pessoais</h3>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="flex items-center gap-2 px-2 py-2 text-xs rounded-xl transition-all duration-300 transform hover:scale-105 bg-gray-900 text-white"
                >
                    {isEditing ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                    {isEditing ? 'Salvar' : 'Editar'}
                </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gapy-2 px-3 md:gap-6">
                {/* Nome */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Nome Completo</label>
                    {isEditing ? (
                    <input type="text" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.name}</div>
                    )}
                </div>
                {/* Email */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.email}</div>
                </div>
                {/* Telefone */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Telefone</label>
                    {isEditing ? (
                    <input type="tel" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.phone}</div>
                    )}
                </div>
                {/* Data de nascimento */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Data de Nascimento</label>
                    {isEditing ? (
                    <input type="date" value={userData.birthDate} onChange={e => setUserData({ ...userData, birthDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">
                        {userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('pt-BR') : '—'}
                    </div>
                    )}
                </div>
                {/* Empresa */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Empresa</label>
                    {isEditing ? (
                    <input type="text" value={userData.company} onChange={e => setUserData({ ...userData, company: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.company}</div>
                    )}
                </div>
                {/* Cargo */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Cargo</label>
                    {isEditing ? (
                    <input type="text" value={userData.position} onChange={e => setUserData({ ...userData, position: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.position}</div>
                    )}
                </div>
                </div>
            </div>
        </div>
    </>
  );
};

export default ProfileTab;