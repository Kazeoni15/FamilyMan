import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../firebase-config";
import { ScrollView, View, Image } from "react-native";
import { Text, Icon, IconButton, Divider, HelperText } from "react-native-paper";
import { details, element, page, userDet, rewards } from "../styles/basic";

const FamilyDash = ({ navigation, userID, familyData }) => {
  //   console.log('fam',familyData);

  const [members, loading, errors] = useCollection(
    collection(db, "families", familyData.id, "members"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  return (
    <View style={{...page.container}}>
      <View style={{ paddingHorizontal: 20,marginBottom:250, }}>
        {members?.docs.map((member, index) => {
          const memberData = member.data();

          return (
            <View key={index} style={element.container}>
              <View style={{ ...rewards.flexSB, alignItems: "center" }}>
                {memberData.avatar ? (
                  <Image
                  source={{ uri: memberData.avatar.url }}
                  style={{ width: 75, height: 75, borderRadius: 100, marginBottom:20 }}
                />
                ) : (
                  <IconButton icon="account-circle" color={"#fff"} size={40} />
                )}
                <View style={{ maxWidth:"85%"}}>
               
                  {memberData.firstname && memberData.lastname && 
                    <Text  style={userDet.name}> {memberData.firstname} {memberData.lastname} </Text>
                    }
              
                <Text style={{...userDet.name, textAlign:'right', marginVertical:5}}>{memberData.username}</Text>

                {familyData.admin === member.id && (<Text style={{color:"white", textAlign:'right'}}>Admin</Text>)}
                {familyData.moderator === memberData.username && (<Text style={{color:"white", textAlign:'right'}}>Moderator</Text>)}
                
                
                </View>
                
              </View>

              <Divider style={{ backgroundColor: "white" }} />

              <View style={element.flex2}>
                <View>
                  <Text style={userDet.data}>Points {memberData.points}</Text>
                </View>
                
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const FamilyDashContainer = ({ navigation, route }) => {
  const { userID } = route.params;
  const [familyData, setFamilyData] = useState(null);
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
          Family Dashboard
        </Text>

        {familyData && (
          <ScrollView>
            <FamilyDash
              userID={userID}
              familyData={familyData}
              navigation={navigation}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default FamilyDashContainer;
