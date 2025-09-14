'use client';

import { Cpu, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/language-context';

/**
 * Main application sidebar component
 * Provides navigation menu with branding and route-based active states
 * @param props - Sidebar component props
 * @returns Sidebar component with navigation menu
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t, isLoading: languageLoading } = useLanguage();
  const pathname = usePathname();

  if (languageLoading) {
    return (
      <Sidebar {...props}>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-2">
          <Link href="/">
            <Image
              src="/brand.png"
              alt="Vottia Brand"
              width="150"
              height="30"
              priority
              className="w-auto h-12"
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('menu.management')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/models')}
                >
                  <Link href="/models">
                    <Cpu className="size-4" />
                    <span>{t('menu.models')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/prompts')}
                >
                  <Link href="/prompts">
                    <FileText className="size-4" />
                    <span>{t('menu.prompts')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
