import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    FileText,
    FolderOpen,
    Globe,
    Images,
    LayoutGrid,
    ListTree,
    Newspaper,
    NotebookText,
    Settings,
    Tags,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { home } from '@/routes';
import { dashboard } from '@/routes/admin';
import banners from '@/routes/admin/banners';
import downloadCategories from '@/routes/admin/download-categories';
import downloads from '@/routes/admin/downloads';
import issuanceTypes from '@/routes/admin/issuance-types';
import issuances from '@/routes/admin/issuances';
import menuItems from '@/routes/admin/menu-items';
import pages from '@/routes/admin/pages';
import posts from '@/routes/admin/posts';
import settings from '@/routes/admin/settings';
import users from '@/routes/admin/users';
import type { NavItem } from '@/types';

const contentNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, exact: true },
    { title: 'Posts', href: posts.index(), icon: Newspaper },
    { title: 'Regional Memoranda', href: issuances.index(), icon: FileText },
    { title: 'Issuance Types', href: issuanceTypes.index(), icon: Tags },
    { title: 'Downloads', href: downloads.index(), icon: FolderOpen },
    {
        title: 'Download Categories',
        href: downloadCategories.index(),
        icon: Tags,
    },
    { title: 'Home Banners', href: banners.index(), icon: Images },
    { title: 'Pages', href: pages.index(), icon: NotebookText },
];

const adminNavItems: NavItem[] = [
    { title: 'Menus', href: menuItems.index(), icon: ListTree },
    { title: 'Users', href: users.index(), icon: Users },
    { title: 'Office Information', href: settings.edit(), icon: Settings },
];

const footerNavItems: NavItem[] = [
    { title: 'View public site', href: home(), icon: Globe },
    {
        title: 'CHED Central Office',
        href: 'https://ched.gov.ph',
        icon: Building2,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={contentNavItems} label="Content" />
                {auth.user?.role === 'admin' && (
                    <NavMain items={adminNavItems} label="Administration" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
