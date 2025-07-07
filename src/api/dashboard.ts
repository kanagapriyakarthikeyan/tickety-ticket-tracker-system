import { apiRequest } from './client';
import { motion } from 'framer-motion';

export function getDashboardSummary() {
  return apiRequest('/dashboard/summary');
}
export function getRecentTickets() {
  return apiRequest('/dashboard/recent-tickets');
}
export function getTicketsByMonth() {
  return apiRequest('/dashboard/tickets-by-month');
}
export function getTicketsByPriority() {
  return apiRequest('/dashboard/tickets-by-priority');
}
export function getAverageResponseTime() {
  return apiRequest('/dashboard/average-response-time');
} 