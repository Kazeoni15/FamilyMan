import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { auth, db, storage } from "../firebase-config";
import { ScrollView, View, Image, TouchableOpacity } from "react-native";
import {
  Button,
  HelperText,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { details, element, page, userDet } from "../styles/basic";
import { signOut } from "firebase/auth";
import { useFormik } from "formik";
import * as ImagePicker from "expo-image-picker";
import * as Yup from "yup";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const validationSchema = Yup.object().shape({
  firstname: Yup.string().required("First Name is required"),
  lastname: Yup.string().required("Last Name is required"),
});

const UserSettingsPage = ({ navigation, userID, familyData, memData }) => {
  const [activity, setActivity] = useState(false);
  const [image, setImage] = useState(null);

  initialValues = {
    firstname: memData.firstname || "",
    lastname: memData.lastname || "",
  };

  const handleUpload = () => {
    if (image.type === "image") {
      if (memData.avatar) {
        const delRef = ref(storage, memData.avatar.location);
        deleteObject(delRef)
          .then(() => {
            fetch(image.uri)
              .then((response) => response.blob())
              .then((blob) => {
                const imgRef = ref(
                  storage,
                  `${userID.uid}/avatar/${
                    image.uri.split("/")[image.uri.split("/").length - 1]
                  }`
                );

                uploadBytesResumable(imgRef, blob).then((snapshot) => {
                  getDownloadURL(snapshot.ref).then((url) => {
                    const docRef = doc(
                      db,
                      "families",
                      familyData.id,
                      "members",
                      userID
                    );
                    updateDoc(docRef, {
                      avatar: { url: url, location: snapshot.ref.fullPath },
                    });
                  });
                });
              })
              .catch((error) => {
                console.error("Error fetching and uploading image:", error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        fetch(image.uri)
          .then((response) => response.blob())
          .then((blob) => {
            const imgRef = ref(
              storage,
              `${userID}/avatar/${
                image.uri.split("/")[image.uri.split("/").length - 1]
              }`
            );

            uploadBytesResumable(imgRef, blob).then((snapshot) => {
              getDownloadURL(snapshot.ref).then((url) => {
                const docRef = doc(
                  db,
                  "families",
                  familyData.id,
                  "members",
                  userID
                );
                updateDoc(docRef, {
                  avatar: { url: url, location: snapshot.ref.fullPath },
                });
              });
            });
          })
          .catch((error) => {
            console.error("Error fetching and uploading image:", error);
          });
      }
    }
  };

  const onSubmit = async (values, actions) => {
    console.log(values);
    setActivity(true);
    if (image) {
      handleUpload();
      setImage("");
    }

    try {
      await updateDoc(doc(db, "families", familyData.id, "members", userID), {
        firstname: values.firstname,
        lastname: values.lastname,
      });
    } catch (e) {
      console.log(e);
    }

    setActivity(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  //   console.log(familyData);

  const {
    values,
    errors,
    touched,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
  } = formik;
  return (
    <View style={userDet.settings}>
      <View>
        <View style={element.flex2}>
          <View>
            {memData.avatar?.url && !image ? (
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{ uri: memData.avatar.url }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                    marginBottom: 20,
                  }}
                />
              </TouchableOpacity>
            ) : (
              <View>
                {!image && (
                  <IconButton
                    icon={"camera"}
                    iconColor="#313866"
                    onPress={pickImage}
                  />
                )}
              </View>
            )}

            {image && (
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: 100, height: 100, borderRadius: 100,  marginBottom: 20, }}
                />
              </TouchableOpacity>
            )}
          </View>

          <IconButton
            icon="reload"
            color="#5640DA"
            onPress={() => {
              setImage("");
              formik.resetForm();
            }}
          />
        </View>

        <View style={{ gap: 5 }}>
          <TextInput
            label="First Name"
            mode="outlined"
            value={values.firstname}
            onChangeText={handleChange("firstname")}
            onBlur={handleBlur("firstname")}
            outlineColor="#5640DA"
            error={errors.firstname && touched.firstname}
          />
          {errors.firstname && touched.firstname && (
            <HelperText type="error">{errors.firstname}</HelperText>
          )}

          <TextInput
            label="Last Name"
            mode="outlined"
            value={values.lastname}
            onChangeText={handleChange("lastname")}
            onBlur={handleBlur("lastname")}
            outlineColor="#5640DA"
            error={errors.lastname && touched.lastname}
          />
          {errors.lastname && touched.lastname && (
            <HelperText type="error">{errors.lastname}</HelperText>
          )}
        </View>
      </View>

      <Button
        mode="contained"
        loading={activity}
        onPress={() => handleSubmit()}
      >
        Save
      </Button>

      <Button
        style={{ marginVertical: 40 }}
        icon={"logout"}
        color={"#5640DA"}
        onPress={async () => {
          try {
            // Add any additional logout logic here (e.g., sign out from Firebase)

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
    </View>
  );
};

const UserSettingsContainer = ({ navigation, route }) => {
  const { userID } = route.params;
  const [familyData, setFamilyData] = useState(null);
  const [memData, setMemData] = useState(null);

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
        doc(db, "families", familyData.id, "members", userID),
        (doc) => {
          setMemData({ ...doc.data(), id: doc.id });
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
          Settings
        </Text>

        {familyData && memData && (
          <ScrollView>
            <UserSettingsPage
              userID={userID}
              familyData={familyData}
              navigation={navigation}
              memData={memData}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default UserSettingsContainer;
