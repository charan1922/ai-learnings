import type { ITTicket } from './types';

/**
 * Formats a ticket into a single text string optimised for embedding.
 * Includes all semantic fields so similar tickets cluster together in vector space.
 */
export function formatTicketForEmbedding(ticket: ITTicket): string {
  return [
    `Category: ${ticket.category}`,
    `Priority: ${ticket.priority}`,
    `Title: ${ticket.title}`,
    `Description: ${ticket.description}`,
    `Resolution: ${ticket.resolution ?? 'N/A'}`,
  ].join('\n');
}

/**
 * Formats an incoming (unresolved) ticket query for embedding.
 * Used at classify time — no resolution available yet.
 */
export function formatQueryForEmbedding(title: string, description: string): string {
  return [`Title: ${title}`, `Description: ${description}`].join('\n');
}
