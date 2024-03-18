import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ScrollView, View } from "react-native";
import { db } from "../firebase-config";
import { Text } from "react-native-paper";
import { details, element, rewards, userDet } from "../styles/basic";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, HelperText, IconButton, Button } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";

const validationSchema = Yup.object().shape({
  pointsCategory: Yup.array().of(
    Yup.object().shape({
      tag: Yup.string().required("Tag is required"),
      points: Yup.number().required("Points are required"),
    })
  ),
  dailyTaskLimit: Yup.number().integer(),
});

const RequestsPage = ({
  navigation,
  userID,
  familyData,
  requests,
  userData,
}) => {
  // console.log(familyData.dailyTaskLimit)
  const [openTaskCreate, setOpenTaskCreate] = useState(false);
  const [openCreateReward, setOpenCreateReward] = useState(false);
  const [activity, setActivity] = useState(false);
  const rewardReqs = requests.filter(
    (req) => req.status === "pending" && req.type === "reward-claim"
  );
  const createRewardReqs = requests.filter(
    (req) => req.status === "pending" && req.type === "reward-create"
  );
  const taskCreateReqs = requests.filter(
    (req) => req.status === "pending" && req.type === "task-create"
  );
  const taskUpdateReqs = requests.filter(
    (req) => req.status === "pending" && req.type === "task-update"
  );
  const joinReqs = requests.filter(
    (req) => req.status === "pending" && req.type === "family-join"
  );
  const acceptedReqs = requests.filter((req) => req.status === "accepted");

  //   console.log("line 35", requests);


  

  return (
    <View style={details.container}>
      <View style={{ paddingBottom: 400 }}>
        <View>
          {/* reward reqs */}

          {familyData.admin != userID && (
            <IconButton
              color={"#5640DA"}
              icon={"plus"}
              onPress={() => navigation.navigate("addRequest")}
            />
          )}

          {rewardReqs.length > 0 && (
            <View>
              <Text style={rewards.subHead}>Reward Claims</Text>
              {rewardReqs.map((request, index) => {
                return (
                  <View key={index} style={element.container}>
                    <View style={rewards.flexSB}>
                      <Text style={element.title}>{request.username}</Text>
                      <Text style={userDet.data}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ ...rewards.flexSB }}>
                      <View>
                        <Text style={element.title}>{request.reward}</Text>
                        <Text style={userDet.data}>{request.description}</Text>
                      </View>
                    </View>

                    {familyData.admin === userID && (
                      <View style={{ ...rewards.flexSB }}>
                        <IconButton
                          onPress={async () => {
                            const docRef = doc(
                              db,
                              "families",
                              familyData.id,
                              "requests",
                              request.id
                            );
                            await updateDoc(docRef, {
                              status: "accepted",
                            });
                          }}
                          icon="check"
                          color="#fff"
                        />
                        <IconButton
                          onPress={async () => {
                            deleteDoc(
                              doc(
                                db,
                                `families/${userData.familyId}/requests/${request.id}`
                              )
                            );
                          }}
                          icon="close"
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          {/* join requests */}
          {joinReqs.length > 0 && (
            <View>
              <Text style={rewards.subHead}>Join Requests</Text>
              {joinReqs.map((request, index) => {
                return (
                  <View key={index} style={element.container}>
                    <View style={rewards.flexSB}>
                      <Text style={element.title}>{request.username}</Text>
                      <Text style={userDet.data}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                    {familyData.admin === userID && (
                      <View style={rewards.flexSB}>
                        <IconButton
                          onPress={async () => {
                            const payload = {
                              email: request.email,
                              username: request.username,
                              points: 0,
                            };

                            console.log(request.userID);

                            try {
                              await setDoc(
                                doc(
                                  db,
                                  `families/${userData.familyId}/members/${request.userID}`
                                ),
                                payload
                              );
                              await deleteDoc(
                                doc(
                                  db,
                                  `families/${userData.familyId}/requests/${request.id}`
                                )
                              );
                              await updateDoc(
                                doc(db, `users/${request.userID}`),
                                {
                                  familyId: userData.familyId,
                                }
                              );
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          icon="check"
                          color="#fff"
                        />
                        <IconButton
                          onPress={async () => {
                            try {
                              await deleteDoc(
                                doc(
                                  db,
                                  `families/${userData.familyId}/requests/${request.id}`
                                )
                              );
                              await deleteDoc(
                                doc(
                                  db,
                                  `users/${request.userID}/requests/${request.id}`
                                )
                              );
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          icon="close"
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* task create requests */}

          {taskCreateReqs.length > 0 && (
            <View>
              <Text style={rewards.subHead}>Task Create Requests</Text>
              {taskCreateReqs.map((request, index) => {
                // console.log(request)
                return (
                  <View key={index} style={element.container}>
                    <View style={rewards.flexSB}>
                      <Text style={element.title}>{request.username}</Text>
                      <Text style={userDet.data}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ ...rewards.flexSB }}>
                      <Text style={userDet.data}>{request.title}</Text>
                    </View>

                    {familyData.admin === userID && (
                      <View style={rewards.flexSB}>
                        <IconButton
                          onPress={async () => {
                            const payload = {
                              assignee: request.assignee,
                              description: request.assignee,
                              status: "pending",
                              dueDate: request.dueDate,
                              pointsCategory: request.pointsCategory,
                              title: request.title,
                              userID: userID,
                              username: userData.username,
                            };

                            console.log(request);
                            // console.log(request.userID);

                            console.log(familyData.id, request.id);

                            try {
                              const r = await addDoc(
                                collection(
                                  db,
                                  `families/${familyData.id}/tasks`
                                ),
                                payload
                              );
                              await updateDoc(
                                doc(
                                  db,
                                  "families",
                                  familyData.id,
                                  "requests",
                                  request.id
                                ),
                                {
                                  status: "accepted",
                                }
                              );
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          icon="check"
                          color="#fff"
                        />
                        <IconButton
                          onPress={async () => {
                            try {
                              await deleteDoc(
                                doc(
                                  db,
                                  `families/${userData.familyId}/requests/${request.id}`
                                )
                              );
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          icon="close"
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Reward create requests */}

          {createRewardReqs.length > 0 && (
            <View>
              <Text style={rewards.subHead}>Add Rewards Requests</Text>
              {createRewardReqs.map((request, index) => {
                return (
                  <View key={index} style={element.container}>
                    <View style={rewards.flexSB}>
                      <Text style={element.title}>{request.username}</Text>
                      <Text style={userDet.data}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={rewards.flexSB}>
                      <View>
                        <Text style={element.title}>{request.reward}</Text>
                        <Text style={userDet.data}>{request.description}</Text>
                      </View>
                      <Text style={userDet.data}>{request.points} points</Text>
                    </View>

                    {familyData.admin === userID && (
                      <View style={rewards.flexSB}>
                        <IconButton
                          onPress={async () => {
                            console.log(request);
                            const payload = {
                                reward:request.reward,
                                description:request.description,
                                points: request.points,
                                claimedBy:[],
                                favoritedBy:[],
                              };

                              console.log(request.userID);

                              try {
                                await addDoc(
                                  collection(
                                    db,
                                    `families/${userData.familyId}/rewards`
                                  ),
                                  payload
                                );
                                await updateDoc(
                                  doc(db, 'families', familyData.id, 'requests', request.id),{
                                    status: 'accepted',
                                  }
                                );
                                
                              } catch (err) {
                                console.log(err);
                              }
                          }}
                          icon="check"
                          color="#fff"
                        />
                        <IconButton
                          onPress={async () => {
                            try {
                              deleteDoc(
                                doc(
                                  db,
                                  `families/${userData.familyId}/requests/${request.id}`
                                )
                              );
                             
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          icon="close"
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}


{/* task done requests */}

{taskUpdateReqs.length > 0 && (
            <View>
              <Text style={rewards.subHead}>Task Review</Text>
              {taskUpdateReqs.map((request, index) => {
                return (
                  <View key={index} style={element.container}>
                    <View style={rewards.flexSB}>
                      <Text style={element.title}>{request.task.assignee}</Text>
                      <Text style={userDet.data}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{...rewards.flexSB, maxWidth:"100%"}}>
                 
                        <Text style={{...element.description, maxWidth:"70%"}}>{request.task.title}</Text>
                       
                     
                      <Text style={userDet.data}>{request.task.pointsCategory.points} points</Text>
                    </View>

                    {familyData.admin === userID && (
                      <View style={rewards.flexSB}>
                        <IconButton
                          onPress={async () => {
                            console.log(request.task.id, familyData.id, request.id);
                         

                    

                              try {
                                await updateDoc(
                                  doc(
                                    db,
                                    `families/${familyData.id}/tasks/${request.task.id}`
                                  ),
                                  {
                                    status: 'done'
                                  }
                                );
                                await updateDoc(
                                  doc(db, 'families', familyData.id, 'requests', request.id),{
                                    status: 'accepted',
                                  }
                                );
                                await updateDoc(
                                  doc(db, 'families', familyData.id, 'members', request.doneBy),{
                                    points: increment(request.task.pointsCategory.points),
                                  }
                                )
                                
                              } catch (err) {
                                console.log(err);
                              }
                          }}
                          icon="check"
                          color="#fff"
                        />
                        <IconButton
                          onPress={async () => {
                            try {
                              deleteDoc(
                                doc(
                                  db,
                                  `families/${userData.familyId}/requests/${request.id}`
                                )
                              );
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          icon="close"
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* accepted reqs */}
          {acceptedReqs.length > 0 && (
            <View>
              <Text style={rewards.subHead}>Accepted Requests</Text>
              {acceptedReqs.map((request, index) => {
                return (
                  <View key={index} style={element.container}>
                    <View style={rewards.flexSB}>
                      <Text style={element.title}>{request.username || request.task.assignee}</Text>
                      <Text style={userDet.data}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>

                    <View style={{...rewards.flexSB, flexWrap:'nowrap', marginTop:10}}>
                      <View >
                        <Text style={{...element.description, maxWidth: 180}}>{request.reward || request.title || request.task.title}</Text>
                        
                      </View>
                      <Text style={userDet.data}>
                        {request.type.split("-")[0].toUpperCase()}{" "}
                        {request.type.split("-")[1].toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const RequestsContainer = ({ navigation, route }) => {
  const { userID } = route.params;
  const [familyData, setFamilyData] = useState(null);
  const [requests, setRequests] = useState(null);
  const [userData, uload, uerr] = useDocument(doc(db, "users", userID), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  
  if(userData?.data().familyId === null){
    navigation.navigate('home');
  }

  useEffect(() => {
    if (userData?.data().familyId != null) {
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

  useEffect(() => {
    if (familyData) {
      const unsub = onSnapshot(
        collection(db, "families", familyData.id, "requests"),
        (snap) => {
          const reqs = snap.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          });

          //    console.log('line 106',reqs);

          setRequests(reqs);
          // setRequests(snap.docs.map((doc)=>({id:  doc.id, ...doc.data()})));
        }
      );

      return () => {
        unsub();
      };
    } else {
      return;
    }
  }, [familyData]);

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
          Requests
        </Text>

        {familyData && requests && (
          <ScrollView>
            <RequestsPage
              userID={userID}
              familyData={familyData}
              navigation={navigation}
              requests={requests}
              userData={userData.data()}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default RequestsContainer;
