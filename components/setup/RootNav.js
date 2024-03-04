import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase-config";
import { Text, View } from "react-native";
import { SignedInStack, SignedOutStack } from "./Navs";

export default function RootNavigation() {
  const [userUid, setUserUid] = useState(null);
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  onAuthStateChanged(auth, async (user) => {
    
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      try {
    
        setUserUid(user.uid);
    
      } catch (e) {
        // read error
        console.log("authError: ", e);
      }

      // console.log('root', uidObjectStr)
    } else {
      // User is signed out
      setUserUid(undefined); 
    }
  });

  // Render the appropriate stack based on the presence of the UID
  return userUid ? <SignedInStack userID={userUid} /> : <SignedOutStack />;
}
