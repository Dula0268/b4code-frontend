import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "../ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

import { ChevronDown, SquareLibrary } from "lucide-react";

export default function NavigationSideBar() {
  const items = [
    {
      trainingAndDevelopmentMenu: "Training & Development",
      trianingAndDevelopmentSubMenu: [
        {
          title: "Training Plans",
          url: "/training-plan",
        },
        {
          title: "View Training Plans",
          url: "/view-training-plans",
        },
        {
          title: "Calendar",
          url: "#",
        },
        {
          title: "Search",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
        { 
          title: "Trainers",
          url: "/trainer"
        },
        { 
          title: "View Trainers",
          url: "/view-trainers"
        }
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="text-white">
                    <SquareLibrary />
                    <span className="ml-2">{items[0].trainingAndDevelopmentMenu}</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items[0].trianingAndDevelopmentSubMenu.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <a href={item.url}>
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
