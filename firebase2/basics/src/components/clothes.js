import React, { useState, useEffect } from "react";
import { app, database } from "./firebaseconfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

function Clothes() {
  const [data, setData] = useState({});
  const [showData, setShowData] = useState(false);
  const [showClothes, setShowClothes] = useState(false);
  const [tailorList, setTailorList] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState('');
  const [selectedTailorId, setSelectedTailorId] = useState('');
  const [selectedTailorClothes, setSelectedTailorClothes] = useState([]);

  const collectionRef = collection(database, 'tailors');
  const clothDB = collection(database, 'clothes');

  const handleInput = (event) => {
    let newInput = { [event.target.name]: event.target.value };
    setData({ ...data, ...newInput });
  };

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const fetchedData = querySnapshot.docs.map((doc) => doc.data().tailor_name);
      setTailorList(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [collectionRef, setTailorList]);

  const handleTailorSelection = (event) => {
    setSelectedTailor(event.target.value);
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteDoc(doc(collectionRef, entryId));
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
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
    setShowClothes(false);
  };

  const handleClothesAssigned = () => {
    fetchSelectedTailorClothes();
    setShowClothes(true);
  };

  const newTailor = async () => {
    const tailorName = data.tailor_name;
    const phoneNumber = data.phone;

    const querySnapshot = await getDocs(collectionRef);
    const existingTailor = querySnapshot.docs.find(
      (doc) => doc.data().tailor_name === tailorName && doc.data().phone_number === phoneNumber
    );

    if (!existingTailor) {
      try {
        await addDoc(collectionRef, {
          tailor_name: tailorName,
          phone_number: phoneNumber,
        });
        alert('Tailor Added');
        setData({});
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('Tailor with the same name and phone number already exists.');
    }
  };

  const handleSubmit = async () => {
    const tailorName = selectedTailor;
    const phoneNumber = data.phone;
    const cloth = data.cloth;
    const return_date = data.return_date;

    if (tailorName) {
      try {
        const tailorQuery = await getDocs(query(collectionRef, where('tailor_name', '==', tailorName)));

        if (!tailorQuery.empty) {
          const existingTailor = tailorQuery.docs[0].data();
          const tailorId = tailorQuery.docs[0].id;

          await addDoc(clothDB, {
            tailorName: existingTailor.tailor_name,
            clothes: cloth,
            return_date: return_date,
            tailorId: tailorId,
            status: "not returned",
          });

          alert('Successfully Added');
          setData({});
        } else {
          alert('Tailor does not exist in the collectionRef.');
        }
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('Tailor name is not defined.');
    }
  };

  const handleReturn = async (clothId, tailorId) => {
    try {
      const clothDocRef = doc(clothDB, clothId);
      await updateDoc(clothDocRef, { status: "returned" });

      fetchSelectedTailorClothes(tailorId);
    } catch (error) {
      console.error('Error updating cloth status:', error);
    }
  };

  const fetchSelectedTailorClothes = async () => {
    try {
      const clothesQuerySnapshot = await getDocs(query(clothDB, where('tailorId', '==', selectedTailorId)));
      const clothesData = clothesQuerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSelectedTailorClothes(clothesData);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

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

  return (
    <div className="clothes">
      {/* Add Tailor Form */}
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
        value={data.phone || ''}
        onChange={(event) => handleInput(event)}
      />
      <button type='button' onClick={newTailor}>Add</button>

      {/* View Entries */}
      <button onClick={handleViewButtonClick}>View Entries</button>
      {showData && (
        <div>
          <button onClick={handleHideData}>Hide Entries</button>
          <ul>
            {entries.map((entry, index) => (
              <li key={index}>
                {entry.tailor_name} - {entry.phone_number}
                <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <br/>
      <br/>
      <br/>
      <br/>

      {/* Give Clothes Form */}
      <label htmlFor="viewTailorSelector">Select Tailor:</label>
      <select id="viewTailorSelector" onChange={handleTailorSelection}>
        {tailorList.map((item) => (
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
        value={data.return_date || ''}
        onChange={(event) => handleInput(event)}
      />
      <button type='button' onClick={handleSubmit}>Give</button>

      <br/>
      <br/>
      <br/>
      <br/>


      {/* View Tailor's Assigned Clothes */}
      <label htmlFor="dataSelector">Select Tailor to View Assigned Clothes: </label>
      <select id="dataSelector" onChange={handleTailorSelection}>
        {tailorList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button onClick={handleClothesAssigned}>View Entries</button>

      {showClothes && (
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