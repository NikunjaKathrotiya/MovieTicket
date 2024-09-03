import TicketBox from "./TicketBox";
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router";

test("renders TicketBox and selects seats", () => {
  
    render(
    <MemoryRouter initialEntries={["/Home"]}>
      <TicketBox />
    </MemoryRouter>
  );

  expect(screen.getByText(/How Many Seats/i)).toBeInTheDocument();
  const seatButton = screen.getByText("1");
  expect(seatButton).toBeInTheDocument();
  fireEvent.click(seatButton);
  expect(seatButton).toHaveClass("active");

});



//   expect(screen.getByText(/bookedSeats/i)).toBeInTheDocument();
//   const bookseat = screen.getByText("1");
//   expect(bookseat).toBeInTheDocument();
//   fireEvent.click(bookseat);
//   expect(bookseat).toHaveClass("active")

