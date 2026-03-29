import { Activity } from 'lucide-react';

type UserActivity = {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
};


type Props = {
    recentActivities: UserActivity[];
    iconMap: { [key: string]: React.ComponentType<{ className?: string }> };
};


const ActivityTab = ({
    recentActivities,
    iconMap
}: Props) => {
  return (
    <>
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Atividades Recentes</h3>
                {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                    <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma atividade registrada</p>
                </div>
                ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {recentActivities.map(activity => {
                    const IconComponent = iconMap[activity.icon] || Activity;
                    return (
                        <div key={activity.id} className="flex items-center gap-3 px-3 py-2 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                        <div className={`p-2.5 md:p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-300 ${activity.color}`}>
                            <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{activity.title}</p>
                            {activity.description && <p className="text-xs md:text-sm text-gray-500">{activity.description}</p>}
                            <p className="text-xs md:text-sm text-gray-400 mt-1">{activity.time}</p>
                        </div>
                        </div>
                    );
                    })}
                </div>
                )}
            </div>
        </div>
    </>
  );
}
export default ActivityTab; 