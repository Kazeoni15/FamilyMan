import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ActivityIndicator, Button, TextInput } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormTextInput from '../FormTextInput';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timestamp, collection, doc, getCountFromServer, query, setDoc, where } from 'firebase/firestore';



const validationSchema = Yup.object().shape({
    email: Yup.string().email().required('Email is required'),
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup
    .string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
  });
  
  const RegisterScreen = ({ navigation }) => {

    const [activity, setActivity] = useState(false)


    const auth = getAuth()

    const handleRegister = async (values, actions) => {
      // console.log('pressed')
      setActivity(true)
      try {
        if (
          (
            await getCountFromServer(
              query(
                collection(db, "users"),
                where("username", "==", values.username)
              )
            )
          ).data().count !== 0
        ) {
          throw { code: "existing-username" };
        }

        const r = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        await AsyncStorage.setItem('UID', JSON.stringify({ uid: r.user.uid }));

        try {
          await setDoc(doc(db, "users", r.user.uid), {
            email: values.email,
            username: values.username,
            created: Timestamp.now(),
            familyId:null,

           
          });

          




          

       
        } catch (err) {
          console.log(err);
        }
      } catch (err) {
        console.log(err)
        setActivity(false)
        switch (err.code) {
          case "existing-username":
            actions.setFieldError("username", "Username is already taken");
            break;
          case "auth/weak-passwork":
            actions.setFieldError("password", "Password too weak");
            break;
          default:
            actions.setFieldError(
              "confirm-password",
              err.code ?? "Something went wrong. Please try again"
            );
            break;
        }
      }
       
      };
      
     
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>FamilyMan</Text>
        <Formik
          initialValues={{ username:'', email: '', password: '', confirmPassword:'' }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => handleRegister(values, actions)}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <FormTextInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                error={touched.email && errors.email}
                autoCapitalize="none"
              />
              <FormTextInput
                label="Username"
                value={values.username}
                onChangeText={handleChange('username')}
                error={touched.email && errors.username}
                autoCapitalize="none"
              />
              <FormTextInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                autoCapitalize="none"
                error={touched.password && errors.password}
               
              />
              <FormTextInput
                label="Confirm Password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                autoCapitalize="none"
                error={touched.confirmPassword && errors.confirmPassword}
                
              />
             
              <Button  style={{ marginTop: 10 }} buttonColor="#5640DA" textColor="#fff" mode="contained" onPress={handleSubmit}>
                Register
              </Button>

              <ActivityIndicator animating={activity} color={"#5640DA"} />


              
            </View>
          )}
        </Formik>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container:{
      backgroundColor:'#fff',
      flex:1,
      paddingTop:50,
      alignItems:'center',
      
      
    }, form:{
      display:"flex",
      rowGap:10,
      marginTop:40,
      width:"90%",
  
    }, title: {
      fontWeight:'bold',    
      fontSize: 24,
      color: "#5640DA",
      letterSpacing:5,
      marginBottom: 10,
      marginTop:30,
    },
    
  });
  
  
  export default RegisterScreen;
