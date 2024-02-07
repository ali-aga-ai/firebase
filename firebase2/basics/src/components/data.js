import React, { useState, useEffect } from "react";
import { app, database } from "./firebaseconfig";
import { collection, addDoc } from "firebase/firestore"; // Corrected import statement
import { query, where, getDocs,deleteDoc, doc } from 'firebase/firestore';

function Data() {
  const [data, setData] = useState({}); // Fixed the syntax error in the useState
  const [entries, setEntries] = useState([]);
  const [showData, setShowData] = useState(false);
  const [tailor_list, setTailorList] = useState([]);


  //this is the name for tailors dtabase
  const collectionRef = collection(database, 'tailors');




  const handleInput = (event) => {
    let newInput = { [event.target.name]: event.target.value };
    setData({ ...data, ...newInput });
  };




const handleSubmit = async () => {
  const tailorName = data.tailor_name;
  const phoneNumber = data.phone;

  // Check if the tailor with the same name and phone number already exists
  const query = await getDocs(collectionRef);
  // query now holds the database pointed by collectionRef
  const existingTailor = query.docs.find((doc) => doc.data().tailor_name === tailorName && doc.data().phone_number === phoneNumber);
//query.docs is an array containing all documents retrreived from firestore colleciton
//find() finds from the database. it returns 'undefined' if not data not found
//doc.data() checks a singular data field, us data field ka it checks tailor_name field first then phone_number whether it matches input

  if (!existingTailor) {
    // If no matching documents found, add the new tailor
    try {
      await addDoc(collectionRef, {
        tailor_name: tailorName,
        phone_number: phoneNumber,
      });
      alert('Tailor Added');
      setData({});
    } catch (err) {
      alert(err.message);
    }
  } else {
    alert('Tailor with the same name and phone number already exists.');
  }

};

const fetchEntries = async () => {
    try {
        const querySnapshot = await getDocs(collectionRef);
        const newEntries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(newEntries);
        
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleViewButtonClick = () => {
    fetchEntries();
    setShowData(true);
  };

  const handleHideData = () => {
    setShowData(false);
  };

  
  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteDoc(doc(collectionRef, entryId));
      fetchEntries(); // Fetch entries again after deletion to update the UI
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };
  



  useEffect(() => {//useEffect can be used for data fetching. it provides a way to do these operations without blocking the main thread
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collectionRef); //a query which gets the databse
        const fetchedData = querySnapshot.docs.map((doc) => doc.data().tailor_name); //thhe map is a js function which iterates through all elements
        //fetched data is an array of strings of tailors
        //(()=>{}) in an arrow fn the inside () is the paramter list  and the {} is the return function, so we take doc and return tailor name
        setTailorList(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData(); // Call the fetchData function
  
  }, [collectionRef, setTailorList]);












  



  return (
    <div className="Data">
      <input
        name='tailor_name'
        placeholder='Tailor Name'
        value={data.tailor_name || ''}
        onChange={(event) => handleInput(event)}
      />

      <input
        type="number"
        name='phone'
        placeholder='Phone Number'
        value={data.phone || ''} //turns value empty if succesfully added
        onChange={(event) => handleInput(event)}
      />

      <br />

      <button type='button' onClick={handleSubmit}>Add</button> {/* Added type='button' to prevent form submission */}



      <button onClick={handleViewButtonClick}>View Entries</button>

      {showData && (
        <div>
          <button onClick={handleHideData}>Hide Entries</button>
          <ul>
            {entries.map((entry, index) => (
              <li key={index}>{entry.tailor_name} - {entry.phone_number}
                              <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
            </li>
            ))}
          </ul>
        </div>
      )}

      <br />
      <br />

      <label htmlFor="dataSelector">Select Data:</label>
            <select id="dataSelector">
              {tailor_list.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
    </div>
  );
}

export default Data;


/*ill do a few basic things todya:
add functionality of  assigning a taylor a dress
create a combo box where the admin can choose a tailor
then in  atext field he will write something about the dress he is giving
 */