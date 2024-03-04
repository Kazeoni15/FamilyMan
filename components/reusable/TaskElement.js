import { View, Text } from "react-native";
import {IconButton } from "react-native-paper";
import { element } from "../../styles/basic";


export default function TaskElement ({task, navigation, familyID, username}){


    function limitStringLength(str, maxLength) {
        if (str.length <= maxLength) {
          return str;
        } else {
          return str.substring(0, maxLength) + "...";
        }
      }
// console.log(username)
    return (
        <View style={element.container} >
                      <View style={{...element.flex2, alignItems:'center', marginTop:0}}>
                       <View><Text style={element.title}>{task.title}</Text></View> 
                        <IconButton
                          icon="information-outline"
                          color="white"
                          size={20}
                          onPress={() => navigation.navigate('task-details', {familyID:familyID, username:username, taskID:task.id })}
                        />
                      </View>

                      <Text style={element.description}>
                        {limitStringLength(task.description, 75)}
                      </Text>

                      <View style={element.flex2}>
                        <Text style={element.stats}>
                          {task.pointsCategory.points} Points
                        </Text>
                        <Text style={element.stats}>
                          {task.status?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
    ) 

}