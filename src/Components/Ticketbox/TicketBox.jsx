import React, { useState, useEffect } from "react";
import "../Ticketbox/Ticketbox.css";
import logo2 from "../../assets/seating.jpg";
import { useNavigate } from "react-router-dom";

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

    const bookedSeatsSet = new Set(bookedSeats);

    if (bookedSeatsSet.has(selectedSeats)) {
      alert("The selected number of seats is already booked. Please choose a different number.");
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
            className={`number-btn ${bookedSeats.includes(num) ? "booked" : ""} ${selectedSeats === num ? "active" : ""}`}
            onClick={() => setSelectedSeats(num)}
            disabled={bookedSeats.includes(num)}
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
