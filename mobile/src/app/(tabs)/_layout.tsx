import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import {
  IconAccount,
  IconCalls,
  IconChat,
  IconHub,
  IconVybe,
} from "@/components/icons";
import { hasChatUnread } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { c } from "@/theme";

/** The active bar sits on TOP of the icon — the inversion Niji is built around. */
function Tab({
  Icon,
  focused,
  pip,
}: {
  Icon: typeof IconVybe;
  focused: boolean;
  pip?: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 46, paddingTop: 9 }}>
      <Icon size={23} color={focused ? c.ink : c.inkGhost} />
      {pip ? (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: c.saffron,
          }}
        />
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const { state } = useStore();
  const chatUnread = hasChatUnread(state.conversations);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: c.paper },
        tabBarStyle: {
          backgroundColor: c.paper,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === "ios" ? 84 : 66,
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="calls"
        options={{ tabBarIcon: ({ focused }) => <Tab Icon={IconCalls} focused={focused} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <Tab Icon={IconChat} focused={focused} pip={chatUnread} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: state.vybeEnabled ? undefined : null,
          tabBarIcon: ({ focused }) => <Tab Icon={IconVybe} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          href: state.hubEnabled ? undefined : null,
          tabBarIcon: ({ focused }) => <Tab Icon={IconHub} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{ tabBarIcon: ({ focused }) => <Tab Icon={IconAccount} focused={focused} /> }}
      />
    </Tabs>
  );
}
