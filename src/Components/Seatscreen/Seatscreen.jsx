import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Seatscreen/Seatscreen.css";
import Book from "../Book/Book";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 10;

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
  const [seatGrid, setSeatGrid] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [maxSeats, setMaxSeats] = useState(1);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the seat data from the API
    fetch("https://66cefbaf901aab24842067f7.mockapi.io/seats/seats")
      .then((response) => response.json())
      .then((data) => {
        // Process the data to match the required format
        const formattedSeatGrid = rows.map((row) =>
          Array.from({ length: seatsPerRow }, (_, i) => ({
            number: `${row}${i + 1}`,
            status: "available",
            color: "white"  
          }))
        );

        // Update formattedSeatGrid based on fetched data
        data.forEach((category) => {
          Object.entries(category.seats).forEach(([row, seats]) => {
            const rowIndex = rows.indexOf(row);
            if (rowIndex !== -1) {
              seats.forEach(seat => {
                const seatIndex = getSeatNumber(seat.number) - 1;
                formattedSeatGrid[rowIndex][seatIndex] = seat;
              });
            }
          });
        });

        setSeatGrid(formattedSeatGrid);
      })
      .catch((error) => console.error("Error fetching seat data:", error));

    const queryParams = new URLSearchParams(window.location.search);
    const seats = parseInt(queryParams.get("seats") || "1", 10);
    setMaxSeats(seats);

    const storedBookedSeats = JSON.parse(
      localStorage.getItem("bookedSeats") || "[]"
    );
    const storedSelectedSeats = JSON.parse(
      localStorage.getItem("selectedSeats") || "[]"
    );

    setSelectedSeats(storedSelectedSeats);
    setBookedSeats(storedBookedSeats);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  useEffect(() => {
    localStorage.setItem("bookedSeats", JSON.stringify(bookedSeats));
  }, [bookedSeats]);

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat.number)) {
      return;
    }

    if (selectedSeats.length >= maxSeats) {
      const isAlreadySelected = selectedSeats.includes(seat.number);
      if (isAlreadySelected) {
        setSelectedSeats([]);
      } else {
        setSelectedSeats([seat.number]);
      }
      return;
    }

    const contiguousSeats = getContiguousSeats(
      seat.number,
      maxSeats - selectedSeats.length
    );

    setSelectedSeats((prevSelectedSeats) => {
      const newSelectedSeats = new Set(prevSelectedSeats);
      const shouldSelect = !newSelectedSeats.has(seat.number);

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
                key={seat.number}
                className={`seat ${
                  selectedSeats.includes(seat.number) ? "selected" : ""
                } ${bookedSeats.includes(seat.number) ? "booked" : ""}`}
                onClick={() => handleSeatClick(seat)}
                style={{
                  cursor: bookedSeats.includes(seat.number)
                    ? "not-allowed"
                    : "pointer",
                  backgroundColor: seat.color 
                }}
              >
                {seat.number}
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
