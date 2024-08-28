import React, { useState, useEffect } from "react";
import "../Ticketbox/Ticketbox.css";
import logo2 from "../../assets/seating.jpg";
import { useNavigate } from "react-router";

export default function TicketBox() {
  const [selectedSeats, setSelectedSeats] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedBookedSeats = JSON.parse(localStorage.getItem("bookedSeats")) || [];
    setBookedSeats(storedBookedSeats);
  }, []);

  const handleSelectSeats = () => {
    if (selectedSeats === null) {
      alert("Please select a number of seats before proceeding.");
      return;
    }

    // Check if selected seats overlap with booked seats
    if (bookedSeats.includes(selectedSeats)) {
      alert("The selected seats are already booked. Please choose different seats.");
      return;
    }
  
    localStorage.setItem("selectedSeatsCount", JSON.stringify(selectedSeats));
    navigate(`/seatscreen?seats=${selectedSeats}`);
  };  
  

  const number = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="container">
      <h2>How Many Seats</h2>
      <div className="img-part">
        <img src={logo2} alt="Seating" className="logo2" />
      </div>
      <div className="button-container">
        {number.map((num) => (
          <button
            key={num}
            className={`number-btn ${selectedSeats === num ? "active" : ""}`}
            onClick={() => setSelectedSeats(num)}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="skims">
        <div>
          <p>
            Lounger
            <br />
            Rs.150
            <br />
            Available
          </p>
        </div>
        <div>
          <p>
            Slider Sofa
            <br />
            Rs.140
            <br />
            Available
          </p>
        </div>
      </div>
      <button className="seats" onClick={handleSelectSeats}>
        Select Seats
      </button>
    </div>
  );
}
