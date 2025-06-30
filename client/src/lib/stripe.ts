import { loadStripe } from '@stripe/stripe-js';

// Use a valid Stripe test publishable key
const stripePromise = loadStripe('pk_test_51O7XOK4DdSUH2LtzTxhDBJhnne2I7q2uR585v0VQ15rUlMwKdyOilLrPq8QNgF1gLsAnwYlbq0s5q6hZcaTaHPFg00UDazTENp');

export default stripePromise; 