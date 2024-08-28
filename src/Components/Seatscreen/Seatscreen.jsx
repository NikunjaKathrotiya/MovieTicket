import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Seatscreen/Seatscreen.css";
import Book from "../Book/Book";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 10;

const generateSeatGrid = () => {
  return rows.map((row) =>
    Array.from({ length: seatsPerRow }, (_, i) => `${row}${i + 1}`)
  );
};

const getRowIndex = (seat) => rows.indexOf(seat[0]);
const getSeatNumber = (seat) => parseInt(seat.slice(1), 10);

const getContiguousSeats = (startSeat, count) => {
  const rowIndex = getRowIndex(startSeat);
  const seatNumber = getSeatNumber(startSeat);
  const seats = [];

  for (let i = 0; i < count; i++) {
    const seatNumInRow = seatNumber + i;
    if (seatNumInRow <= seatsPerRow) {
      seats.push(`${rows[rowIndex]}${seatNumInRow}`);
    } else {
      break;
    }
  }
  return seats;
};

export default function Seatscreen() {
  const [seatGrid] = useState(generateSeatGrid());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [maxSeats, setMaxSeats] = useState(1);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const seats = parseInt(queryParams.get("seats") || "1", 10);

    setMaxSeats(seats);
    const storedBookedSeats = JSON.parse(
      localStorage.getItem("bookedSeats") || "[]"
    );
    const storedSelectedSeats = JSON.parse(
      localStorage.getItem("selectedSeats") || "[]"
    );
    const validSelectedSeats = storedSelectedSeats.filter(
      (seat) => !storedBookedSeats.includes(seat)
    );
console.log(validSelectedSeats);
    setSelectedSeats(validSelectedSeats);
    setBookedSeats(storedBookedSeats);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  useEffect(() => {
    localStorage.setItem("bookedSeats", JSON.stringify(bookedSeats));
  }, [bookedSeats]);

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat)) return;

    if (selectedSeats.length >= maxSeats) {
      alert("You have already selected the maximum number of seats.");
      return;
    }

    const contiguousSeats = getContiguousSeats(
      seat,
      maxSeats - selectedSeats.length
    );
    setSelectedSeats((prevSelectedSeats) => {
      const newSelectedSeats = new Set(prevSelectedSeats);
      const shouldSelect = !newSelectedSeats.has(seat);
      contiguousSeats.forEach((s) => {
        if (shouldSelect) {
          newSelectedSeats.add(s);
        } else {
          newSelectedSeats.delete(s);
        }
      });
      return Array.from(newSelectedSeats).slice(0, maxSeats);
    });
  };

  const handleBookClick = (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) return;

    const updatedBookedSeats = [...new Set([...bookedSeats, ...selectedSeats])];
    localStorage.setItem("bookedSeats", JSON.stringify(updatedBookedSeats));
    setBookedSeats(updatedBookedSeats);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/Seatscreen", { state: { selectedSeats: bookedSeats } });
  };

  return (
    <div className="seatscreen-container">
      <h2>Select Your Seats</h2>
      <div className="seat-grid">
        {seatGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat) => (
              <div
                key={seat}
                className={`seat ${
                  selectedSeats.includes(seat) ? "selected" : ""
                } ${bookedSeats.includes(seat) ? "booked" : ""}`}
                onClick={() => handleSeatClick(seat)}
                style={{
                  cursor: bookedSeats.includes(seat)
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {seat}
              </div>
            ))}
          </div>
        ))}
      </div>
      {selectedSeats.length === maxSeats && (
        <button className="book-btn" onClick={handleBookClick}>
          Book Now
        </button>
      )}

      {isModalOpen && (
        <Book
          closeModal={closeModal}
          handlePaymentSubmit={() => {}}
          bookedSeats={bookedSeats}
        />
      )}
    </div>
  );
}
