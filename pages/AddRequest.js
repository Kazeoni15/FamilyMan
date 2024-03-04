import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ScrollView, View } from "react-native";
import { db } from "../firebase-config"
import { Text } from "react-native-paper";
import { details, element, rewards, userDet } from "../styles/basic";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, HelperText, IconButton, Button } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";
import NewTaskForm from "../components/requestForms/NewTaskForm";
import CreateRewardFrom from "../components/requestForms/CreateRewardForm";

const validationSchema = Yup.object().shape({
  pointsCategory: Yup.array().of(
    Yup.object().shape({
      tag: Yup.string().required("Tag is required"),
      points: Yup.number().required("Points are required"),
    })
  ),
  dailyTaskLimit: Yup.number().integer(),
});

const AddRequestsPage = ({ navigation, userID, familyData, userData }) => {
  // console.log(familyData.dailyTaskLimit)

  const [tab, setTab] = useState("");
  // ['reward-create', 'task-create', 'reward-claim']



  const requestTypesModerator = ["New Reward", "New Task"];

  return (
    <View style={details.container}>
      <View style={{ paddingVertical: 20 }}>
        
          {familyData.moderator == userData.username && <View>
            <Text style={{marginBottom: 20,...details.highlightedInfo}}>
              Choose the type of Request
            </Text>
            <SelectDropdown
              dropdownStyle={{ width: "90%" }}
              buttonStyle={{
                width: "100%",
                backgroundColor: "#5640DA",
                marginBottom: 8,
                borderRadius: 5,
              }}
              buttonTextStyle={{ color: "white" }}
              onSelect={(selectedAssignee) => setTab(selectedAssignee)}
              data={
                requestTypesModerator
              }
            />
            <View>
              {tab == "New Reward" && <CreateRewardFrom userID={userID} familyData={familyData} navigation={navigation} userData={userData} />}
              {tab == "New Task" && <NewTaskForm userID={userID} familyData={familyData} navigation={navigation} userData={userData} />}
            </View>
          </View>}
          {familyData.moderator != userData.username && familyData.admin != userID && <View> 
            
            <Text style={{...rewards.name, textAlign:"center", marginBottom:10}}>New Reward</Text>
            <CreateRewardFrom userID={userID} familyData={familyData} navigation={navigation} userData={userData} />

            </View>}

          <View>
            
          </View>
        
      </View>
    </View>
  );
};

const AddRequestsContainer = ({ navigation, route }) => {
  const { userID } = route.params;
  const [familyData, setFamilyData] = useState(null);

  const [userData, uload, uerr] = useDocument(doc(db, "users", userID), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  useEffect(() => {
    if (userData) {
      const unsub = onSnapshot(
        doc(db, "families", userData?.data().familyId),
        (doc) => {
          setFamilyData({ id: doc.id, ...doc.data() });
        }
      );

      return () => {
        unsub();
      };
    } else {
      return;
    }
  }, [userData]);

  return (
    <View>
      <View>
        {uload && <Text>Loading...</Text>}

        <Text
          style={{
            ...details.title,
            textAlign: "left",
            paddingBottom: 10,
            paddingHorizontal: 20,
          }}
        >
          Create Request
        </Text>

        {familyData && (
          <ScrollView>
            <AddRequestsPage
              userID={userID}
              familyData={familyData}
              navigation={navigation}
              userData={userData.data()}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default AddRequestsContainer;
