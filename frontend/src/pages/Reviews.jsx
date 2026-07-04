import { useEffect, useState } from 'react';
import { reviewsAPI, locationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, renderStars } from '../utils/helpers';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data } = await reviewsAPI.getAll();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationName || !rating) return;

    setSubmitting(true);
    try {
      const { data: loc } = await locationsAPI.create({ name: locationName });
      await reviewsAPI.create({
        userId: user.id,
        locationId: loc.id,
        rating: parseInt(rating, 10),
        reviewText,
      });
      setLocationName('');
      setReviewText('');
      setRating('');
      loadReviews();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterRating
    ? reviews.filter((r) => r.Rating === parseInt(filterRating, 10))
    : reviews;

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h2>Community Reviews</h2>
        <p>Share your safety experiences to help others make informed decisions</p>
      </div>

      <form className="review-form card" onSubmit={handleSubmit}>
        <h3>Submit a Review</h3>
        <input
          type="text"
          placeholder="Location name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
        />
        <textarea
          placeholder="Write your review..."
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <select value={rating} onChange={(e) => setRating(e.target.value)} required>
          <option value="">Rate this location</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      <div className="review-filter card">
        <label>Filter by rating:</label>
        <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
          <option value="">All Ratings</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-inline"><div className="spinner" /></div>
      ) : (
        <div className="reviews-list">
          {filtered.map((review) => (
            <div key={review.ReviewID} className="review-card card">
              <div className="review-card-header">
                <strong>{review.LocationName}</strong>
                <span className="stars">{renderStars(review.Rating)}</span>
              </div>
              <p className="review-author">by {review.UserName}</p>
              <p>{review.ReviewText}</p>
              <small>{formatDate(review.ReviewDate)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
