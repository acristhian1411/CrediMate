import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import TableChartIcon from '@mui/icons-material/TableChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
export const sidebarRoutes = [
    {
        groupname: 'General',
        groupicon: HomeIcon,
        nonIterative: true,
        routes:[
            {
                path: '/',
                name: 'Inicio',
                icon: HomeIcon,
            },
        ]
    },
    // {
    //     groupname: 'Académica',
    //     groupicon: SchoolIcon,
    //     nonIterative: false,
    //     routes:[
    //         {
    //             path: '/',
    //             name: 'Dashboard',
    //             icon: HomeIcon,
    //         },
    //     ]
    // },
    {
        groupname: 'Administrativa',
        groupicon: BusinessIcon,
        nonIterative: false,
        routes:[
            {
                path: '/clientes',
                name: 'Clientes',
                icon: HomeIcon,
            },
            {
                path: '/creditos',
                name: 'Créditos',
                icon: TableChartIcon,
            }
        ]
    },
    // { 
    //     groupname: 'Definiciones',
    //     groupicon: AssignmentIcon,
    //     nonIterative: false,
    //     routes:[
    //         {
    //             path: '/paises',
    //             name: 'Paises',
    //             icon: TableChartIcon,
    //         },
    //         {
    //             path: '/departamentos',
    //             name: 'Departamentos',
    //             icon: TableChartIcon,
    //         },
    //     ]
    // },
    // { 
    //     groupname: 'Personas',
    //     groupicon: PersonIcon,
    //     nonIterative: false,
    //     routes:[
    //         {
    //             path: '/personas',
    //             name: 'Personas',
    //             icon: PersonIcon,
    //         }
    //     ]
    // },
    { 
        groupname: 'Reportes',
        groupicon: TrendingUpIcon,
        nonIterative: false,
        routes:[
            {
                path: '/profile',
                name: 'Perfil',
                icon: PersonIcon,
            }
        ]
    },
    // { 
    //     groupname: 'Config',
    //     groupicon: SettingsIcon,
    //     nonIterative: false,
    //     routes:[
    //         {
    //             path: '/logs',
    //             name: 'Logs',
    //             icon: TableChartIcon,
    //         }
    //     ]
    // },
];