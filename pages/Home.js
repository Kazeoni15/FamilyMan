import { SafeAreaView, Text, StyleSheet, View } from "react-native";
import { useCollection, useDocument, } from "react-firebase-hooks/firestore";

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
} from "firebase/firestore";
import { db } from "../firebase-config";
import FormTextInput from "../components/FormTextInput";
import { ActivityIndicator, Button, HelperText, Snackbar, TextInput } from "react-native-paper";
import { Formik } from "formik";
import * as yup from "yup";
import { setDoc } from "firebase/firestore";
import { useState } from "react";
import Dashboard from "../components/Dashboard";

const validationSchema = yup.object().shape({
  familyId: yup.string().required("Family ID is required"),
});

const validationSchema2 = yup.object().shape({
  familyName: yup.string().required("Family name is required"),
});

export default function Home({ navigation, route }) {
  const { userID } = route.params;
  const userId = JSON.parse(userID).uid;
  const [snack, setSnack] = useState(false)
  const [userData, loading, error] = useDocument(doc(db, "users", userId), {
    snapshotListenOptions: { includeMetadataChanges: false },
  });
  const [req, setReq] = useState(false)

  const handleRequest = async (values, actions) => {

    
    // Handle form submission here

    // console.log(values);

    try{
        const q  = await getDocs(query(
            collection(db, "families"),
            where("familyName", "==", values.familyId)
          ));
        //   q.forEach((doc) => {
        //     console.log(doc.id)
        //   })
          if(q.docs.length === 0){
            actions.setFieldError("familyId", "Family does not exist, Family names are case and space sensitive");
         } else if(q.docs.length === 1){
            // console.log(q.docs[0].id)
            await addDoc(collection(db, `families/${q.docs[0].id}/requests`), {
                userId: userId,
                username: userData.data().username,
                email: userData.data().email,
                status: "pending",
                created: Timestamp.now(),
            })
            setSnack(true)
            setReq(true)

         }else{
            setFieldError("familyId", "Something went wrong, try again")
         }


    }catch(e){
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
          admin: userId,
          moderator: null,
          familyName: values.familyName,
          created: Timestamp.now(),
        });

        await setDoc(doc(db, "families", r.id, "members", userId), {
          email: userData.data().email,
          username: userData.data().username,
          points: 0,
          created: Timestamp.now(),
        });

        await updateDoc(doc(db, "users", userId), {
          familyId: r.id,
          updated: Timestamp.now(),
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.androidSafeArea}>
      {userData && (
        <View style={styles.page}>
          <Text style={{ padding: 20, color: "#5640DA", fontSize: 20 }}>
            Welcome, {userData.data().username}!
          </Text>

          {userData.data().familyId == null && (
            <View style={styles.body}>
              <Text style={styles.headText}>Please join a Family</Text>

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
                          <Button mode="contained" onPress={handleSubmit}>
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

              {!req && <Text style={styles.headText}>Or Create a new one</Text>}

             {!req && <View>
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
              </View>}

              <ActivityIndicator animating={req} color={"#5640DA"} />
            </View>

           
          )}

          {userData.data().familyId && (
            <Dashboard userData={userData.data()} userId={userId}/>)}
        </View>
      )}
       <Snackbar
        visible={snack}
        onDismiss={()=>setSnack(false)}
        duration={1000}
        >
       Request sent successfully! 
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  androidSafeArea: {
    flex: 1,
    backgroundColor: "#fff",

    paddingTop: Platform.OS === "android" ? 15 : 0,
  },
  page: {
    backgroundColor: "#fff",
    marginTop: 5,
    flex: 1,
    borderRadius: 10,
    // padding: 15,
  },

  headText: {
    fontSize: 20,
    // fontWeight: 800,
    textAlign: "center",
    color: "#5640DA",
    // paddingTop: 5,
  },
  body: {
    display: "flex",

    gap: 20,
    // alignItems: "center",
    paddingTop: "25%",
    paddingHorizontal: 20,
  },
});
