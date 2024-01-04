import { collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../firebase-config";
import { View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";

export default function Dashboard({ userData, userId }) {
  const [familyData, loading, errors] = useDocument(
    doc(db, "families", userData.familyId)
  );
  const [requests, loadingR, errorsR] = useCollection(
    collection(db, "families", userData.familyId, "requests")
  );
  const [members, loadingM, errorsM] = useCollection(
    collection(db, "families", userData.familyId, "members")
  );
  console.log(familyData?.data());

  const accept = async (request) => {
    console.log(request.data())

    const payload = {
        email: request.data().email,
        username: request.data().username,
        points: 0,

    }

    try{
        await setDoc(doc(db, `families/${userData.familyId}/members/${request.data().userId}`), payload);
        await deleteDoc(doc(db, `families/${userData.familyId}/requests/${request.id}`));
        await updateDoc(doc(db, `users/${request.data().userId}`), {
            familyId: userData.familyId,
        })
    }catch(err){
        console.log(err)
    }
  }
  const decline = async (request) => {
    console.log(request.id)
    try {
        await deleteDoc(doc(db, `families/${userData.familyId}/requests/${request.id}`));
    } catch (error) {
        console.log(error)
    }
  }

  return (
    <View>
   {familyData && <View style={{padding:20}}>
    <Text style={{ fontSize: 20, fontWeight: "bold" }}>{familyData.data().familyName}</Text>
    {familyData?.data()?.admin === userId && (
        <View style={{ paddingVertical: 20 }}>
          {requests?.docs.length > 0 && (
            <View> 
              <Text style={{ color: "#5640DA", fontSize: 15 }}>Requests</Text>
              {requests?.docs.map((request, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text>
                      {request.data()?.username} {request.data().status}
                    </Text>
                    <IconButton icon="check" onPress={()=>accept(request)}/>
                    <IconButton icon="close" onPress={()=>decline(request)}/>
                   
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
      {members?.docs.length > 0 && (
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
      )}
    </View>}
      
    </View>
  );
}
