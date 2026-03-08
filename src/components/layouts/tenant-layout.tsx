import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Buildings,
    CalendarCheck,
    Truck,
    Lifebuoy,
    UserCircle,
    SignOut,
} from "@phosphor-icons/react";

const navItems = [
    { label: "Properties", href: "/tenant/properties", icon: Buildings },
    { label: "My Visits", href: "/tenant/visits", icon: CalendarCheck },
    { label: "My Move-Ins", href: "/tenant/move-ins", icon: Truck },
    { label: "Support Tickets", href: "/tenant/tickets", icon: Lifebuoy },
    { label: "Profile", href: "/tenant/profile", icon: UserCircle },
];

export default function TenantLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="p-4">
                    <h2 className="text-lg font-semibold tracking-tight">RentEase</h2>
                    <p className="text-xs text-muted-foreground">Tenant Portal</p>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname.startsWith(item.href)}
                                        >
                                            <Link to={item.href}>
                                                <item.icon className="size-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <SidebarInset>
                {/* Top bar */}
                <header className="flex h-14 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium hidden sm:inline">
                                    {user?.name}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to="/tenant/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => logout()}>
                                <SignOut className="mr-2 size-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
