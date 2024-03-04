import { ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { page, details, element } from "../styles/basic";
import { useEffect } from "react";
import { addDoc, collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { useState } from "react";
import { DataTable } from "react-native-paper";

export default function TaskDetails({ navigation, route }) {
  const { userID, username, taskID, familyID } = route.params;
  const [task, setTask] = useState(null);

  // console.log(userID, taskID, familyID);
  // console.log(`families/${familyID}/tasks/${taskID}`)

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, `families/${familyID}/tasks/${taskID}`),
      (doc) => {
        // console.log(doc.data())
        const task = { ...doc.data(), id: doc.id };

        setTask(task);
      }
    );

    return () => {
      unsub();
    };
  }, [taskID]);

  return (
    <View style={details.container}>
      {/* <Text style={{...page.h2, marginTop: "5%", padding: 10}}>Task Details</Text> */}

      {task && (
        <View style={details.sections}>
          <View>
            <Text style={details.title}>{task.title}</Text>

            <View style={details.imp}>
              <Text style={element.stats}>
                Due by:{" "}
                {task.dueDate.toDate().toLocaleString("en-GB", {
                  weekday: "short",
                  year: "2-digit",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
              <Text style={element.stats}>{task.status.toUpperCase()}</Text>
            </View>

            <ScrollView style={{ height: 200 }}>
              <Text style={details.description}>{task.description}</Text>
            </ScrollView>
          </View>

          <View style={{ marginBottom: 10 }}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Assignee</DataTable.Title>

                {/* <DataTable.Title >Status</DataTable.Title> */}
                <DataTable.Title numeric>Priority</DataTable.Title>
                <DataTable.Title numeric>Points</DataTable.Title>
              </DataTable.Header>

              <DataTable.Row>
                <DataTable.Cell>{task.assignee}</DataTable.Cell>

                {/* <DataTable.Cell >{task.status}</DataTable.Cell> */}
                <DataTable.Cell numeric>
                  {task.pointsCategory.tag}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {task.pointsCategory.points}
                </DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </View>
          {!task.assignee && (
            <Button
              onPress={async () => {
                try {
                  await updateDoc(
                    doc(db, `families/${familyID}/tasks/${taskID}`),
                    {
                      assignee: username,
                    }
                  );
                } catch (error) {
                  console.log(error);
                }
              }}
              mode="contained"
            >
              Claim
            </Button>
          )}

          {task.assignee && task.assignee === username && (
            <Button
              onPress={async () => {
                console.log(task);
                try {
                  const r = await addDoc(
                    collection(db, `families/${familyID}/requests`),
                    {
                      task: task,
                      status: "pending",
                      type: 'task-update',
                      doneBy: userID
                    }
                  );

                  await updateDoc(
                    doc(db, "families", familyID, "tasks", task.id),
                    {
                      status: "Reviewing",
                    }
                  );
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              {" "}
              Task Done
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
