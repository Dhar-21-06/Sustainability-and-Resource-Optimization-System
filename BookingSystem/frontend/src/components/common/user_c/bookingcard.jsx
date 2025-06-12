import './bookingcard.css';

function BookingCard({ room, time, icon, isAvailable }) {
  return (
    <div className={`booking-card ${isAvailable ? 'available' : 'unavailable'}`}>
      <img src={icon} alt="Time Icon" className="booking-icon" />
      <h3>{room}</h3>
      <p>{time}</p>
      <button disabled={!isAvailable}>
        {isAvailable ? 'Book Now' : 'Unavailable'}
      </button>
    </div>
  );
}

export default BookingCard;