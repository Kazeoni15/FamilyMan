import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import HomeScreen from "../components/pages/HomeScreen";
// import Settings from "../screens/Settings";
import LoginScreen from "../Auth/LoginScreen";
import RegisterScreen from "../Auth/RegisterScreen";

import Home from "../../pages/Home";
import AddTask from "../../pages/AddTask";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, IconButton } from "react-native-paper";
import TaskDetails from "../../pages/TaskDetails";
import FamilySettingsContainer from "../../pages/FamilySettings";
import FamilyDashContainer from "../../pages/FamilyDash";
import UserSettingsContainer from "../../pages/UserSettings";
import RewardsClaimsContainer from "../../pages/ClaimsRewards";
import RequestsContainer from "../../pages/Requests";
import AddRequestsContainer from "../../pages/AddRequest";

// import AuthContextProvider from "../../AuthContext/authContextProvider";
// import Home from "../screens/Home";
// import { getAuth } from "firebase/auth";
// import { View } from "react-native";
// import CreatePoll from "../screens/CreatePoll";
// import Drafts from "../screens/Drafts";
// import EditPoll from "../screens/EditPoll";
// import Poll from "../screens/Poll";
// import YourVotes from "../screens/YourVotes";
// import Test from "../screens/Test";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  // headerTransparent: true,
  tabBarActiveTintColor: "#5640DA",
  tabBarShowLabel: false,
  tabBarStyle: {
    position: "absolute",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "rgb(209, 204, 240)",
    // backdropFilter: 'blur(25px)'
  },

  // headerTitleAlign: 'left',
  // navigationBarHidden: true,
};

export const SignedInStack = ({ userID }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="home" screenOptions={screenOptions}>
        <Tab.Screen
          name="home"
          options={{
            tabBarAccessibilityLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <IconButton icon={"home"} color={color} size={size} />
            ),
          }}
          component={Home}
          initialParams={{ userID }}
        />

        <Tab.Screen
          name="requests"
          options={{
            tabBarAccessibilityLabel: "Requests",
            tabBarIcon: ({ color, size }) => (
              <IconButton icon={"file-document"} color={color} size={size} />
            ),
          }}
          component={RequestsContainer}
          initialParams={{ userID }}
        />
        <Tab.Screen
          name="dashboard"
          options={{
            tabBarAccessibilityLabel: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <IconButton icon={"view-dashboard"} color={color} size={size} />
            ),
          }}
          component={FamilyDashContainer}
          initialParams={{ userID }}
        />
        <Tab.Screen
          name="claimsRewards"
          options={{
            tabBarAccessibilityLabel: "Claims and Rewards",
            tabBarIcon: ({ color, size }) => (
              <IconButton icon={"gift"} color={color} size={size} />
            ),
          }}
          component={RewardsClaimsContainer}
          initialParams={{ userID }}
        />

        <Tab.Screen
          name="user-settings"
          options={{
            tabBarAccessibilityLabel: "User Settings",
            tabBarIcon: ({ color, size }) => (
              <IconButton icon={"account-cog"} color={color} size={size} />
            ),
          }}
          component={UserSettingsContainer}
          initialParams={{ userID }}
        />
        <Tab.Screen
          name="addTask"
          options={{ tabBarButton: () => null }}
          component={AddTask}
          initialParams={{ userID }}
        />
         <Tab.Screen
          name="addRequest"
          options={{ tabBarButton: () => null }}
          component={AddRequestsContainer}
          initialParams={{ userID }}
        />
        <Tab.Screen
          name="task-details"
          options={{ tabBarButton: () => null }}
          component={TaskDetails}
          initialParams={{ userID }}
        />

        <Tab.Screen
          name="family-settings"
          options={{ tabBarButton: () => null }}
          component={FamilySettingsContainer}
          initialParams={{ userID }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export const SignedOutStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

{
  /* <Stack.Screen name="settings" component={Settings} />
        <Stack.Screen name="create-poll" component={CreatePoll}/>
        <Stack.Screen name="drafts" component={Drafts}/>
        <Stack.Screen name="myvotes" component={YourVotes}/>
        <Stack.Screen name='edit' options={({ route }) => ({ title: `Edit Poll #${route.params.pollId}` })} component={EditPoll}/>
        <Stack.Screen name='poll' options={({ route }) => ({ title: `Edit Poll #${route.params.pollId}` })} component={Poll}/> */
}
