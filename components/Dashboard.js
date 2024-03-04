import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  useCollection,
  useCollectionData,
  useDocument,
} from "react-firebase-hooks/firestore";
import { db } from "../firebase-config";
import { ScrollView, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { page, element } from "../styles/basic";
import TaskElement from "./reusable/TaskElement";

export default function Dashboard({ navigation, userData, userID }) {
  const [familyData, loading, errors] = useDocument(
    doc(db, "families", userData.familyId),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [upcoming, setUpcoming] = useState([]);
  const [today, setToday] = useState([]);
  const [done, setDone] = useState([]);

  // const [tasks, loadingT, errorsT] = useCollection(
  //   collection(db, "families", userData.familyId, "tasks"), {
  //     snapshotListenOptions: { includeMetadataChanges: true },
  //    }
  // );
  // console.log(tasks?.docs[0].data());

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "families", userData.familyId, "tasks"),
      (items) => {
        const currentDate = new Date();
        const up = [];
        const tod = [];
        const don = [];

        items.docs.forEach((doc) => {
          const taskData = { ...doc.data(), id: doc.id };
          const dueDate = taskData.dueDate.toDate(); // Convert Firestore Timestamp to Date object

          // console.log(doc.data().status);
          if (doc.data().status == "done") {
            don.push(taskData);
          } else if (dueDate.toDateString() === currentDate.toDateString()) {
            tod.push(taskData);
          } else if (dueDate > currentDate) {
            up.push(taskData);
          }
        });

        setToday(tod);
        setUpcoming(up);
        setDone(don);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  const accept = async (request) => {
    console.log(request.data());

    const payload = {
      email: request.data().email,
      username: request.data().username,
      points: 0,
    };

    console.log(request.data().userID);

    try {
      await setDoc(
        doc(
          db,
          `families/${userData.familyId}/members/${request.data().userID}`
        ),
        payload
      );
      await deleteDoc(
        doc(db, `families/${userData.familyId}/requests/${request.id}`)
      );
      await updateDoc(doc(db, `users/${request.data().userID}`), {
        familyId: userData.familyId,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const decline = async (request) => {
    console.log(request.id);
    try {
      await deleteDoc(
        doc(db, `families/${userData.familyId}/requests/${request.id}`)
      );
    } catch (error) {
      console.log(error);
    }
  };

  // console.log(userID == familyData?.data()?.admin)
  // console.log(element);
  return (
    <View>
      {familyData && (
        <View>
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#5640DA" }}
              >
                {familyData.data().familyName}
              </Text>
            </View>

            <View style={{ display: "flex", flexDirection: "row" }}>
              {familyData.data().admin == userID && (
                <IconButton
                  color={"#5640DA"}
                  icon={"plus"}
                  onPress={() => navigation.navigate("addTask")}
                />
              )}

              {/* {familyData.data().admin == userID && (
                <IconButton
                  color={"#5640DA"}
                  icon={"file-document"}
                  onPress={() => navigation.navigate("requests")}
                />
              )} */}

              {familyData.data().admin == userID && (
                <IconButton
                  color={"#5640DA"}
                  icon={"heart-cog"}
                  onPress={() => navigation.navigate("family-settings")}
                />
              )}
            </View>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }}>
            {today.length > 0 && (
              <View>
                <Text style={{ ...page.h2, textAlign: "right" }}>
                  Today's Todo
                </Text>
                {today.map((task, index) => {
                  // console.log(task.id)
                  return (
                    <View key={index}>
                      <TaskElement
                        task={task}
                        navigation={navigation}
                        username={userData.username}
                        familyID={userData.familyId}
                      />
                    </View>
                  );
                })}
              </View>
            )}
            {upcoming.length > 0 && (
              <View>
                <Text style={{ ...page.h2, textAlign: "right" }}>Upcoming</Text>
                {upcoming.map((task, index) => {
                  return (
                    <View key={index}>
                      <TaskElement
                        task={task}
                        navigation={navigation}
                        username={userData.username}
                        familyID={userData.familyId}
                      />
                    </View>
                  );
                })}
              </View>
            )}
            {done.length > 0 && (
              <View style={{ paddingBottom: 200 }}>
                <Text style={{ ...page.h2, textAlign: "right" }}>
                  Today Completed
                </Text>
                {done.map((task, index) => {
                  return (
                    <View key={index}>
                      <TaskElement
                        task={task}
                        navigation={navigation}
                        username={userData.username}
                        familyID={userData.familyId}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

{
  /* {members?.docs.length > 0 && (
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ color: "#5640DA", fontSize: 15 }}>Members</Text>
          {members?.docs.map((member, index) => {
            return (
              <View key={index}>
                <Text>
                  {member.data().username}
                  {familyData?.data()?.admin === member.id && "admin"}
                  {familyData?.data()?.moderator === member.id && "admin"}
                </Text>

                
                  
              </View>
            );
          })}
        </View>
      )} */
}
