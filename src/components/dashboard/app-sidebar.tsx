'use client';

import { Bot, Cpu, Workflow, Wrench } from 'lucide-react';
import Image from 'next/image';
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t, isLoading: languageLoading } = useLanguage();

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
          <a href="#">
            <Image
              src="/brand.svg"
              alt="Vottia Brand"
              className="h-8"
              width={32}
              height={32}
            />
          </a>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('menu.management')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/models">
                    <Cpu className="size-4" />
                    <span>{t('menu.models')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/agents">
                    <Bot className="size-4" />
                    <span>{t('menu.agents')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/workflows">
                    <Workflow className="size-4" />
                    <span>{t('menu.workflows')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/tools">
                    <Wrench className="size-4" />
                    <span>{t('menu.tools')}</span>
                  </a>
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
