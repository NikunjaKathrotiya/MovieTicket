import React from "react";
import pay from "../../assets/payment.jpg";
import "../Payement/Payment.css";
export default function Payment() {
  return (
    <div>
      <div className="aligment">
        <img src={pay} className="pay" alt="pay" />
        <h1>Payment success </h1>
      </div>
    </div>
  );
}
