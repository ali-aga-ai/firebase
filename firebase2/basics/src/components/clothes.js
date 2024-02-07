import React, { useState, useEffect } from "react";
import { app, database } from "./firebaseconfig";
import { collection, addDoc } from "firebase/firestore"; // Corrected import statement
import { query, where, getDocs,deleteDoc, doc } from 'firebase/firestore';
import { onSnapshot ,updateDoc} from 'firebase/firestore';

function Clothes() {
  const [data, setData] = useState({}); // Fixed the syntax error in the useState
  const [showData, setShowData] = useState(false);
  const [tailor_list, setTailorList] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState('');
  const [selectedTailorId, setSelectedTailorId] = useState(''); // Add this line

  const handleTailorSelection = (event) => {
    setSelectedTailor(event.target.value);
  };

  //this is the name for tailors dtabase
  const collectionRef = collection(database, 'tailors');
  const clothDB = collection(database, 'clothes');




  const handleInput = (event) => {
    let newInput = { [event.target.name]: event.target.value };
    setData({ ...data, ...newInput });
  };




  const handleSubmit = async () => {
    const tailorName = selectedTailor;
    const phoneNumber = data.phone;
    const cloth = data.cloth;
    const return_date = data.return_date;
  
    // Check if the tailor name is defined
    if (tailorName) {
      try {
        // Check if the tailor exists in the collectionRef
        const tailorQuery = await getDocs(query(collectionRef, where('tailor_name', '==', tailorName)));
  
        if (!tailorQuery.empty) {
          // Get the existing tailor's name from the collectionRef
          const existingTailor = tailorQuery.docs[0].data();
          const tailorId = tailorQuery.docs[0].id;

  
          // Add the new cloth with linked tailorName to the clothDB
          await addDoc(clothDB, {
            tailorName: existingTailor.tailor_name,
            clothes: cloth,
            return_date: return_date,
            tailorId: tailorId,
            status: "not returned"
          });
  
          alert('Successfully Added');
          setData({});
        } else {
          // If the tailor doesn't exist in collectionRef
          alert('Tailor does not exist in the collectionRef.');
        }
      } catch (err) {
        alert(err.message);
      }
    } else {
      // If the tailor name is not defined
      alert('Tailor name is not defined.');
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





  const [selectedTailorClothes, setSelectedTailorClothes] = useState([]);

  // Function to fetch and display clothes for the selected tailor
  const fetchSelectedTailorClothes = async (tailorId) => {
    try {
      const clothesQuerySnapshot = await getDocs(query(clothDB, where('tailorId', '==', tailorId)));
      const clothesData = clothesQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSelectedTailorClothes(clothesData);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collectionRef);
        const fetchedData = querySnapshot.docs.map((doc) => doc.data().tailor_name);
        setTailorList(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [collectionRef, setTailorList]);

  useEffect(() => {
    if (selectedTailor) {
      const selectedTailorQuery = query(collectionRef, where('tailor_name', '==', selectedTailor));
      const unsubscribe = onSnapshot(selectedTailorQuery, (snapshot) => {
        if (!snapshot.empty) {
          const tailorId = snapshot.docs[0].id;
          fetchSelectedTailorClothes(tailorId);
          setSelectedTailorId(tailorId);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedTailor, setSelectedTailorId]);

  


  const handleReturn = async (clothId, tailorId) => {
    try {
      // Update the status of the cloth to "returned"
      const clothDocRef = doc(clothDB, clothId);
      await updateDoc(clothDocRef, { status: "returned" });
  
      // Fetch the updated list of clothes
      fetchSelectedTailorClothes(tailorId);
    } catch (error) {
      console.error('Error updating cloth status:', error);
    }
  };
  
  return (
    <div className="clothes">


      <label htmlFor="viewTailorSelector">Select Tailor:</label>
            <select id="viewTailorSelector" onChange={handleTailorSelection}>
              {tailor_list.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>



    <input
        name='cloth'
        placeholder='Cloth'
        value={data.cloth || ''}
        onChange={(event) => handleInput(event)}
      />

      <input
        type="date"
        name='return_date'
        placeholder='return_date'
        value={data.return_date || ''} //turns value empty if succesfully added
        onChange={(event) => handleInput(event)}
      />

      <br />

      <button type='button' onClick={handleSubmit}>Give</button> 
      <br/><br/>








      <label htmlFor="dataSelector">Tailor whose Assigned clothes u would like to see: </label>
            <select id="dataSelector" onChange={handleTailorSelection}>
              {tailor_list.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>   

      <button onClick={handleViewButtonClick}>View Entries</button>

      {showData && (
        <div>
          <button onClick={handleHideData}>Hide Entries</button>
          <ul>
          {selectedTailorClothes.map((cloth) => (
  <li key={cloth.id}>
    {cloth.clothes} - {cloth.status}
    {cloth.status === 'not returned' && (
      <button onClick={() => handleReturn(cloth.id, selectedTailorId)}>Returned</button>
      )}
  </li>
))}


          </ul>
        </div>
      )}
    </div>



  );
}

export default Clothes;


/*here are functionalities the admin can do.
Add a tailor contractor
Give the tailor clothes
Have a track of the returned status of the cloth


to add: returned date 
to add: when i delete tailor i wanna delete all clothes associated with him       */