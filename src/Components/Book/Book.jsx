import React from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "./Book.css";

export default function Book({ closeModal, handlePaymentSubmit, bookedSeats }) {
  const navigate = useNavigate();

  const notifySuccess = () => {
    toast.success("Payment Successful!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handlePaymentClick = () => {
    notifySuccess();
    console.log(bookedSeats);
    navigate("/", { state: { selectedSeats: bookedSeats } });
  };

  return ReactDOM.createPortal(
    <div className="book-container">
      <div className="box">
        <h1>Booking Summary</h1>
        <p>Total Tickets: {bookedSeats.length}</p>
        <div className="seat-list">
          {bookedSeats.length > 0 ? (
            bookedSeats.map((seat, index) => (
              <div key={index} className="booked-seat">
                {seat}
              </div>
            ))
          ) : (
            <p>No seats selected</p>
          )}
        </div>
        <button className="payment-btn" onClick={handlePaymentClick}>
          Proceed to Payment
        </button>
        <button className="cancel-btn" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>,
    document.getElementById("modal")
  );
}
