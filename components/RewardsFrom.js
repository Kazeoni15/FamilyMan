import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, HelperText, Text } from "react-native-paper";
import { Formik } from "formik";
import * as yup from "yup";
import { db } from "../firebase-config";
import { doc, addDoc, collection } from "firebase/firestore";
import { rewards } from "../styles/basic";

const validationSchema = yup.object().shape({
  reward: yup.string().required("Reward is required"),
  description: yup.string().required("Description is required"),
  points: yup
    .number()
    .required("Points are required")
    .min(0, "Points must be greater than or equal to 0"),
});

const RewardsFrom = ({ open, setOpen, familyID }) => {
  const [activity, setActivity] = useState(false);

  const onSubmit = async (values, actions) => {
    setActivity(true);

    try {
      const response = await addDoc(
        collection(db, "families", familyID, "rewards"),
        {
          reward: values.reward,
          description: values.description,
          points: values.points,
          favoritedBy: [],
          claimedBy: [],
        }
      );

      setActivity(false);
      setOpen(false);
    } catch (e) {
      console.log(e);
      setActivity(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{...rewards.name, textAlign:"center", marginBottom:10}}>Add Reward</Text>
      <Formik
        initialValues={{ reward: "", description: "", points: "" }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
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
            <TextInput
              outlineColor="#5640DA"
              mode="outlined"
              label="Reward"
              value={values.reward}
              onChangeText={handleChange("reward")}
              onBlur={handleBlur("reward")}
              error={touched.reward && errors.reward}
            />
            {touched.reward && errors.reward && (
              <HelperText type="error">{errors.reward}</HelperText>
            )}

            <TextInput
              outlineColor="#5640DA"
              mode="outlined"
              label="Description"
              value={values.description}
              onChangeText={handleChange("description")}
              onBlur={handleBlur("description")}
              error={touched.description && errors.description}
              multiline
            />
            {touched.description && errors.description && (
              <HelperText type="error">{errors.description}</HelperText>
            )}

            <TextInput
              outlineColor="#5640DA"
              mode="outlined"
              label="Points"
              value={values.points}
              onChangeText={handleChange("points")}
              onBlur={handleBlur("points")}
              error={touched.points && errors.points}
              keyboardType="numeric"
            />
            {touched.points && errors.points && (
              <HelperText type="error">{errors.points}</HelperText>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <Button
                loading={activity}
                mode="contained"
                color="#5604DA"
                onPress={handleSubmit}
              >
                Submit
              </Button>
              <Button color="#5604DA" onPress={()=>setOpen(false)}>Cancel</Button>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default RewardsFrom;
