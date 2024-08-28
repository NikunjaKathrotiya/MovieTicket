import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Seatscreen from "./Components/Seatscreen/Seatscreen";
import Home from "./Components/Home";
import Book from "./Components/Book/Book";
import Payment from "./Components/Payement/Payment";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  
  return (
    <Router>
         <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/seatscreen"
          element={<Seatscreen openModal={openModal} />}
        />
        <Route
          path="/book"
          element={<Book openModal={openModal} />}
        />
        <Route path="/Payment" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;
