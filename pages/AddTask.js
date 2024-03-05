import React, { useEffect } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { Button, IconButton, Snackbar, TextInput } from "react-native-paper";
import { useFormik } from "formik";
import * as yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import SelectDropdown from "react-native-select-dropdown";
import { useState } from "react";
import { db } from "../firebase-config";
import { Dimensions } from 'react-native';


import {
  addDoc,
  collection,
  getDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { details } from "../styles/basic";

const initialValues = {
  title: "",
  date: new Date(),
  time: new Date(),
  datetime: new Date(),
  assignee: "",
  description: "",
  pointsCategory: "",
};

const validationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  assignee: yup.object(),
  description: yup.string(),
  date: yup.date().required("Date is required"),
  time: yup.date().required("Time is required"),
  datetime: yup.date().required("Time is required"),

  pointsCategory: yup.object().required("Points Category is required"),
});

const Form = ({ userID, familyData }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("date");
  const [dateTimeError, setDateTimeError] = useState("");
  const windowHeight = Dimensions.get('window').height;
  const [snack, setSnack] = useState(false);
  const [members, loading, errors] = useCollection(
    collection(db, `families/${familyData.id}/members`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  // console.log(members?.docs.length)

  const onSubmit = async (values, actions) => {
    console.log(values);

    if (dateTimeError == "") {
      try {
        const payload = {
          title: values.title,
          assignee: values.assignee == "" ? "" : values.assignee?.data().username,
          description: values.description,
          dueDate: values.datetime,
          pointsCategory: values.pointsCategory,
          status: 'pending'
        };
 
        const res = await addDoc(
          collection(db, `families/${familyData.id}/tasks`),
          {
            ...payload,
          }
        );

        setSnack(true);
        actions.resetForm();
        
      } catch (e) {
        console.log(e);
      }
    }

    // Handle form submission logic here
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    const combinedDateTime = new Date(
      formik.values.date.getFullYear(),
      formik.values.date.getMonth(),
      formik.values.date.getDate(),
      formik.values.time.getHours(),
      formik.values.time.getMinutes()
    );
    formik.setFieldValue("datetime", combinedDateTime);
    // console.log(combinedDateTime.toLocaleString());

    // console.log(combinedDateTime < new Date())
  }, [formik.values.date, formik.values.time]);

  useEffect(() => {
    
    // console.log(formik.values.datetime.toLocaleString(), "useEffect");
    if (formik.values.datetime < new Date()) {
      setDateTimeError("Date and time cannot be in the past");
    } else {
      setDateTimeError("");
    }
  }, [formik.values.datetime]);

  // console.log(formik.errors)
  // console.log(formik.values.datetime.toLocaleString());
  return (
    <View style={{}}>
      <ScrollView style={{ padding: 16 }}>
        
          <View style={{}}>
           

            <TextInput
              label="Title"
              mode="outlined"
              activeOutlineColor="#5640DA"
              value={formik.values.title}
              onChangeText={formik.handleChange("title")}
              error={formik.touched.title && formik.errors.title}
              style={{ marginBottom: 8}}
            />
            {formik.touched.title && formik.errors.title && (
              <Text style={{ color: "#c80909" }}>{formik.errors.title}</Text>
            )}

            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{ margin: 4 }}>
                <Button
                  mode="contained"
                  theme={{ colors: { primary: "#5640DA" } }}
                  onPress={() => {
                    setMode("date");
                    setOpen(true);
                  }}
                >
                  {formik.values.date.toLocaleDateString()}
                </Button>
              </View>
              <View style={{ margin: 4 }}>
                <Button
                  theme={{ colors: { primary: "#5640DA" } }}
                  mode="contained"
                  onPress={() => {
                    setMode("time");
                    setOpen(true);
                  }}
                >
                  {formik.values.time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Button>
              </View>
            </View>

            <Text style={{ color: "#c80909", marginBottom: 8 }}>
              {dateTimeError}
            </Text>

            

          
          {open && (
            <View style={details.dateTime}>
              <DateTimePicker
                testID="dateTimePicker"
                value={mode === 'date' ? formik.values.date: formik.values.time}
                mode={mode}
                is24Hour={false}
                onChange={(event, selectedDate) => {
                  // console.log(selectedDate)
                  
                  if (selectedDate !== undefined) {
                    if (mode === "date") {
                      formik.setFieldValue("date", selectedDate);

                      if(Platform.OS === 'ios'){
                        return
                      } else {
                        setOpen(false);
                      }
                     
                    } else if (mode === "time") {
                      formik.setFieldValue("time", selectedDate);
                      if(Platform.OS === 'ios'){
                        return
                      } else {
                        setOpen(false);
                      }
                      
                  
                    }
                  }
                }}
              />

              {Platform.OS === 'ios' && <IconButton icon='check' onPress={()=>setOpen(false)} color="#5640DA"/>}
               </View>
            )}

         

            {members && (
              <SelectDropdown
                data={members.docs}
                onSelect={(selectedAssignee) =>
                  formik.setFieldValue("assignee", selectedAssignee)
                }
                dropdownStyle={{ width: "90%" }}
                buttonStyle={{
                  width: "100%",
                  backgroundColor: "#5640DA",
                  marginBottom: 8,
                  borderRadius: 5,
                }}
                buttonTextStyle={{ color: "white" }}
                rowTextForSelection={(item) => {
                  return `${item.data().username}   points:${
                    item.data().points
                  }`;
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  // text to show after item is selected
                  // console.log(selectedItem)

                  return `${selectedItem.data().username} `;
                }}
                defaultButtonText="Select Assignee"
              />
            )}
            {formik.touched.assignee && formik.errors.assignee && (
              <Text style={{ color: "#c80909" }}>{formik.errors.assignee}</Text>
            )}

            <TextInput
              mode="outlined"
              label="Description"
              activeOutlineColor="#5640DA"
              value={formik.values.description}
              onChangeText={formik.handleChange("description")}
              multiline
              style={{ marginBottom: 8 }}
            />

            <SelectDropdown
              data={familyData.pointsCategory}
              rowTextForSelection={(item) => item.tag}
              buttonStyle={{
                width: "100%",
                backgroundColor: "#5640DA",
                marginBottom: 8,
                borderRadius: 5,
              }}
              buttonTextStyle={{ color: "white" }}
              onSelect={(selectedCategory) =>
                formik.setFieldValue("pointsCategory", selectedCategory)
              }
              buttonTextAfterSelection={(selectedItem, index) => {
                // text to show after item is selected
                return selectedItem.tag;
              }}
              defaultButtonText="Select Points Category"
            />
            {formik.touched.pointsCategory && formik.errors.pointsCategory && (
              <Text style={{ color: "#c80909" }}>
                {formik.errors.pointsCategory}
              </Text>
            )}

            <Button
              theme={{ colors: { primary: "#5640DA" } }}
              mode="contained"
              onPress={formik.handleSubmit}
            >
              Submit
            </Button>
          </View>

          
        
      </ScrollView>
      <View style={{bottom:0}}>
            <Snackbar
              visible={snack}
              onDismiss={() => setSnack(false)}
              duration={1000}
            >
              Task Created!
            </Snackbar>
          </View>
    </View>
  );
};

const AddTask = ({ navigation, route }) => {
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
          Add Task
        </Text>
        <ScrollView>
        {familyData && <Form userID={userID} familyData={familyData} />}
        </ScrollView>
        
      </View>
    </View>
  );
};

export default AddTask;
