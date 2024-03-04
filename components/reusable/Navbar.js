import { useState } from "react";
import { BottomNavigation } from "react-native-paper";
import Home from "../../pages/Home";
import AddTask from "../../pages/AddTask";

const BottomNav = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "home", title: "Home", icon: "home" },
    { key: "Add Task", title: "Add Task", icon: "plus" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Home,
    AddTask: AddTask,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};


export default BottomNav;