import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../firebase-config";
import { ScrollView, View, Image } from "react-native";
import {
  Text,
  Icon,
  IconButton,
  Divider,
  ProgressBar,
  Button,
  Portal,
} from "react-native-paper";
import { details, element, page, userDet, rewards } from "../styles/basic";
import RewardsFrom from "../components/RewardsFrom";

const RewardsClaimsPage = ({
  navigation,
  userID,
  familyData,
  memData,
  rewardsData,
  mod2,
  setMod2,
  setSelectedReward,
  selectedReward,
  modal,
  setModal,
}) => {
  const favorited = rewardsData.filter((item) =>
    item.favoritedBy?.includes(userID)
  );

  const available = rewardsData.filter(
    (item) => !item.favoritedBy?.includes(userID)
  );

  //   console.log('fam',familyData);

  //   const [members, loading, errors] = useCollection(
  //     collection(db, "families", familyData.id, "members"),
  //     {
  //       snapshotListenOptions: { includeMetadataChanges: true },
  //     }
  //   );

  return (
    <View style={page.container}>
      {familyData.admin === userID && (
        <IconButton
          icon="plus"
          color="#5640DA"
          onPress={() => {
            setModal(!modal);
          }}
        />
      )}

      {favorited.length != 0 && (
        <Text style={rewards.subHead}> Favorites </Text>
      )}

      <View style={{ padding: 10, marginBottom: 400 }}>
        {rewardsData
          .filter((item) => item.favoritedBy?.includes(userID))
          .map((reward, index) => {
            return (
              <View style={rewards.container} key={index}>
                <View style={{ ...rewards.flexSB }}>
                  <View>
                    <Text style={rewards.name}>{reward.reward}</Text>
                    <Text style={rewards.text}>{reward.description}</Text>
                  </View>

                  <IconButton
                    icon="heart"
                    color="#5604DA"
                    onPress={async () => {
                      try {
                        await updateDoc(
                          doc(
                            db,
                            "families",
                            familyData.id,
                            "rewards",
                            reward.id
                          ),
                          {
                            favoritedBy: arrayRemove(userID),
                          }
                        );
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                  />
                </View>

                <View style={{ marginTop: 20 }}>
                  <ProgressBar
                    progress={memData.points / reward.points}
                    color={"#5604DA"}
                  />

                  <Text
                    style={{ ...rewards.text, textAlign: "right" }}
                  >{`${memData.points}/${reward.points}`}</Text>
                  {reward.claimedBy?.includes(userID) && (
                    <Button color="#5604DA">Claimed</Button>
                  )}

                  {memData.points / reward.points >= 1 && (
                    <View>
                      {!reward.claimedBy?.includes(userID) && (
                        <Button
                          onPress={() => {
                            setMod2(true);
                            setSelectedReward(reward);
                          }}
                          color="#5604DA"
                        >
                          Claim
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

        {favorited.length != 0 && (
          <Divider style={{ backgroundColor: "#5604DA", margin: 15 }} />
        )}

        {available.length != 0 && (
          <Text style={rewards.subHead}> Available </Text>
        )}

        {available.map((reward, index) => {
          return (
            <View style={rewards.container} key={index}>
              <View style={{ ...rewards.flexSB }}>
                <View>
                  <Text style={rewards.name}>{reward.reward}</Text>
                  <Text style={rewards.text}>{reward.description}</Text>
                </View>

                <IconButton
                  icon="heart-outline"
                  color="#5604DA"
                  onPress={async () => {
                    try {
                      await updateDoc(
                        doc(
                          db,
                          "families",
                          familyData.id,
                          "rewards",
                          reward.id
                        ),
                        {
                          favoritedBy: arrayUnion(userID),
                        }
                      );
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                />
              </View>

              <View style={{ marginTop: 20 }}>
                <ProgressBar
                  progress={memData.points / reward.points}
                  color={"#5604DA"}
                />
                <Text
                  style={{ ...rewards.text, textAlign: "right" }}
                >{`${memData.points}/${reward.points}`}</Text>

                {memData.points / reward.points >= 1 && (
                  <View>
                    {!reward.claimedBy?.includes(userID) && (
                      <Button
                        onPress={() => {
                          setMod2(true);
                          setSelectedReward(reward);
                        }}
                        color="#5604DA"
                      >
                        Claim
                      </Button>
                    )}
                  </View>
                )}

                {reward.claimedBy?.includes(userID) && (
                  <Button color="#5604DA">Claimed</Button>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const RewardsClaimsContainer = ({ navigation, route }) => {
  const { userID } = route.params;
  const [familyData, setFamilyData] = useState(null);
  const [userData, uload, uerr] = useDocument(doc(db, "users", userID), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [memData, setMemData] = useState(null);
  const [act, setAct] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [mod2, setMod2] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);


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
        doc(db, `families/${familyData.id}/members/${userID}`),
        (doc) => {
          setMemData({ id: doc.id, ...doc.data() });
        }
      );

      return () => {
        unsub();
      };
    } else {
      return;
    }
  }, [familyData]);

  useEffect(() => {
    if (familyData) {
      const unsub = onSnapshot(
        collection(db, `families/${familyData.id}/rewards`),
        (doc) => {
          setRewards(doc.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
      );

      return () => {
        unsub();
      };
    } else {
      return;
    }
  }, [familyData]);

  const claimReward = async () => {
    // console.log(selectedReward);
    setAct(true);
    try {
      await addDoc(collection(db, `families`, familyData.id, "requests"), {
        type: "reward-claim",
        rewardID: selectedReward.id,
        claimedBy:userID,
        status:'pending',
        username:userData.data().username,
        createdAt: Timestamp.now(),
        reward:selectedReward.reward,
        points:selectedReward.points,
        description:selectedReward.description,
        

      });

      await updateDoc(
        doc(db, "families", familyData.id, "rewards", selectedReward.id),
        {
          claimedBy: arrayUnion(userID),
        }
      );

      await updateDoc(doc(db, "families", familyData.id, "members", userID), {
        points: increment(-selectedReward.points),
      });

      setMod2(false);
      setAct(false);
    } catch (e) {
      console.log(e);
      setAct(false);
    }
  };

  return (
    <View>
      <View>
        {uload && <Text>Loading...</Text>}

        {modal && (
          <View
            style={{
              height: "100%",
              width: "100%",

              backgroundColor: "rgba(0,0,0,.9)",
              position: "absolute",
              zIndex: 11,
            }}
          >
            <View
              style={{
                ...userDet.modal,
                top: "10%",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              }}
            >
              <RewardsFrom
                familyID={familyData.id}
                open={modal}
                setOpen={setModal}
              />
            </View>
          </View>
        )}

        {mod2 && (
          <View
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "rgba(0,0,0,.9)",
              position: "absolute",
              zIndex: 11,
            }}
          >
            <View
              style={{
                ...userDet.modal,
                top: "25%",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
                gap: 30,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: "#5640DA",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Are you sure you want to Claim {selectedReward.reward}?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "center",
                }}
              >
                <Button
                  mode="contained"
                  loading={act}
                  color="#5640DA"
                  onPress={claimReward}
                >
                  Yes
                </Button>
                <Button color="#5640DA" onPress={() => setMod2(false)}>
                  No
                </Button>
              </View>
            </View>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
            marginHorizontal: 20,
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "10%",
          }}
        >
          <Text
            style={{
              fontSize: 25,
              color: "#5640DA",
              fontWeight: "bold",
            }}
          >
            Claims & Rewards
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
              gap: 5,
              //   backgroundColor: "#5640DA",
            }}
          >
            <Text
              style={{
                ...element.stats,
              }}
            >
              {memData?.points}
            </Text>
            <Text
              style={{
                fontSize: 25,
                color: "#5640DA",
                fontWeight: "bold",
              }}
            >
              Points
            </Text>
          </View>
        </View>

        {familyData && memData && rewards && (
          <ScrollView>
            <RewardsClaimsPage
              userID={userID}
              familyData={familyData}
              navigation={navigation}
              memData={memData}
              rewardsData={rewards}
              setSelectedReward={setSelectedReward}
              selectedReward={selectedReward}
              setMod2={setMod2}
              mod2={mod2}
              modal={modal}
              setModal={setModal}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default RewardsClaimsContainer;
