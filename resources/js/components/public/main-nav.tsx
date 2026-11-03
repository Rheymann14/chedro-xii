import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { SmartLink } from '@/components/public/smart-link';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { search } from '@/routes';
import type { MenuLink } from '@/types';

/**
 * Primary site navigation. Desktop shows dropdown menus; phones and tablets
 * get a slide-in drawer with collapsible groups.
 */
export function MainNav() {
    const { site } = usePage().props;
    const items = site.menus.header;

    return (
        <nav
            aria-label="Main"
            className="sticky top-0 z-40 border-b bg-surface"
        >
            <div className="container-page flex h-14 items-center justify-between gap-2 lg:justify-start">
                <DesktopMenu items={items} />
                <MobileMenu items={items} />

                <Link
                    href={search()}
                    className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold hover:bg-accent lg:hidden"
                >
                    <Search className="size-4" aria-hidden />
                    <span>Search</span>
                </Link>
            </div>
        </nav>
    );
}

const navItemClass =
    'h-14 rounded-none bg-transparent px-3 text-[0.8rem] font-semibold tracking-wide text-foreground uppercase hover:bg-transparent hover:text-primary focus:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary data-[active=true]:shadow-[inset_0_-3px_0_var(--flag-red)] data-[state=open]:bg-transparent data-[state=open]:text-primary xl:px-3.5';

function useIsActive() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (item: MenuLink): boolean => {
        if (item.url === '/') {
            return isCurrentUrl('/');
        }

        if (item.url.startsWith('/') && isCurrentOrParentUrl(item.url)) {
            return true;
        }

        return item.children.some(
            (child) =>
                child.url.startsWith('/') && isCurrentOrParentUrl(child.url),
        );
    };
}

function DesktopMenu({ items }: { items: MenuLink[] }) {
    const isActive = useIsActive();

    return (
        <NavigationMenu viewport={false} className="hidden lg:flex">
            <NavigationMenuList className="gap-0">
                {items.map((item) => (
                    <NavigationMenuItem key={item.id}>
                        {item.children.length > 0 ? (
                            <>
                                <NavigationMenuTrigger
                                    data-active={isActive(item)}
                                    className={navItemClass}
                                >
                                    {item.label}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-72 gap-0.5 p-1.5">
                                        {item.children.map((child) => (
                                            <li key={child.id}>
                                                <NavigationMenuLink asChild>
                                                    <SmartLink
                                                        href={child.url}
                                                        newTab={
                                                            child.opens_in_new_tab
                                                        }
                                                        prefetch
                                                    >
                                                        {child.label}
                                                    </SmartLink>
                                                </NavigationMenuLink>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <NavigationMenuLink
                                asChild
                                data-active={isActive(item)}
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    navItemClass,
                                )}
                            >
                                <SmartLink
                                    href={item.url}
                                    newTab={item.opens_in_new_tab}
                                    prefetch
                                >
                                    {item.label}
                                </SmartLink>
                            </NavigationMenuLink>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

function MobileMenu({ items }: { items: MenuLink[] }) {
    const [open, setOpen] = useState(false);
    const isActive = useIsActive();
    const close = () => setOpen(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold uppercase hover:bg-accent lg:hidden">
                <Menu className="size-5" aria-hidden />
                <span>Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-[85vw] gap-0 p-0">
                <SheetHeader className="border-b bg-surface">
                    <SheetTitle>CHED Regional Office XII</SheetTitle>
                    <SheetDescription>Site navigation</SheetDescription>
                </SheetHeader>
                <ul className="flex-1 overflow-y-auto p-2">
                    {items.map((item) =>
                        item.children.length > 0 ? (
                            <li key={item.id}>
                                <Collapsible defaultOpen={isActive(item)}>
                                    <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left font-medium hover:bg-accent">
                                        {item.label}
                                        <ChevronDown
                                            className="size-4 transition-transform group-data-[state=open]:rotate-180"
                                            aria-hidden
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="mb-1 ml-3 border-l pl-2">
                                            {item.children.map((child) => (
                                                <li key={child.id}>
                                                    <SmartLink
                                                        href={child.url}
                                                        newTab={
                                                            child.opens_in_new_tab
                                                        }
                                                        onClick={close}
                                                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                                    >
                                                        {child.label}
                                                    </SmartLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>
                            </li>
                        ) : (
                            <li key={item.id}>
                                <SmartLink
                                    href={item.url}
                                    newTab={item.opens_in_new_tab}
                                    onClick={close}
                                    className={cn(
                                        'block rounded-md px-3 py-2.5 font-medium hover:bg-accent',
                                        isActive(item) && 'text-primary',
                                    )}
                                >
                                    {item.label}
                                </SmartLink>
                            </li>
                        ),
                    )}
                </ul>
            </SheetContent>
        </Sheet>
    );
}
