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
  const [seatsByCategory, setSeatsByCategory] = useState({
    gold: { seats: {}, price: 0 },
    silver: { seats: {}, price: 0 },
    platinum: { seats: {}, price: 0 },
  });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [maxSeats, setMaxSeats] = useState(1);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  
    fetch("https://66cefbaf901aab24842067f7.mockapi.io/seats/seats")//conver json format to js object format
      .then((response) => response.json())
      .then((data) => {
        const categorizedSeats = {
          gold: { seats: {}, price: 0 },
          silver: { seats: {}, price: 0 },
          platinum: { seats: {}, price: 0 },
        };

        data.forEach((category) => {
          categorizedSeats[category.category].price = category.price;
          Object.entries(category.seats).forEach(([row, seats]) => {
            if (!categorizedSeats[category.category].seats[row]) {
              categorizedSeats[category.category].seats[row] = [];
            }
            categorizedSeats[category.category].seats[row].push(
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
    const storedSelectedSeats =
      JSON.parse(localStorage.getItem("selectedSeats")) || [];

    setBookedSeats(storedBookedSeats);
    setSelectedSeats(storedSelectedSeats);
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
    const bookedSeatsSet = new Set(bookedSeats);
    if (bookedSeatsSet.has(selectedSeats)) {
      alert(
        "The selected number of seats is already booked. Please choose a different number."
      );
      return;
    }
    console.log(bookedSeatsSet);

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

  const category = "gold"; 
  const pricePerSeat = seatsByCategory[category]?.price || 0;
  const totalPrice = selectedSeats.length * pricePerSeat;

  return (
    <>
      <h1 className="seat-heading">Select Your Seat</h1>
      <div className="seatscreen-container">
        <div className="seat-grid">
          {Object.entries(seatsByCategory).map(([category, { seats, price }]) => (
            <div key={category} className="seat-category-section">
              <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              {Object.entries(seats).map(([row, seatsList]) => (
                <div key={row} className="seat-row">
                  {seatsList.map((seat) => (
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
              <p>Price per seat: ${price}</p>
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
          <label>
            You have selected {selectedSeats.length} seats for a total price of ${totalPrice}
          </label>
        </div>
      </div>
    </>
  );
}
