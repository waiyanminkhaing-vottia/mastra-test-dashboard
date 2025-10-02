'use client';

import { Bot, Cpu, FileText, Plug, Wrench } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

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
import { getAssetPath } from '@/lib/utils';

/**
 * Main application sidebar component
 * Provides navigation menu with branding and route-based active states
 * @param props - Sidebar component props
 * @returns Sidebar component with navigation menu
 */
export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
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
              src={getAssetPath('/brand.png')}
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
                  isActive={pathname.startsWith('/tools')}
                >
                  <Link href="/tools">
                    <Wrench className="size-4" />
                    <span>{t('menu.tools')}</span>
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/mcps')}
                >
                  <Link href="/mcps">
                    <Plug className="size-4" />
                    <span>{t('menu.mcps')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/agents')}
                >
                  <Link href="/agents">
                    <Bot className="size-4" />
                    <span>{t('menu.agents')}</span>
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
