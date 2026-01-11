import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ClipboardList, 
  TrendingUp, 
  Users, 
  KeyRound, 
  Package, 
  Settings 
} from 'lucide-react';

const quickActions = [
  {
    title: 'View All Orders',
    description: 'Manage and track orders',
    icon: ClipboardList,
    path: '/admin/orders',
    color: 'bg-serape-blue hover:bg-serape-blue-dark',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Revenue and insights',
    icon: TrendingUp,
    path: '/admin/analytics',
    color: 'bg-serape-green hover:bg-serape-green-dark',
  },
  {
    title: 'Manage Roles',
    description: 'User permissions',
    icon: Users,
    path: '/admin/roles',
    color: 'bg-serape-purple hover:bg-serape-purple-dark',
  },
  {
    title: 'Password Resets',
    description: 'User password support',
    icon: KeyRound,
    path: '/admin/passwords',
    color: 'bg-serape-cyan hover:bg-serape-cyan-dark',
  },
  {
    title: 'Kitchen Display',
    description: 'View kitchen orders',
    icon: Package,
    path: '/kitchen',
    color: 'bg-serape-orange hover:bg-serape-orange-dark',
  },
  {
    title: 'Settings',
    description: 'Configure system',
    icon: Settings,
    path: '/profile',
    color: 'bg-muted hover:bg-muted/80',
  },
];

function QuickActionsGridComponent() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            onClick={() => navigate(action.path)}
          >
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 transition-colors`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-base">{action.title}</CardTitle>
              <CardDescription className="text-xs">{action.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const QuickActionsGrid = memo(QuickActionsGridComponent);
