import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ScrollView, View } from "react-native";
import { db } from "../firebase-config";
import { Text } from "react-native-paper";
import { details, element } from "../styles/basic";
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

const FamilySettingsPage = ({ navigation, userID, familyData }) => {
  // console.log(familyData.dailyTaskLimit)

  const [activity, setActivity] = useState(false);

  initialValues = {
    pointsCategory: familyData.pointsCategory,
    dailyTaskLimit: familyData.dailyTaskLimit,
    appointModerator: familyData.moderator || "",
  };

  const [members, loading, merrors] = useCollection(
    collection(db, `families/${familyData.id}/members`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const onSubmit = async (values, actions) => {
    console.log(values);

    setActivity(true);

    try {
      await updateDoc(doc(db, "families", familyData.id), {
        pointsCategory: values.pointsCategory,
        dailyTaskLimit: values.dailyTaskLimit,
        moderator: values.appointModerator,
      });
      setActivity(false);
    } catch (e) {
      setActivity(false);
      console.log(e);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const { errors, touched, handleSubmit, handleChange, handleBlur, values } =
    formik;

  // console.log(userID, familyData);
  const addField = () => {
    const newFields = [...values.pointsCategory, { tag: "", points: "" }];
    formik.setFieldValue("pointsCategory", newFields);
  };
  const removeField = (indexToRemove) => {
    const newFields = values.pointsCategory.filter(
      (_, index) => index !== indexToRemove
    );
    formik.setFieldValue("pointsCategory", newFields);
  };

  return (
    <View style={details.container}>
      <Text style={{ marginBottom: 10, ...details.highlightedInfo }}>
        Points Category
      </Text>

      {formik.values.pointsCategory.map((field, index) => {
        // console.log(values.pointsCategory[index].points);

        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 2,
            }}
            key={index}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <View style={{ alignItems: "center" }}>
                <TextInput
                  style={{ width: 100 }}
                  mode="outlined"
                  onChangeText={(value) => {
                    // console.log(value)
                    formik.setFieldValue(`pointsCategory[${index}].tag`, value);
                  }}
                  error={
                    errors.pointsCategory &&
                    errors.pointsCategory[index] &&
                    errors.pointsCategory[index].tag
                  }
                  // onBlur={handleBlur(`values.pointsCategory[${index}].tag`)}
                  value={values.pointsCategory[index].tag}
                  label="Tag"
                  outlineColor="#5640DA"
                />
                {/* {errors.pointsCategory &&
                  errors.pointsCategory[index] &&
                  errors.pointsCategory[index].tag && (
                    <HelperText type='error'>{errors.pointsCategory[index].tag}</HelperText>
                  )} */}
              </View>

              <View style={{ alignItems: "center" }}>
                <TextInput
                  style={{ width: 100 }}
                  mode="outlined"
                  onChangeText={(value) => {
                    // console.log(value)
                    formik.setFieldValue(
                      `pointsCategory[${index}].points`,
                      value
                    );
                  }}
                  error={
                    errors.pointsCategory &&
                    errors.pointsCategory[index] &&
                    errors.pointsCategory[index].points
                  }
                  // onBlur={handleBlur(`values.pointsCategory[${index}].points`)}
                  value={values.pointsCategory[index].points.toString()}
                  label="Points"
                  outlineColor="#5640DA"
                  keyboardType="numeric"
                />
                {/* {errors.pointsCategory &&
                  errors.pointsCategory[index] &&
                  errors.pointsCategory[index].points && (
                    <HelperText type='error'>{errors.pointsCategory[index].points}</HelperText>
                  )} */}
              </View>
            </View>

            {values.pointsCategory.length > 2 && (
              <IconButton
                icon="minus"
                color={"#c80909"}
                onPress={() => removeField(index)}
              />
            )}
          </View>
        );
      })}

      <IconButton icon="plus" color="#5640DA" onPress={addField} />

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Text style={{ ...details.highlightedInfo }}>Moderator</Text>
        <IconButton
          color="#c80909"
          icon="account-remove"
          onPress={async () => {
            formik.setFieldValue("appointModerator", null);
          }}
        />
      </View>

      {members && (
        <SelectDropdown
          data={[...members.docs]}
          onSelect={(selectedAssignee) =>
            formik.setFieldValue(
              "appointModerator",
              selectedAssignee.data().username
            )
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
            return `${item.data().username}`;
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text to show after item is selected
            // console.log(selectedItem)

            if (!values.appointModerator) {
              return "Appoint Moderator";
            } else {
              return `${values.appointModerator} `;
            }
          }}
          defaultButtonText={values.appointModerator || 'Appoint Moderator'}
        />
      )}
      {formik.touched.appointModerator && formik.errors.appointModerator && (
        <Text style={{ color: "#c80909" }}>
          {formik.errors.appointModerator}
        </Text>
      )}

      <Text style={{ marginVertical: 20, ...details.highlightedInfo }}>
        Daily task limit
      </Text>

      <TextInput
        style={{ width: 200 }}
        mode="outlined"
        onChangeText={(value) => {
          formik.setFieldValue(`dailyTaskLimit`, value);
        }}
        error={errors.dailyTaskLimit}
        // onBlur={handleBlur(`values.pointsCategory[${index}].points`)}
        value={values.dailyTaskLimit}
        label="Daily task limit"
        outlineColor="#5640DA"
        keyboardType="numeric"
      />

      <Button
        loading={activity}
        mode="contained"
        color="#5640DA"
        style={{ marginBottom: 400, marginTop: 20 }}
        onPress={() => handleSubmit()}
      >
        Save
      </Button>
    </View>
  );
};

const FamilySettingsContainer = ({ navigation, route }) => {
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
          Family Settings
        </Text>

        {familyData && (
          <ScrollView>
            <FamilySettingsPage
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

export default FamilySettingsContainer;
