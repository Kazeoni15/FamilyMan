import { SafeAreaView, Text, heet, View } from "react-native";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { element, page } from '../styles/basic'

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  getCountFromServer,
  getDocs,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase-config";
import FormTextInput from "../components/FormTextInput";
import {
  ActivityIndicator,
  Button,
  HelperText,
  IconButton,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { Formik } from "formik";
import * as yup from "yup";
import { setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from '@react-navigation/native';



const validationSchema = yup.object().shape({
  familyId: yup.string().required("Family ID is required"),
});

const validationSchema2 = yup.object().shape({
  familyName: yup.string().required("Family name is required"),
});

export default function Home({ navigation, route }) {
  const { userID } = route.params;
  
  const [snack, setSnack] = useState(false);
  const [userData, loading, error] = useDocument(doc(db, "users", auth?.currentUser?.uid), {
    snapshotListenOptions: { includeMetadataChanges: false },
  });
  const [reqs, setReqs] = useState([])
  const [req, setReq] = useState(false);
  const [fam, setFam] = useState(null)


  useEffect(() =>{

    if(userData?.data().familyId === null){
      const snapshot = onSnapshot(collection(db, 'users', userID, 'requests'), (docs)=>{

        setReqs(docs.docs)
      

        console.log(docs.docs.length)
        if(docs.docs.length > 0){
          setReq(true)
        } else {
          setReq(false)
        }
      })

      return () => {
        snapshot()
      } 
    } else {
      setReq(false)
    
      return
    }




  },[reqs, userData])
 
 

  const handleRequest = async (values, actions) => {  
    // Handle form submission here

    // console.log(values);

    try {
      const q = await getDocs(
        query(
          collection(db, "families"),
          where("familyName", "==", values.familyId)
        )
      );
      //   q.forEach((doc) => {
      //     console.log(doc.id)
      //   })
      if (q.docs.length === 0) {
        actions.setFieldError(
          "familyId",
          "Family does not exist, Family names are case and space sensitive"
        );
      } else if (q.docs.length === 1) {
        // console.log(q.docs[0].id)
      const a =  await addDoc(collection(db, `families/${q.docs[0].id}/requests`), {
          userID: userID,
          username: userData.data().username,
          email: userData.data().email,
          status: "pending",
          created: Timestamp.now(),
          type: "family-join",
        });

        await setDoc(doc(db, `users/${userID}`, 'requests', a.id), {
          status: 'pending',
          created: Timestamp.now(),
          type: 'family-join',
          familyId: q.docs[0].id,
        })

        
        setFam(values.familyId)
        setSnack(true);
        setReq(true);

      } else {
        setFieldError("familyId", "Something went wrong, try again");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const createFamily = async (values, actions) => {
    try {
      if (
        (
          await getCountFromServer(
            query(
              collection(db, "families"),
              where("familyName", "==", values.familyName)
            )
          )
        ).data().count !== 0
      ) {
        actions.setFieldError("familyName", "Family name already exists");
      } else {
        const familyRef = collection(db, "families");

        const r = await addDoc(familyRef, {
          admin: userID,
          moderator: null,
          familyName: values.familyName,
          created: Timestamp.now(),
          pointsCategory: [{tag:'Top', points:20}, {tag:'Mid', points: 15}, {tag:"Low", points: 10}],
          dailyTaskLimit: 4
        });

        await setDoc(doc(db, "families", r.id, "members", userID), {
          email: userData.data().email,
          username: userData.data().username,
          points: 0,
          created: Timestamp.now(),
        });

        await updateDoc(doc(db, "users", userID), {
          familyId: r.id,
          updated: Timestamp.now(),
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
 
  return (
    <SafeAreaView style={page.container}>
      {userData?.data().username && (
        <View style={{marginTop: "5%"}}>
          {/* <Text style={{ padding: 10, color: "#5640DA", fontSize: 20 }}>
            Welcome, {userData.data().username} 
          </Text> */}
          
 
          {userData.data().familyId == null && !req && (
            <View style={{margin:45}}>
              <Text >Please join a Family</Text>

              <View>
                <Formik
                  initialValues={{
                    familyId: "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleRequest}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  }) => (
                    <View>
                      <View
                        style={{
                          width: "90%",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View style={{ width: "80%" }}>
                          <TextInput
                            label={"Enter Family name"}
                            value={values.radius}
                            outlineColor={"#5640DA"}
                            selectionColor={"#5640DA"}
                            autoCapitalize="none"
                            onChangeText={handleChange("familyId")}
                            mode="outlined"
                          />
                        </View>

                        <View>
                          <Button mode="contained" loading={req} onPress={handleSubmit}>
                            Request
                          </Button>
                        </View>
                      </View>
                      {errors.familyId && touched.familyId && (
                        <HelperText type="error">{errors.familyId}</HelperText>
                      )}
                    </View>
                  )}
                </Formik>
              </View>

              {!req && <Text >Or Create a new one</Text>}

              {!req && (
                <View>
                  <Formik
                    initialValues={{ familyName: "" }}
                    validationSchema={validationSchema2}
                    onSubmit={createFamily}
                  >
                    {({
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      values,
                      errors,
                      touched,
                    }) => (
                      <View>
                        <View
                          style={{
                            width: "90%",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <View style={{ width: "80%" }}>
                            <TextInput
                              label={"Choose a Family name"}
                              value={values.familyName}
                              outlineColor={"#5640DA"}
                              selectionColor={"#5640DA"}
                              autoCapitalize="none"
                              onChangeText={handleChange("familyName")}
                              mode="outlined"
                            />
                          </View>

                          <View>
                            <Button mode="contained" onPress={handleSubmit}>
                              Create
                            </Button>
                          </View>
                        </View>
                        {errors.familyName && touched.familyName && (
                          <HelperText type="error">
                            {errors.familyName}
                          </HelperText>
                        )}
                      </View>
                    )}
                  </Formik>
                </View>
              )}

              

            </View>
          )}

          {req && <View> 
            
            
            
            
            
            
            
            
            
            
            
            <View style={{...element.container, marginTop:"25%", marginHorizontal:20, }}>

            <Text style={{...element.stats, color:"#fff"}}>Your Request is being reviewed. Please wait..</Text>
            
            <ActivityIndicator animating={req} color={"#fff"} />


            
            </View>


            <Button
        style={{ marginVertical: 40 }}
        icon={"logout"}
        color={"#5640DA"}
        onPress={async () => {
          try {
            // Add any additional log  out logic here (e.g., sign out from Firebase)

            await signOut(auth);

            // Navigate to your sign-in screen or any other appropriate screen
            // For example, if you're using React Navigation, you can navigate like this:
            // navigation.navigate('SignIn');
          } catch (error) {
            console.error("Error while logging out:", error);
            // Handle any logout errors as needed
          }
        }}
      >
        Logout
      </Button>
            
            
            </View>}

          {userData?.data().familyId && (
            <Dashboard userData={userData.data()} userID={userID} navigation={navigation}/>
          )}

          
        </View>
      )}
      <Snackbar style={{bottom:50}}
        visible={snack}
        onDismiss={() => setSnack(false)}
        duration={1000}
      >
        Request sent successfully!
      </Snackbar>

{/* <BottomNav/> */}
    </SafeAreaView>
  );
}

