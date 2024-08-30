import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Seatscreen/Seatscreen.css";
import Book from "../Book/Book";

// Define rows and row categories
const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const rowCategories = {
  gold: ["A", "B"],
  silver: ["C", "D"],
  platinum: ["E", "F", "G", "H"],
};

const seatsPerRow = 10;

const getRowIndex = (seat) => rows.indexOf(seat[0]); //give index of row based on seat label
const getSeatNumber = (seat) => parseInt(seat.slice(1), 10); // give only numeric number means seat number 1,2,3 up to 10

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
//this fun give continue selction from selected seat
 const getCategory = (row) => {
  for (const [category, rowsList] of Object.entries(rowCategories)) {
    if (rowsList.includes(row)) return category;
  }
  return "unknown";
};
//determine category of given row

export default function Seatscreen() {

  const [seatsByCategory, setSeatsByCategory] = useState({
    gold: {},
    silver: {},
    platinum: {},
  });
//holds the seat data orgainzed by category

  const [selectedSeats, setSelectedSeats] = useState([]);//track seat selected by user.
  const [maxSeats, setMaxSeats] = useState(1);//give maximum number of seat selected once
  const [bookedSeats, setBookedSeats] = useState([]); // keep record of booked seats.
  const [isModalOpen, setIsModalOpen] = useState(false); // keep visibilty of model
  const navigate = useNavigate(); // used for navigation

  useEffect(() => {
    fetch("https://66cefbaf901aab24842067f7.mockapi.io/seats/seats")
      .then((response) => response.json())
      .then((data) => {
        const categorizedSeats = {
          gold: {},
          silver: {},
          platinum: {},
        };

        // Organize seat data by category and row
        data.forEach((category) => {
          Object.entries(category.seats).forEach(([row, seats]) => {
            if (!categorizedSeats[category.category][row]) {
              categorizedSeats[category.category][row] = [];
            }
            categorizedSeats[category.category][row].push(
              ...seats.map((seat) => ({
                ...seat,
                color: seat.color || "lightgrey",
              }))
            );
          });
        });

        setSeatsByCategory(categorizedSeats);
      })
      .catch((error) => console.error("Error fetching seat data:", error));

    const queryParams = new URLSearchParams(window.location.search);
    const seats = parseInt(queryParams.get("seats") || "1", 10);
    setMaxSeats(seats);

    const storedBookedSeats =
      JSON.parse(localStorage.getItem("bookedSeats")) || [];
 
      const storedSelectedSeats =JSON.parse(localStorage.getItem("selectedSeats")) || [];

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
      } 
      else
       {
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

    // Add new selected seats to the booked seats list
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
    <>
      <h1 className="seat-heading">Select Your Seat</h1>
      <div className="seatscreen-container">
        <div className="seat-grid">
          {Object.entries(seatsByCategory).map(([category, rowsObj]) => (
            <div key={category} className="seat-category-section">
              <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              {Object.entries(rowsObj).map(([row, seats]) => (
                <div key={row} className="seat-row">
                  {seats.map((seat) => (
                    <div
                      key={seat.number}
                      className={`seat ${
                        bookedSeats.includes(seat.number)
                          ? "booked"
                          : seat.status
                      } ${
                        selectedSeats.includes(seat.number) ? "selected" : ""
                      } ${seat.category ? seat.category : ""}`}
                      onClick={() => handleSeatClick(seat)}
                      style={{
                        cursor: bookedSeats.includes(seat.number)
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {seat.number}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

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
      </div>
    </>
  );
}
