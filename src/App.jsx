import React, { useState, createContext, useContext } from "react";
import { initialSpaces, initialBookings } from "./data.jsx";
import Layout from "./components/Layout.jsx";
import DashboardHome from "./components/DashboardHome.jsx";
import SpacesManager from "./components/SpacesManager.jsx";
import BookingSystem from "./components/BookingSystem.jsx";
import ReportsDashboard from "./components/ReportsDashboard.jsx";
import "./styles.css";

export const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [spaces, setSpaces] = useState(initialSpaces);
  const [bookings, setBookings] = useState(initialBookings);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addSpace = (space) => {
    const newSpace = { ...space, id: Date.now(), status: "available" };
    setSpaces((prev) => [...prev, newSpace]);
    return newSpace;
  };

  const updateSpace = (id, updatedData) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)),
    );
  };

  const updateSpaceStatus = (id, status) => {
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const deleteSpace = (id) => {
    setSpaces((prev) => prev.filter((s) => s.id !== id));
  };

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: `BK${String(bookings.length + 1).padStart(3, "0")}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBooking = (id, updatedData) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b)),
    );
  };

  const cancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
  };

  const deleteBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const contextValue = {
    currentPage,
    setCurrentPage,
    spaces,
    addSpace,
    updateSpace,
    updateSpaceStatus,
    deleteSpace,
    bookings,
    addBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    sidebarOpen,
    setSidebarOpen,
  };

  const pages = {
    home: DashboardHome,
    spaces: SpacesManager,
    booking: BookingSystem,
    reports: ReportsDashboard,
  };
  const PageComponent = pages[currentPage] || DashboardHome;

  return (
    <AppContext.Provider value={contextValue}>
      <Layout>
        <PageComponent />
      </Layout>
    </AppContext.Provider>
  );
}
