import { useState, useEffect } from "react";
import AuthContext from "./authContext";

export default function AuthContextProvider({ children }) {
const [userUid, setUserUid] = useState(null);
   






    useEffect(() => {
        // Function to retrieve the stored UID from AsyncStorage
        const getStoredUID = async () => {
          try {
            const uidObjectStr = await AsyncStorage.getItem('UID');
            // console.log("root",uidObjectStr)
            if (uidObjectStr) {
              const uidObject = JSON.parse(uidObjectStr);
              setUserUid(uidObject.uid);
            } else {
              setUserUid(null);
            }
          } catch (error) {
            console.error("Error while retrieving UID from AsyncStorage:", error);
            // Handle the error as needed (e.g., show an error screen)
            setUserUid(null);
          }
        };
    
        // Call the function to retrieve the stored UID
        getStoredUID();
      }, []);

      return(
        <AuthContext.Provider value={{userUid}}>
            {children} 
           
      
          
        </AuthContext.Provider>
      )






    }